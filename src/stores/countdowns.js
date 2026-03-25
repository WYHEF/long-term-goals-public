import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/config/supabase'
import { useUserStore } from './user'

export const useCountdownsStore = defineStore('countdowns', () => {
  const countdowns = ref([])
  const loading = ref(false)
  
  // 获取所有倒数日
  async function fetchCountdowns() {
    loading.value = true
    try {
      const userStore = useUserStore()
      if (!userStore.user?.id) {
        console.error('用户未登录')
        countdowns.value = []
        return
      }
      
      const { data, error } = await supabase
        .from('countdowns')
        .select('*')
        .eq('user_id', userStore.user.id)
        .order('is_pinned', { ascending: false })
        .order('target_date', { ascending: true })
      
      if (error) throw error
      countdowns.value = data || []
    } catch (error) {
      console.error('获取倒数日失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  // 创建倒数日
  async function createCountdown(countdownData) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('countdowns')
        .insert([countdownData])
        .select()
        .single()
      
      if (error) throw error
      countdowns.value.unshift(data)
      
      // 重新排序
      await fetchCountdowns()
      
      return { success: true, data }
    } catch (error) {
      console.error('创建倒数日失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }
  
  // 更新倒数日
  async function updateCountdown(id, countdownData) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('countdowns')
        .update(countdownData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      // 更新本地状态
      const index = countdowns.value.findIndex(c => c.id === id)
      if (index !== -1) {
        countdowns.value[index] = data
      }
      
      // 重新排序
      await fetchCountdowns()
      
      return { success: true, data }
    } catch (error) {
      console.error('更新倒数日失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }
  
  // 删除倒数日
  async function deleteCountdown(id) {
    try {
      const { error } = await supabase
        .from('countdowns')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      countdowns.value = countdowns.value.filter(c => c.id !== id)
      return { success: true }
    } catch (error) {
      console.error('删除倒数日失败:', error)
      return { success: false, error: error.message }
    }
  }
  
  // 切换置顶状态
  async function togglePin(id) {
    const countdown = countdowns.value.find(c => c.id === id)
    if (!countdown) return
    
    return await updateCountdown(id, { is_pinned: !countdown.is_pinned })
  }
  
  // 标记为完成
  async function markAsCompleted(id, completed = true) {
    return await updateCountdown(id, { is_completed: completed })
  }
  
  return {
    countdowns,
    loading,
    fetchCountdowns,
    createCountdown,
    updateCountdown,
    deleteCountdown,
    togglePin,
    markAsCompleted
  }
})

