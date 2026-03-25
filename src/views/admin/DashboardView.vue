<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-3xl font-bold text-white">数据总览</h1>
      <p class="text-gray-400 mt-2">系统运营数据实时监控</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-4xl mb-4">⏳</div>
      <p class="text-gray-400">加载中...</p>
    </div>

    <!-- 统计卡片 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- 总用户数 -->
      <div class="stat-card bg-gradient-to-br from-blue-600 to-blue-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-100 text-sm font-medium">总用户数</p>
            <p class="text-white text-3xl font-bold mt-2">{{ stats.users.total }}</p>
            <p class="text-blue-200 text-xs mt-2">
              今日新增: +{{ stats.users.new_today }}
            </p>
          </div>
          <div class="text-5xl opacity-20">👥</div>
        </div>
      </div>

      <!-- 总目标数 -->
      <div class="stat-card bg-gradient-to-br from-purple-600 to-purple-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-100 text-sm font-medium">总目标数</p>
            <p class="text-white text-3xl font-bold mt-2">{{ stats.goals.total }}</p>
            <p class="text-purple-200 text-xs mt-2">
              进行中: {{ stats.goals.active }}
            </p>
          </div>
          <div class="text-5xl opacity-20">🎯</div>
        </div>
      </div>

      <!-- 总打卡数 -->
      <div class="stat-card bg-gradient-to-br from-green-600 to-green-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-100 text-sm font-medium">总打卡数</p>
            <p class="text-white text-3xl font-bold mt-2">{{ stats.checkins.total }}</p>
            <p class="text-green-200 text-xs mt-2">
              今日: {{ stats.checkins.today }}
            </p>
          </div>
          <div class="text-5xl opacity-20">✅</div>
        </div>
      </div>

      <!-- 完成率 -->
      <div class="stat-card bg-gradient-to-br from-orange-600 to-orange-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-orange-100 text-sm font-medium">目标完成率</p>
            <p class="text-white text-3xl font-bold mt-2">{{ completionRate }}%</p>
            <p class="text-orange-200 text-xs mt-2">
              已完成: {{ stats.goals.completed }}
            </p>
          </div>
          <div class="text-5xl opacity-20">📈</div>
        </div>
      </div>
    </div>

    <!-- 详细信息卡片 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 用户活跃度 -->
      <div class="admin-card">
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
          <span class="text-2xl mr-2">📊</span>
          用户活跃度分析
        </h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span class="text-gray-300">活跃用户</span>
            <span class="text-white font-semibold">{{ stats.users.active }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span class="text-gray-300">今日打卡</span>
            <span class="text-green-400 font-semibold">{{ stats.checkins.today }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span class="text-gray-300">本周打卡</span>
            <span class="text-blue-400 font-semibold">{{ stats.checkins.thisWeek }}</span>
          </div>
        </div>
      </div>

      <!-- 目标统计 -->
      <div class="admin-card">
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
          <span class="text-2xl mr-2">🎯</span>
          目标状态分布
        </h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span class="text-gray-300">进行中</span>
            <span class="text-blue-400 font-semibold">{{ stats.goals.active }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span class="text-gray-300">已完成</span>
            <span class="text-green-400 font-semibold">{{ stats.goals.completed }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span class="text-gray-300">其他状态</span>
            <span class="text-gray-400 font-semibold">{{ stats.goals.total - stats.goals.active - stats.goals.completed }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="admin-card">
      <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
        <span class="text-2xl mr-2">⚡</span>
        快速操作
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <router-link
          to="/admin/users"
          class="quick-action-btn bg-blue-600 hover:bg-blue-700"
        >
          <span class="text-2xl mb-2">👥</span>
          <span class="text-sm">用户管理</span>
        </router-link>
        <router-link
          to="/admin/goals"
          class="quick-action-btn bg-purple-600 hover:bg-purple-700"
        >
          <span class="text-2xl mb-2">🎯</span>
          <span class="text-sm">目标管理</span>
        </router-link>
        <router-link
          to="/admin/checkins"
          class="quick-action-btn bg-green-600 hover:bg-green-700"
        >
          <span class="text-2xl mb-2">✅</span>
          <span class="text-sm">打卡监控</span>
        </router-link>
        <router-link
          to="/admin/announcements"
          class="quick-action-btn bg-orange-600 hover:bg-orange-700"
        >
          <span class="text-2xl mb-2">📢</span>
          <span class="text-sm">发布公告</span>
        </router-link>
      </div>
    </div>

    <!-- 刷新按钮 -->
    <div class="text-center">
      <button
        @click="loadStats"
        :disabled="loading"
        class="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        {{ loading ? '刷新中...' : '🔄 刷新数据' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const loading = ref(false)
const stats = ref({
  users: { total: 0, active: 0, new_today: 0 },
  goals: { total: 0, active: 0, completed: 0 },
  checkins: { total: 0, today: 0, thisWeek: 0 }
})

const completionRate = computed(() => {
  if (stats.value.goals.total === 0) return 0
  return Math.round((stats.value.goals.completed / stats.value.goals.total) * 100)
})

async function loadStats() {
  loading.value = true
  const data = await adminStore.getStatistics()
  if (data) {
    stats.value = data
  }
  loading.value = false
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.admin-card {
  @apply bg-gray-800 border border-gray-700 rounded-lg p-6;
}

.stat-card {
  @apply rounded-lg p-6 shadow-lg;
}

.quick-action-btn {
  @apply flex flex-col items-center justify-center p-6 rounded-lg text-white transition-all cursor-pointer;
}

.quick-action-btn:hover {
  @apply transform -translate-y-1 shadow-lg;
}
</style>

