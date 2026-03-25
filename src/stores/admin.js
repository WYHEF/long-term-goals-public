import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'

export const useAdminStore = defineStore('admin', () => {
  const isAdmin = ref(false)
  const adminInfo = ref(null)
  const loading = ref(false)
  const lastCheckedAt = ref(0)
  const lastCheckedUserId = ref(null)
  let checkPromise = null

  // 检查当前用户是否是管理员
  async function checkAdminStatus(force = false) {
    if (checkPromise) return checkPromise

    checkPromise = (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user
        if (!user) {
          isAdmin.value = false
          adminInfo.value = null
          lastCheckedAt.value = Date.now()
          lastCheckedUserId.value = null
          return false
        }

        const cacheMs = 5 * 60 * 1000
        if (!force && lastCheckedUserId.value === user.id && Date.now() - lastCheckedAt.value < cacheMs) {
          return isAdmin.value
        }

        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle()

        lastCheckedAt.value = Date.now()
        lastCheckedUserId.value = user.id

        if (error) {
          if (error.code !== 'PGRST116' && error.status !== 406) {
            console.error('查询管理员表出错:', error)
          }
          isAdmin.value = false
          adminInfo.value = null
          return false
        }

        if (!data) {
          isAdmin.value = false
          adminInfo.value = null
          return false
        }

        isAdmin.value = true
        adminInfo.value = data
        return true
      } catch (error) {
        console.error('检查管理员状态失败:', error)
        isAdmin.value = false
        adminInfo.value = null
        lastCheckedAt.value = Date.now()
        lastCheckedUserId.value = null
        return false
      } finally {
        checkPromise = null
      }
    })()

    return checkPromise
  }

  // 获取统计数据
  async function getStatistics() {
    loading.value = true
    try {
      const stats = {
        users: { total: 0, active: 0, new_today: 0 },
        goals: { total: 0, active: 0, completed: 0 },
        checkins: { total: 0, today: 0, thisWeek: 0 }
      }

      // 获取用户统计 - 从 goals 表统计唯一用户数
      const { data: goalsData } = await supabase
        .from('goals')
        .select('user_id, created_at')

      if (goalsData && goalsData.length > 0) {
        // 统计唯一用户数
        const uniqueUserIds = [...new Set(goalsData.map(g => g.user_id))]
        stats.users.total = uniqueUserIds.length

        // 统计今日新增用户（有今日创建的目标的用户）
        const today = new Date().toISOString().split('T')[0]
        const todayGoals = goalsData.filter(g => g.created_at?.startsWith(today))
        const todayUserIds = [...new Set(todayGoals.map(g => g.user_id))]
        stats.users.new_today = todayUserIds.length

        // 活跃用户（有进行中目标的用户）
        const { data: activeGoalsData } = await supabase
          .from('goals')
          .select('user_id')
          .eq('status', '进行中')
        
        if (activeGoalsData) {
          const activeUserIds = [...new Set(activeGoalsData.map(g => g.user_id))]
          stats.users.active = activeUserIds.length
        }
      }

      // 获取目标统计
      const { count: totalGoals } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true })
      stats.goals.total = totalGoals || 0

      const { count: activeGoals } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('status', '进行中')
      stats.goals.active = activeGoals || 0

      const { count: completedGoals } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('status', '已完成')
      stats.goals.completed = completedGoals || 0

      // 获取打卡统计
      const { count: totalCheckins } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
      stats.checkins.total = totalCheckins || 0

      const today = new Date().toISOString().split('T')[0]
      const { count: todayCheckins } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
      stats.checkins.today = todayCheckins || 0

      // 本周打卡统计
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      
      const { count: weekCheckins } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .gte('date', weekAgoStr)
      stats.checkins.thisWeek = weekCheckins || 0

      return stats
    } catch (error) {
      console.error('获取统计数据失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 获取所有用户
  async function getAllUsers(page = 1, pageSize = 20) {
    loading.value = true
    try {
      // 方案：从 goals 表获取所有 user_id（因为有目标的用户才是活跃用户）
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('user_id, created_at')
        .order('created_at', { ascending: false })

      if (goalsError) {
        console.error('获取目标数据失败:', goalsError)
      }

      // 获取唯一的用户ID列表
      const uniqueUserIds = [...new Set(goalsData?.map(g => g.user_id) || [])]
      
      // 如果没有用户，尝试从 user_settings 获取
      if (uniqueUserIds.length === 0) {
        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('user_id, created_at')
        
        if (!settingsError && settingsData) {
          uniqueUserIds.push(...settingsData.map(s => s.user_id))
        }
      }

      // 如果还是没有用户，返回空列表
      if (uniqueUserIds.length === 0) {
        console.warn('系统中没有找到任何用户数据')
        return {
          data: [],
          total: 0,
          page,
          pageSize
        }
      }

      // 分页处理
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedUserIds = uniqueUserIds.slice(start, end)

      // 获取用户设置
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .in('user_id', paginatedUserIds)

      // 获取每个用户的目标数量
      const userGoalCounts = {}
      if (goalsData) {
        goalsData.forEach(goal => {
          userGoalCounts[goal.user_id] = (userGoalCounts[goal.user_id] || 0) + 1
        })
      }

      // 获取用户创建时间（从第一个目标或设置获取）
      const userCreatedTimes = {}
      if (goalsData) {
        goalsData.forEach(goal => {
          if (!userCreatedTimes[goal.user_id] || goal.created_at < userCreatedTimes[goal.user_id]) {
            userCreatedTimes[goal.user_id] = goal.created_at
          }
        })
      }

      // 尝试通过RPC函数获取用户信息
      let userAuthInfo = {}
      try {
        const { data: authUsers, error: rpcError } = await supabase
          .rpc('get_users_info', { user_ids: paginatedUserIds })
        
        if (!rpcError && authUsers) {
          authUsers.forEach(u => {
            userAuthInfo[u.id] = {
              email: u.email,
              last_sign_in_at: u.last_sign_in_at,
              created_at: u.created_at
            }
          })
        } else if (rpcError) {
          console.error('RPC调用失败:', rpcError.message)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error.message)
      }
      
      // 组装用户信息
      const usersWithAuth = paginatedUserIds.map(userId => {
        const userSetting = settings?.find(s => s.user_id === userId)
        const authInfo = userAuthInfo[userId]
        
        return {
          user_id: userId,
          email: authInfo?.email || `用户_${userId.slice(0, 8)}`,
          created_at: authInfo?.created_at || userCreatedTimes[userId] || userSetting?.created_at || new Date().toISOString(),
          last_sign_in_at: authInfo?.last_sign_in_at || null,
          theme: userSetting?.theme || 'light',
          notification_enabled: userSetting?.notification_enabled !== false,
          goal_count: userGoalCounts[userId] || 0
        }
      })

      return {
        data: usersWithAuth,
        total: uniqueUserIds.length,
        page,
        pageSize
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      console.error('错误详情:', error.message)
      return { data: [], total: 0, page, pageSize }
    } finally {
      loading.value = false
    }
  }

  // 获取所有目标
  async function getAllGoals(page = 1, pageSize = 20, filters = {}) {
    loading.value = true
    try {
      const start = (page - 1) * pageSize
      const end = start + pageSize - 1

      let query = supabase
        .from('goals')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      const { data, error, count } = await query.range(start, end)

      if (error) throw error

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize
      }
    } catch (error) {
      console.error('获取目标列表失败:', error)
      return { data: [], total: 0, page, pageSize }
    } finally {
      loading.value = false
    }
  }

  // 获取所有打卡记录
  async function getAllCheckIns(page = 1, pageSize = 20, filters = {}) {
    loading.value = true
    try {
      const start = (page - 1) * pageSize
      const end = start + pageSize - 1

      let query = supabase
        .from('check_ins')
        .select('*, goals(title, type)', { count: 'exact' })
        .order('date', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.date) {
        query = query.eq('date', filters.date)
      }

      const { data, error, count } = await query.range(start, end)

      if (error) throw error

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize
      }
    } catch (error) {
      console.error('获取打卡记录失败:', error)
      return { data: [], total: 0, page, pageSize }
    } finally {
      loading.value = false
    }
  }

  // 获取用户详情
  async function getUserDetail(userId) {
    try {
      // 获取用户基本信息
      const { data: authData } = await supabase.auth.admin.getUserById(userId)
      
      // 获取用户设置
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      // 获取用户目标
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)

      // 获取用户打卡
      const { data: checkIns } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(10)

      return {
        user: authData?.user,
        settings,
        goals: goals || [],
        recentCheckIns: checkIns || []
      }
    } catch (error) {
      console.error('获取用户详情失败:', error)
      return null
    }
  }

  // 记录管理员操作日志
  async function logAction(action, targetType, targetId, details = {}) {
    try {
      await supabase.from('admin_logs').insert({
        admin_id: adminInfo.value?.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details
      })
    } catch (error) {
      console.error('记录操作日志失败:', error)
    }
  }

  // 获取活跃公告
  async function getActiveAnnouncements() {
    try {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      return data || []
    } catch (error) {
      console.error('获取公告失败:', error)
      return []
    }
  }

  return {
    isAdmin,
    adminInfo,
    loading,
    checkAdminStatus,
    getStatistics,
    getAllUsers,
    getAllGoals,
    getAllCheckIns,
    getUserDetail,
    logAction,
    getActiveAnnouncements
  }
})

