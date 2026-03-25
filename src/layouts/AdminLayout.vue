<template>
  <div class="admin-layout min-h-screen bg-gray-900">
    <!-- 顶部导航栏 -->
    <nav class="admin-navbar bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo和标题 -->
          <div class="flex items-center">
            <router-link 
              to="/admin" 
              class="flex items-center space-x-3"
              title="凡程蓄力，星途煜辉"
            >
              <img src="/assets/星煜凡程透明.png" alt="星煜凡程" class="h-8 w-auto" />
              <span class="text-xl font-bold text-white">星煜凡程 - 管理员后台</span>
            </router-link>
          </div>

          <!-- 右侧菜单 -->
          <div class="flex items-center space-x-4">
            <router-link to="/app/today" class="text-gray-300 hover:text-white text-sm">
              ← 返回用户端
            </router-link>
            <div class="text-gray-400 text-sm">
              管理员: {{ userEmail }}
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-6">
        <!-- 侧边栏 -->
        <aside class="w-64 flex-shrink-0">
          <div class="bg-gray-800 rounded-lg border border-gray-700 p-4 sticky top-24">
            <nav class="space-y-1">
              <router-link
                v-for="item in menuItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                :class="{ 'bg-gray-700 text-white': isActive(item.path) }"
              >
                <span class="text-xl">{{ item.icon }}</span>
                <span class="font-medium">{{ item.label }}</span>
              </router-link>
            </nav>
          </div>
        </aside>

        <!-- 主内容区 -->
        <main class="flex-1 min-w-0">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const userEmail = computed(() => userStore.user?.email || '未知')

const menuItems = [
  { path: '/admin', icon: '📊', label: '数据总览' },
  { path: '/admin/users', icon: '👥', label: '用户管理' },
  { path: '/admin/goals', icon: '🎯', label: '目标管理' },
  { path: '/admin/checkins', icon: '✅', label: '打卡监控' },
  { path: '/admin/announcements', icon: '📢', label: '公告管理' },
  { path: '/admin/settings', icon: '⚙️', label: '系统设置' }
]

function isActive(path) {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.admin-layout {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.admin-navbar {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
}
</style>

