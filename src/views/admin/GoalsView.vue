<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">目标管理</h1>
        <p class="text-gray-400 mt-2">查看和管理所有用户目标</p>
      </div>
      <div class="text-sm text-gray-400">
        共 {{ totalGoals }} 个目标
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="admin-card">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          v-model="filters.type"
          @change="loadGoals"
          class="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">全部类型</option>
          <option value="学习类">学习类</option>
          <option value="健康类">健康类</option>
        </select>

        <select
          v-model="filters.status"
          @change="loadGoals"
          class="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">全部状态</option>
          <option value="进行中">进行中</option>
          <option value="已完成">已完成</option>
          <option value="已暂停">已暂停</option>
          <option value="规划中">规划中</option>
        </select>

        <button
          @click="loadGoals"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          🔄 刷新
        </button>
        <button
          @click="exportGoals"
          class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          📥 导出
        </button>
      </div>
    </div>

    <!-- 目标列表 -->
    <div class="admin-card">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-400">加载中...</p>
      </div>

      <!-- 目标卡片列表 -->
      <div v-else-if="goals.length > 0" class="space-y-4">
        <div
          v-for="goal in goals"
          :key="goal.id"
          class="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-2xl">{{ goal.type === '学习类' ? '📚' : '💪' }}</span>
                <h3 class="text-lg font-semibold text-white">{{ goal.title }}</h3>
                <span class="px-2 py-1 rounded text-xs" :class="getStatusClass(goal.status)">
                  {{ goal.status }}
                </span>
                <span class="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                  {{ goal.type }}
                </span>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                <div>
                  <span class="text-gray-400">开始日期:</span>
                  <p class="text-white">{{ formatDate(goal.start_date) }}</p>
                </div>
                <div>
                  <span class="text-gray-400">结束日期:</span>
                  <p class="text-white">{{ formatDate(goal.end_date) }}</p>
                </div>
                <div>
                  <span class="text-gray-400">进度:</span>
                  <p class="text-white">{{ goal.progress?.percentage || 0 }}%</p>
                </div>
                <div>
                  <span class="text-gray-400">创建时间:</span>
                  <p class="text-white">{{ formatDate(goal.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12">
        <div class="text-4xl mb-4">📭</div>
        <p class="text-gray-400">暂无目标数据</p>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center space-x-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          上一页
        </button>
        <span class="text-gray-400 px-4">
          第 {{ currentPage }} / {{ totalPages }} 页
        </span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { exportToCSV, formatGoalsForExport } from '@/utils/export'
import dayjs from 'dayjs'

const adminStore = useAdminStore()
const loading = ref(false)
const goals = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalGoals = ref(0)
const filters = ref({
  type: '',
  status: ''
})

const totalPages = computed(() => Math.ceil(totalGoals.value / pageSize.value))

function formatDate(date) {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

function getStatusClass(status) {
  const classes = {
    '进行中': 'bg-blue-600 text-white',
    '已完成': 'bg-green-600 text-white',
    '已暂停': 'bg-orange-600 text-white',
    '规划中': 'bg-gray-600 text-white'
  }
  return classes[status] || 'bg-gray-600 text-white'
}

async function loadGoals() {
  loading.value = true
  const result = await adminStore.getAllGoals(currentPage.value, pageSize.value, filters.value)
  goals.value = result.data
  totalGoals.value = result.total
  loading.value = false
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadGoals()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadGoals()
  }
}

function exportGoals() {
  if (goals.value.length === 0) {
    alert('没有数据可导出')
    return
  }
  const formatted = formatGoalsForExport(goals.value)
  const filename = `goals_${new Date().getTime()}`
  exportToCSV(formatted, filename)
  alert('导出成功！')
}

onMounted(() => {
  loadGoals()
})
</script>

<style scoped>
.admin-card {
  @apply bg-gray-800 border border-gray-700 rounded-lg p-6;
}
</style>

