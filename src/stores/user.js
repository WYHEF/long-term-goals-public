import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth } from '@/config/supabase'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const loading = ref(false)
  
  // 初始化用户信息
  async function initUser() {
    loading.value = true
    try {
      const currentUser = await auth.getCurrentUser()
      user.value = currentUser
    } catch (error) {
      console.error('初始化用户失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  // 登录
  async function login(email, password) {
    loading.value = true
    try {
      const { data, error } = await auth.signIn(email, password)
      if (error) throw error
      user.value = data.user
      return { success: true }
    } catch (error) {
      // 中文化错误信息
      let errorMsg = error.message
      if (errorMsg.includes('Email not confirmed')) {
        errorMsg = '请前往邮箱验证后再登录。如未收到邮件，请检查垃圾邮件箱。'
      } else if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = '邮箱或密码错误，请重试'
      } else if (errorMsg.includes('User not found')) {
        errorMsg = '该邮箱尚未注册'
      } else if (errorMsg.includes('Invalid email')) {
        errorMsg = '邮箱格式不正确'
      } else if (errorMsg.includes('Failed to fetch')) {
        errorMsg = '连接服务器失败，请检查网络连接。如果问题持续，可能是服务暂时不可用。'
      }
      return { success: false, error: errorMsg }
    } finally {
      loading.value = false
    }
  }
  
  // 注册
  async function register(email, password) {
    loading.value = true
    try {
      const { data, error } = await auth.signUp(email, password)
      if (error) throw error
      user.value = data.user
      return { success: true, message: '注册成功！请前往邮箱查收验证邮件。' }
    } catch (error) {
      // 中文化错误信息
      let errorMsg = error.message
      if (errorMsg.includes('already registered')) {
        errorMsg = '该邮箱已被注册，请直接登录'
      } else if (errorMsg.includes('Invalid email')) {
        errorMsg = '邮箱格式不正确'
      } else if (errorMsg.includes('Password should be at least')) {
        errorMsg = '密码至少需要6个字符'
      } else if (errorMsg.includes('Failed to fetch')) {
        errorMsg = '连接服务器失败，请检查网络连接。如果问题持续，可能是服务暂时不可用。'
      }
      return { success: false, error: errorMsg }
    } finally {
      loading.value = false
    }
  }
  
  // 登出
  async function logout() {
    loading.value = true
    try {
      const { error } = await auth.signOut()
      if (error) throw error
      user.value = null
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }
  
  return {
    user,
    loading,
    initUser,
    login,
    register,
    logout
  }
})

