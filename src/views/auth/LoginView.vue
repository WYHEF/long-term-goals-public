<template>
  <div class="min-h-screen bg-blue-50/50 dark:bg-gray-900">
    <!-- 顶部导航栏 -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center space-x-3">
            <img src="/assets/星煜凡程透明.png" alt="星煜凡程" class="h-10 w-auto" />
            <span class="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              星煜凡程
            </span>
          </router-link>
          
          <!-- 右侧按钮 -->
          <div class="flex items-center space-x-4">
            <!-- 主题切换按钮 -->
            <button
              @click="toggleTheme"
              class="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              :title="themeStore.theme === 'light' ? '切换到深色模式' : '切换到浅色模式'"
            >
              <MoonIcon v-if="themeStore.theme === 'light'" class="w-5 h-5" />
              <SunIcon v-else class="w-5 h-5" />
            </button>
            
            <router-link 
              to="/"
              class="flex items-center space-x-2 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeftIcon class="w-4 h-4" />
              <span>返回首页</span>
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <div class="min-h-screen flex items-center justify-center px-4 py-12 pt-24">
    <div class="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center">
      <!-- 左侧：品牌展示 -->
      <div class="hidden md:block">
        <div class="mb-10 text-center">
          <img src="/assets/星煜凡程透明.png" alt="星煜凡程" class="h-24 w-auto mx-auto mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <h2 class="text-sm font-bold text-blue-500 tracking-[0.2em] mb-2 uppercase">
            ORDINARY EFFORTS, STARRY GLORY
          </h2>
          <h1 class="text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight mb-4 tracking-tight">
            星煜凡程
          </h1>
          <h2 class="text-3xl font-bold text-gray-800 dark:text-white leading-tight mb-4">
            凡程蓄力，星途煜辉
          </h2>
          <p class="text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto font-medium">
            让长期目标也能获得及时反馈，通过AI驱动的智能规划与可视化追踪，助你达成每一个愿望。
          </p>
        </div>
        
        <!-- 功能亮点 -->
        <div class="space-y-4 max-w-md mx-auto">
          <div class="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div class="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ClipboardDocumentListIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white mb-0.5">智能规划</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">DeepSeek AI 自动拆解目标，生成可执行计划</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div class="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
              <ChartBarIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white mb-0.5">可视化进度</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">GitHub 风格热力图，直观展示打卡记录</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div class="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400">
              <FireIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white mb-0.5">连续打卡</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">培养习惯，记录成长，见证每一布进步</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧：登录/注册表单 -->
      <div class="w-full">
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8">
          <!-- 移动端 Logo -->
          <div class="md:hidden text-center mb-8">
            <img src="/assets/星煜凡程透明.png" alt="星煜凡程" class="h-12 w-auto mx-auto mb-3" />
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              星煜凡程
            </h2>
          </div>
          
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {{ mode === 'login' ? '欢迎回来' : '创建账户' }}
            </h2>
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              {{ mode === 'login' ? '请输入您的账号信息以继续' : '开始您的目标达成之旅' }}
            </p>
          </div>
          
          <!-- Tab 切换 -->
          <div class="flex mb-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-1.5 border border-gray-100 dark:border-gray-600">
            <button
              @click="mode = 'login'"
              :class="[
                'flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200',
                mode === 'login'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              ]"
            >
              登录
            </button>
            <button
              @click="mode = 'register'"
              :class="[
                'flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200',
                mode === 'register'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              ]"
            >
              注册
            </button>
          </div>
          
          <!-- 表单 -->
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 pl-1">
                邮箱地址
              </label>
              <input
                v-model="email"
                type="email"
                required
                placeholder="name@example.com"
                class="w-full px-5 py-3.5 bg-blue-50/50 dark:bg-gray-700/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-gray-700 transition-all text-gray-900 dark:text-white placeholder-gray-400 font-medium"
                :disabled="loading"
              />
            </div>
            
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 pl-1">
                密码
              </label>
              <input
                v-model="password"
                type="password"
                required
                :placeholder="mode === 'register' ? '设置密码 (至少6位)' : '请输入密码'"
                class="w-full px-5 py-3.5 bg-blue-50/50 dark:bg-gray-700/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-gray-700 transition-all text-gray-900 dark:text-white placeholder-gray-400 font-medium"
                :disabled="loading"
                :minlength="mode === 'register' ? 6 : undefined"
              />
            </div>
            
            <div v-if="mode === 'register'">
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 pl-1">
                确认密码
              </label>
              <input
                v-model="confirmPassword"
                type="password"
                required
                placeholder="再次输入密码"
                class="w-full px-5 py-3.5 bg-blue-50/50 dark:bg-gray-700/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-gray-700 transition-all text-gray-900 dark:text-white placeholder-gray-400 font-medium"
                :disabled="loading"
              />
            </div>
            
            <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg flex items-start">
              <ExclamationCircleIcon class="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p class="text-sm font-medium text-red-600 dark:text-red-400">
                {{ error }}
              </p>
            </div>
            
            <div v-if="successMessage" class="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg flex items-start">
              <CheckCircleIcon class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <p class="text-sm font-medium text-green-600 dark:text-green-400">
                {{ successMessage }}
              </p>
            </div>
            
            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-8 text-lg"
            >
              <span v-if="loading" class="flex items-center">
                <ArrowPathIcon class="animate-spin -ml-1 mr-2 h-4 w-4" />
                处理中...
              </span>
              <span v-else>{{ mode === 'login' ? '登录' : '注册账户' }}</span>
            </button>
          </form>
          
          <div v-if="mode === 'register'" class="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
            注册即表示同意我们的
            <router-link to="/terms" class="text-blue-600 dark:text-blue-400 hover:underline">服务条款</router-link>
            和
            <router-link to="/privacy" class="text-blue-600 dark:text-blue-400 hover:underline">隐私政策</router-link>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { 
  ClipboardDocumentListIcon, 
  ChartBarIcon, 
  FireIcon, 
  ExclamationCircleIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  MoonIcon,
  SunIcon,
  ArrowLeftIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const mode = ref('login')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

function toggleTheme() {
  themeStore.toggleTheme()
}

async function handleSubmit() {
  error.value = ''
  successMessage.value = ''
  
  // 注册时验证密码
  if (mode.value === 'register') {
    if (password.value !== confirmPassword.value) {
      error.value = '两次输入的密码不一致'
      return
    }
    if (password.value.length < 6) {
      error.value = '密码至少需要6个字符'
      return
    }
  }
  
  loading.value = true
  
  try {
    let result
    if (mode.value === 'login') {
      result = await userStore.login(email.value, password.value)
    } else {
      result = await userStore.register(email.value, password.value)
    }
    
    if (result.success) {
      // 注册成功显示提示
      if (mode.value === 'register' && result.message) {
        successMessage.value = result.message
        // 3秒后自动切换到登录页面
        setTimeout(() => {
          mode.value = 'login'
          successMessage.value = ''
        }, 3000)
      } else {
        router.push('/app/today')
      }
    } else {
      error.value = result.error || '操作失败，请重试'
    }
  } catch (e) {
    error.value = e.message || '发生未知错误'
  } finally {
    loading.value = false
  }
}
</script>

