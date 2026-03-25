import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'
import { useUserStore } from './user'
import dayjs from 'dayjs'

export const useGoalsStore = defineStore('goals', () => {
  const goals = ref([])
  const loading = ref(false)
  
  // 计算属性
  const activeGoals = computed(() => 
    goals.value.filter(g => g.status === '进行中')
  )
  
  const pausedGoals = computed(() => 
    goals.value.filter(g => g.status === '已暂停')
  )
  
  const completedGoals = computed(() => 
    goals.value.filter(g => g.status === '已完成')
  )
  
  // 获取所有目标
  async function fetchGoals(options = {}) {
    const { select = '*' } = options || {}
    loading.value = true
    try {
      const userStore = useUserStore()
      if (!userStore.user?.id) {
        console.error('用户未登录')
        goals.value = []
        return
      }
      
      const { data, error } = await supabase
        .from('goals')
        .select(select)
        .eq('user_id', userStore.user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      goals.value = data || []
      return goals.value
    } catch (error) {
      console.error('获取目标失败:', error)
      goals.value = []
      return []
    } finally {
      loading.value = false
    }
  }
  
  // 根据ID获取目标
  async function getGoalById(id) {
    try {
      const userStore = useUserStore()
      if (!userStore.user?.id) {
        console.error('用户未登录')
        return null
      }
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .eq('user_id', userStore.user.id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('获取目标详情失败:', error)
      return null
    }
  }
  
  // 创建目标
  async function createGoal(goalData) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select()
        .single()
      
      if (error) throw error
      goals.value.unshift(data)
      return { success: true, data }
    } catch (error) {
      console.error('创建目标失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }
  
  // 更新目标
  async function updateGoal(id, updates) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      // 更新本地状态
      const index = goals.value.findIndex(g => g.id === id)
      if (index !== -1) {
        goals.value[index] = data
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('更新目标失败:', error)
      return { success: false, error: error.message }
    }
  }
  
  // 删除目标
  async function deleteGoal(id) {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // 从本地状态移除
      goals.value = goals.value.filter(g => g.id !== id)
      return { success: true }
    } catch (error) {
      console.error('删除目标失败:', error)
      return { success: false, error: error.message }
    }
  }
  
  // 暂停目标
  async function pauseGoal(id) {
    return updateGoal(id, { status: '已暂停' })
  }
  
  // 恢复目标
  async function resumeGoal(id) {
    return updateGoal(id, { status: '进行中' })
  }
  
  // 完成目标
  async function completeGoal(id) {
    return updateGoal(id, { 
      status: '已完成',
      completed_at: new Date().toISOString()
    })
  }
  
  return {
    goals,
    loading,
    activeGoals,
    pausedGoals,
    completedGoals,
    fetchGoals,
    getGoalById,
    createGoal,
    updateGoal,
    deleteGoal,
    pauseGoal,
    resumeGoal,
    completeGoal
  }
})

