import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 从 localStorage 读取主题设置，默认为 'light'
  const theme = ref(localStorage.getItem('theme') || 'light')
  
  // 应用主题到 DOM
  function applyTheme(newTheme) {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  // 切换主题
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  
  // 设置主题
  function setTheme(newTheme) {
    theme.value = newTheme
  }
  
  // 监听主题变化，保存到 localStorage 并应用到 DOM
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }, { immediate: true })
  
  // 初始化时应用主题
  applyTheme(theme.value)
  
  return {
    theme,
    toggleTheme,
    setTheme
  }
})

