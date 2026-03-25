<template>
  <ToastContainer />
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { auth } from '@/config/supabase'
import ToastContainer from '@/components/ToastContainer.vue'

const userStore = useUserStore()
const themeStore = useThemeStore()

onMounted(async () => {
  // 初始化主题
  themeStore.setTheme(themeStore.theme)
  
  // 初始化用户信息
  await userStore.initUser()
  
  // 监听认证状态变化
  auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      userStore.user = session.user
    } else if (event === 'SIGNED_OUT') {
      userStore.user = null
    }
  })
})
</script>

