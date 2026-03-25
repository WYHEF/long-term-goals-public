import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase配置缺失！请在.env文件中配置VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY')
  throw new Error('Supabase configuration is missing')
}

// 调试信息：检查URL是否正确加载
console.log('Supabase Configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 导出辅助函数
export const auth = {
  // 注册
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },
  
  // 登录
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },
  
  // 登出
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },
  
  // 获取当前用户
  async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user || null
  },
  
  // 监听认证状态变化
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

