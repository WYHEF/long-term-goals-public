<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- 顶部导航栏 -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div class="w-full max-w-full px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link 
              to="/" 
              class="flex items-center space-x-2"
              title="凡程蓄力，星途煜辉"
            >
              <img src="/assets/星煜凡程透明.png" alt="星煜凡程" class="h-8 w-auto" />
              <span class="text-2xl font-bold hidden sm:block" style="background: linear-gradient(to right, #0FA2FC, #0D2995); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text">
                星煜凡程
              </span>
            </router-link>
          </div>
          
          <!-- 桌面端导航 -->
          <nav class="hidden md:flex items-center space-x-1">
            <router-link
              v-for="item in navItems.filter(i => i.path !== '/app/settings')"
              :key="item.path"
              :to="item.path"
              class="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center text-sm font-medium"
              active-class="bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
            >
              <component :is="item.icon" class="w-5 h-5 mr-2" />
              {{ item.label }}
            </router-link>
          </nav>
          
          <!-- 右侧功能区 -->
          <div class="flex items-center space-x-3">
            <!-- 快速记录 -->
            <button
              @click="showQuickInput = true"
              class="hidden sm:flex btn btn-primary btn-sm items-center"
            >
              <PlusIcon class="w-4 h-4 mr-1" />
              快速记录
            </button>
            <button
              @click="showQuickInput = true"
              class="sm:hidden p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            >
              <PlusIcon class="w-6 h-6" />
            </button>

            <!-- 主题切换按钮 -->
            <button
              @click="toggleTheme"
              class="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              :title="themeStore.theme === 'light' ? '切换到深色模式' : '切换到浅色模式'"
            >
              <MoonIcon v-if="themeStore.theme === 'light'" class="w-5 h-5" />
              <SunIcon v-else class="w-5 h-5" />
            </button>

            <!-- 用户菜单 -->
            <div class="relative" ref="userMenuRef">
              <button 
                @click.stop="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
              >
                <!-- 头像 -->
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden">
                  <img
                    v-if="userAvatarUrl"
                    :src="userAvatarUrl"
                    alt="头像"
                    class="w-full h-full object-cover"
                  />
                  <span v-else>{{ userInitials }}</span>
                </div>
                <!-- 昵称 -->
                <div class="hidden lg:flex flex-col items-start mr-1">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-200 leading-none mb-0.5">
                    {{ userDisplayName }}
                  </span>
                </div>
                <ChevronDownIcon 
                  class="w-4 h-4 text-gray-500 transition-transform duration-200 hidden lg:block"
                  :class="{ 'transform rotate-180': showUserMenu }"
                />
              </button>

              <!-- 下拉菜单 -->
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div 
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 dark:divide-gray-700 z-50 origin-top-right"
                >
                  <!-- 用户信息 -->
                  <div class="px-4 py-3">
                    <p class="text-xs text-gray-500 dark:text-gray-400">已登录账号</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mt-0.5">
                      {{ userEmail }}
                    </p>
                  </div>

                  <!-- 菜单项 -->
                  <div class="py-1">
                    <router-link 
                      to="/app/settings" 
                      class="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      @click="showUserMenu = false"
                    >
                      <Cog6ToothIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      设置
                    </router-link>
                  </div>

                  <!-- 退出登录 -->
                  <div class="py-1">
                    <button 
                      @click="handleLogout"
                      class="w-full group flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon class="mr-3 h-5 w-5 text-red-400 group-hover:text-red-600 transition-colors" />
                      退出登录
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
<router-view />
    </main>
    
    <!-- 移动端底部导航 -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 pb-safe">
      <div class="flex items-center justify-around">
        <router-link
          v-for="item in mobileNavItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center py-3 px-4 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          active-class="text-primary-600 dark:text-primary-400"
        >
          <component :is="item.icon" class="w-6 h-6 mb-1" />
          <span class="text-[10px] font-medium">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
    
    <!-- 快捷输入框（悬浮） -->
    <QuickInputModal v-model:show="showQuickInput" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { supabase } from '@/config/supabase'
import QuickInputModal from '@/components/QuickInputModal.vue'
import { 
  HomeIcon, 
  TrophyIcon, 
  ClockIcon, 
  LightBulbIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  Cog6ToothIcon,
  MoonIcon,
  SunIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()
const showQuickInput = ref(false)
const showUserMenu = ref(false)
const userMenuRef = ref(null)

// 用户信息计算属性
const userEmail = computed(() => userStore.user?.email || '')
const avatarCacheBuster = ref(Date.now())

function buildAvatarPublicUrl(avatarPath) {
  if (!avatarPath) return ''
  const { data } = supabase.storage.from('avatars').getPublicUrl(String(avatarPath))
  if (!data?.publicUrl) return ''
  return `${data.publicUrl}?v=${avatarCacheBuster.value}`
}

const userAvatarUrl = computed(() => {
  const avatarPath = userStore.user?.user_metadata?.avatar_path
  if (avatarPath && String(avatarPath).trim()) {
    return buildAvatarPublicUrl(String(avatarPath).trim())
  }
  const legacyUrl = userStore.user?.user_metadata?.avatar_url
  if (!legacyUrl) return ''
  return String(legacyUrl)
})

const userDisplayName = computed(() => {
  // 优先使用 metadata 中的 display_name
  if (userStore.user?.user_metadata?.display_name) {
    return userStore.user.user_metadata.display_name
  }
  // 其次使用 email 前缀
  if (userEmail.value) {
    return userEmail.value.split('@')[0]
  }
  return '用户'
})

const userInitials = computed(() => {
  const name = userDisplayName.value
  if (!name) return 'U'
  // 如果是中文，取最后一个字；如果是英文，取首字母
  return /[\u4e00-\u9fa5]/.test(name) 
    ? name.slice(-1) 
    : name.charAt(0).toUpperCase()
})

// 点击外部关闭下拉菜单
function closeUserMenu(e) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeUserMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu)
})

function toggleTheme() {
  themeStore.toggleTheme()
}

const navItems = [
  { path: '/app/today', label: '今日任务', icon: HomeIcon },
  { path: '/app/goals', label: '目标管理', icon: TrophyIcon },
  { path: '/app/countdowns', label: '倒数日', icon: ClockIcon },
  { path: '/app/ideas', label: '想法箱', icon: LightBulbIcon },
  { path: '/app/settings', label: '设置', icon: Cog6ToothIcon }
]

const mobileNavItems = [
  { path: '/app/today', label: '今日', icon: HomeIcon },
  { path: '/app/goals', label: '目标', icon: TrophyIcon },
  { path: '/app/countdowns', label: '倒数日', icon: ClockIcon },
  { path: '/app/ideas', label: '想法', icon: LightBulbIcon },
  { path: '/app/settings', label: '设置', icon: Cog6ToothIcon }
]

async function handleLogout() {
  const result = await userStore.logout()
  if (result.success) {
    router.push('/login')
  }
}
</script>
