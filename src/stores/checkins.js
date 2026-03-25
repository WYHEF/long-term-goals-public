import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/config/supabase'
import { useUserStore } from './user'
import dayjs from 'dayjs'

export const useCheckInsStore = defineStore('checkins', () => {
  const checkIns = ref([])
  const loading = ref(false)
  const queryCache = new Map()

  function buildCacheKey({ userId, goalId, startDate, endDate, select }) {
    return [userId || '', goalId || '', startDate || '', endDate || '', select || ''].join('|')
  }

  function pruneCache(maxSize = 60) {
    if (queryCache.size <= maxSize) return
    const entries = Array.from(queryCache.entries()).sort((a, b) => (a[1]?.ts || 0) - (b[1]?.ts || 0))
    const removeCount = queryCache.size - maxSize
    for (let i = 0; i < removeCount; i++) {
      queryCache.delete(entries[i][0])
    }
  }
  
  // 获取打卡记录
  async function fetchCheckIns(goalId = null, startDate = null, endDate = null, options = {}) {
    loading.value = true
    try {
      const {
        select = '*',
        storeResult = true,
        useCache = true,
        cacheTtlMs = 5 * 60 * 1000
      } = options || {}

      const userStore = useUserStore()
      if (!userStore.user?.id) {
        console.error('用户未登录')
        if (storeResult) checkIns.value = []
        return []
      }
      
      const cacheKey = buildCacheKey({
        userId: userStore.user.id,
        goalId,
        startDate,
        endDate,
        select
      })

      if (useCache) {
        const cached = queryCache.get(cacheKey)
        if (cached && Date.now() - cached.ts < cacheTtlMs) {
          if (storeResult) checkIns.value = cached.data || []
          return cached.data || []
        }
      }

      let query = supabase.from('check_ins').select(select).eq('user_id', userStore.user.id)
      
      if (goalId) {
        query = query.eq('goal_id', goalId)
      }
      
      if (startDate) {
        query = query.gte('date', startDate)
      }
      
      if (endDate) {
        query = query.lte('date', endDate)
      }
      
      const { data, error } = await query.order('date', { ascending: false })
      
      if (error) throw error
      if (storeResult) checkIns.value = data || []
      if (useCache) {
        queryCache.set(cacheKey, { data: data || [], ts: Date.now() })
        pruneCache()
      }
      return data
    } catch (error) {
      console.error('获取打卡记录失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  async function getCheckInsCount(goalId = null, startDate = null, endDate = null) {
    try {
      const userStore = useUserStore()
      if (!userStore.user?.id) {
        console.error('用户未登录')
        return 0
      }

      let query = supabase
        .from('check_ins')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userStore.user.id)

      if (goalId) {
        query = query.eq('goal_id', goalId)
      }

      if (startDate) {
        query = query.gte('date', startDate)
      }

      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { error, count } = await query
      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('获取打卡总数失败:', error)
      return 0
    }
  }
  
  // 统一有效日期（通用，不区分目标）
  function getEffectiveDate() {
    const now = dayjs()
    return now.hour() < 2 
      ? now.subtract(1, 'day').format('YYYY-MM-DD')
      : now.format('YYYY-MM-DD')
  }

  // 目标级有效日期（喝水必须当天）
  async function getEffectiveDateForGoal(goalId) {
    const now = dayjs()
    if (now.hour() >= 2) return now.format('YYYY-MM-DD')
    // 02:00 之前
    // 判断是否为喝水目标，喝水不跨日
    const { data: goal } = await supabase
      .from('goals')
      .select('type, sub_type')
      .eq('id', goalId)
      .single()
    if (goal?.type === '健康类' && goal?.sub_type === '喝水') {
      return now.format('YYYY-MM-DD')
    }
    const yesterday = now.subtract(1, 'day').format('YYYY-MM-DD')
    const { data: yCompleted } = await supabase
      .from('check_ins')
      .select('id')
      .eq('goal_id', goalId)
      .eq('date', yesterday)
      .eq('status', 'completed')
    return (yCompleted && yCompleted.length > 0) 
      ? now.format('YYYY-MM-DD')
      : yesterday
  }

  // 获取“有效日期”的打卡记录（首页今日任务）
  async function getTodayCheckIns() {
    const effective = getEffectiveDate()
    return fetchCheckIns(null, effective, effective, {
      select: 'id, goal_id, date, status, learning_data, health_data, created_at',
      storeResult: false,
      useCache: true
    })
  }
  
  // 获取指定日期范围的打卡记录
  async function getCheckInsByDateRange(startDate, endDate, options = {}) {
    return fetchCheckIns(null, startDate, endDate, {
      select: 'id, goal_id, date, status, learning_data, health_data, created_at',
      storeResult: false,
      useCache: true,
      ...(options || {})
    })
  }
  
  // 获取指定日期的打卡记录
  async function getCheckInsByDate(date, options = {}) {
    return fetchCheckIns(null, date, date, {
      select: 'id, goal_id, date, status, learning_data, health_data, created_at',
      storeResult: false,
      useCache: true,
      ...(options || {})
    })
  }
  
  // 检查今日是否已打卡
  async function hasCheckedInToday(goalId) {
    const today = await getEffectiveDateForGoal(goalId)
    const { data, error } = await supabase
      .from('check_ins')
      .select('id')
      .eq('goal_id', goalId)
      .eq('date', today)
      .single()
    
    return !!data
  }
  
  // 创建打卡记录
  async function createCheckIn(checkInData) {
    loading.value = true
    try {
      // 判断是否为累积打卡类型（喝水、运动等可以多次打卡）
      const isCumulativeType = checkInData.health_data && 
        (checkInData.health_data.waterCups !== undefined || 
         checkInData.health_data.exercises !== undefined)
      
      // 非累积打卡类型才检查是否已打卡
      if (!isCumulativeType) {
        const alreadyChecked = await hasCheckedInToday(checkInData.goal_id)
        if (alreadyChecked) {
          return { success: false, error: '今日已打卡' }
        }
      }
      
      const { data, error } = await supabase
        .from('check_ins')
        .insert([{ 
          ...checkInData,
          date: checkInData.date || await getEffectiveDateForGoal(checkInData.goal_id),
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      checkIns.value.unshift(data)
      
      // 更新目标进度
      await updateGoalProgress(checkInData.goal_id)
      
      return { success: true, data }
    } catch (error) {
      console.error('创建打卡记录失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }
  
  // 更新目标进度
  async function updateGoalProgress(goalId) {
    try {
      const { data: goal } = await supabase
        .from('goals')
        .select('start_date, end_date, created_at, type, sub_type')
        .eq('id', goalId)
        .single()

      if (!goal) return

      const startDate = dayjs(goal.start_date || goal.created_at)
      const endDate = goal.end_date ? dayjs(goal.end_date) : null

      let percentage = 0
      let completedDays = 0

      if (endDate) {
        // 有截止日期：按总周期计算百分比
        const { data: checkIns } = await supabase
          .from('check_ins')
          .select('status')
          .eq('goal_id', goalId)
          .eq('status', 'completed')

        completedDays = checkIns ? checkIns.length : 0
        const totalDays = endDate.diff(startDate, 'day') + 1
        percentage = Math.min(Math.round((completedDays / totalDays) * 100), 100)
      } else {
        const windowDays = 14
        const windowStart = dayjs().subtract(windowDays - 1, 'day').format('YYYY-MM-DD')
        const { data: windowCheckIns } = await supabase
          .from('check_ins')
          .select('status, date, health_data')
          .eq('goal_id', goalId)
          .gte('date', windowStart)
          .order('date', { ascending: true })

        if (!windowCheckIns || windowCheckIns.length === 0) {
          percentage = 0
          completedDays = 0
        } else if (goal.type === '健康类' && goal.sub_type === '喝水') {
          const byDate = {}
          for (const ci of windowCheckIns) {
            const key = ci.date
            if (!byDate[key]) byDate[key] = { cups: 0, target: 0, status: ci.status }
            const cups = ci.health_data?.waterCups || 0
            const target = ci.health_data?.targetCups || 0
            byDate[key].cups += cups
            byDate[key].target = Math.max(byDate[key].target, target)
            if (ci.status === 'completed') byDate[key].status = 'completed'
          }
          let scoreSum = 0
          let fullDays = 0
          for (const k in byDate) {
            const t = byDate[k]
            const target = t.target || 8
            const ratio = Math.min(t.cups / target, 1)
            const score = t.status === 'completed' ? 1 : ratio
            scoreSum += score
            if (score >= 1) fullDays++
          }
          completedDays = fullDays
          percentage = Math.min(Math.round((scoreSum / windowDays) * 100), 100)
        } else {
          const uniqueDates = new Set()
          for (const ci of windowCheckIns) {
            if (ci.status === 'completed') uniqueDates.add(ci.date)
          }
          completedDays = uniqueDates.size
          percentage = Math.min(Math.round((completedDays / windowDays) * 100), 100)
        }
      }

      await supabase
        .from('goals')
        .update({ 
          progress: { 
            percentage,
            completedDays
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
    } catch (error) {
      console.error('更新目标进度失败:', error)
    }
  }
  
  // 获取连续打卡天数
  async function getStreakDays(goalId, checkInsList = null) {
    try {
      const userStore = useUserStore()
      if (!userStore.user?.id) {
        console.error('用户未登录')
        return 0
      }
      
      let data = checkInsList
      
      if (!data) {
        const response = await supabase
          .from('check_ins')
          .select('date, status')
          .eq('user_id', userStore.user.id)
          .eq('goal_id', goalId)
          .eq('status', 'completed')
          .order('date', { ascending: false })
        data = response.data
      } else {
        // 如果传入了列表，需要过滤出该目标已完成的记录，并按日期降序排序
        data = checkInsList
          .filter(c => c.goal_id === goalId && c.status === 'completed')
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      }
      
      if (!data || data.length === 0) return 0
      
      let streak = 0
      
      // 从今天（或昨天，如果是凌晨且昨天没打卡）开始算
      const now = dayjs()
      const today = now.format('YYYY-MM-DD')
      const yesterday = now.subtract(1, 'day').format('YYYY-MM-DD')
      
      // 检查最近一次打卡是否是今天或昨天
      const lastCheckInDate = dayjs(data[0].date).format('YYYY-MM-DD')
      
      // 如果最近一次打卡不是今天也不是昨天，说明断了（除非是凌晨时段补打卡的情况，这里简化处理）
      if (lastCheckInDate !== today && lastCheckInDate !== yesterday) {
        // 特殊情况：如果是凌晨，允许前天打卡算连续（因为昨天可能还没打）
        // 但这里为了简单，只看最近的。如果断了很久，streak就是0。
        // 如果最近一次是前天，那streak应该是0（因为昨天断了）。
        return 0
      }
      
      // 计算连续天数
      // 这种算法假设data已经是按日期降序排列的
      let expectedDate = dayjs(data[0].date)
      
      for (const checkIn of data) {
        const checkInDate = dayjs(checkIn.date)
        
        // 如果是同一天（可能是多次打卡），跳过
        if (checkIn !== data[0] && checkInDate.isSame(dayjs(data[data.indexOf(checkIn)-1].date), 'day')) {
          continue
        }
        
        // 检查是否连续（允许日期间隔为1天）
        // 注意：data[0]肯定是连续的第一天（基准）
        const diff = expectedDate.diff(checkInDate, 'day')
        
        if (diff === 0) {
          streak++
          expectedDate = expectedDate.subtract(1, 'day')
        } else {
          break
        }
      }
      
      return streak
    } catch (error) {
      console.error('获取连续打卡天数失败:', error)
      return 0
    }
  }
  
  // 更新打卡记录
  async function updateCheckIn(checkInId, updates) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', checkInId)
        .select()
        .single()
      
      if (error) throw error
      
      // 更新本地数据
      const index = checkIns.value.findIndex(c => c.id === checkInId)
      if (index !== -1) {
        checkIns.value[index] = data
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('更新打卡记录失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }
  
  // 重新计算所有目标的进度（用于修复错误数据）
  async function recalculateAllProgress(userId) {
    try {
      // 获取用户的所有进行中的目标
      const { data: goals } = await supabase
        .from('goals')
        .select('id')
        .eq('user_id', userId)
        .eq('status', '进行中')
      
      if (!goals || goals.length === 0) return
      
      // 逐个更新进度
      for (const goal of goals) {
        await updateGoalProgress(goal.id)
      }
      
      console.log('所有目标进度已重新计算')
    } catch (error) {
      console.error('重新计算进度失败:', error)
    }
  }
  
  return {
    checkIns,
    loading,
    fetchCheckIns,
    getCheckInsCount,
    getTodayCheckIns,
    getCheckInsByDateRange,
    getCheckInsByDate,
    hasCheckedInToday,
    createCheckIn,
    updateCheckIn,
    getEffectiveDate,
    getEffectiveDateForGoal,
    getStreakDays,
    updateGoalProgress,
    recalculateAllProgress
  }
})

