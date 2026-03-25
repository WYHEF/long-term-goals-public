import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/config/supabase'
import { useUserStore } from './user'

export const useIdeasStore = defineStore('ideas', () => {
  const ideas = ref([])
  const loading = ref(false)
  
  // 获取所有想法
  async function fetchIdeas() {
    loading.value = true
    try {
      const userStore = useUserStore()
      if (!userStore.user?.id) {
        console.error('用户未登录')
        ideas.value = []
        return
      }
      
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', userStore.user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      ideas.value = data || []
    } catch (error) {
      console.error('获取想法失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  // 创建想法
  async function createIdea(ideaData) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('ideas')
        .insert([{
          ...ideaData,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      ideas.value.unshift(data)
      return { success: true, data }
    } catch (error) {
      console.error('创建想法失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }
  
  // 更新想法
  async function updateIdea(id, ideaData) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('ideas')
        .update(ideaData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      // 更新本地状态
      const index = ideas.value.findIndex(i => i.id === id)
      if (index !== -1) {
        ideas.value[index] = data
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('更新想法失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }
  
  // 删除想法
  async function deleteIdea(id) {
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      ideas.value = ideas.value.filter(i => i.id !== id)
      return { success: true }
    } catch (error) {
      console.error('删除想法失败:', error)
      return { success: false, error: error.message }
    }
  }
  
  // 将想法转换为目标
  async function convertToGoal(id) {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .update({ status: 'converted' })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      // 更新本地状态
      const index = ideas.value.findIndex(i => i.id === id)
      if (index !== -1) {
        ideas.value[index] = data
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('转换想法失败:', error)
      return { success: false, error: error.message }
    }
  }
  
  return {
    ideas,
    loading,
    fetchIdeas,
    createIdea,
    updateIdea,
    deleteIdea,
    convertToGoal
  }
})

