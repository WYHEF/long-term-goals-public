<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">打卡监控</h1>
        <p class="text-gray-400 mt-2">实时监控用户打卡情况</p>
      </div>
      <div class="text-sm text-gray-400">
        共 {{ totalCheckIns }} 条打卡记录
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="stat-card-small bg-green-600">
        <div class="text-green-100 text-sm">今日打卡</div>
        <div class="text-white text-2xl font-bold mt-1">{{ todayCount }}</div>
      </div>
      <div class="stat-card-small bg-blue-600">
        <div class="text-blue-100 text-sm">本周打卡</div>
        <div class="text-white text-2xl font-bold mt-1">{{ weekCount }}</div>
      </div>
      <div class="stat-card-small bg-purple-600">
        <div class="text-purple-100 text-sm">完成率</div>
        <div class="text-white text-2xl font-bold mt-1">{{ completionRate }}%</div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="admin-card">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          v-model="filters.status"
          @change="loadCheckIns"
          class="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">全部状态</option>
          <option value="completed">已完成</option>
          <option value="partial">部分完成</option>
          <option value="missed">未完成</option>
        </select>

        <input
          v-model="filters.date"
          type="date"
          @change="loadCheckIns"
          class="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        />

        <button
          @click="loadCheckIns"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          🔄 刷新
        </button>
        <button
          @click="exportCheckIns"
          class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          📥 导出
        </button>
      </div>
    </div>

    <!-- 打卡列表 -->
    <div class="admin-card">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-400">加载中...</p>
      </div>

      <!-- 打卡记录列表 -->
      <div v-else-if="checkIns.length > 0" class="space-y-3">
        <div
          v-for="checkIn in checkIns"
          :key="checkIn.id"
          class="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-2xl">{{ getStatusIcon(checkIn.status) }}</span>
                <span class="font-semibold text-white">{{ checkIn.goals?.title || '未知目标' }}</span>
                <span class="px-2 py-1 rounded text-xs" :class="getStatusClass(checkIn.status)">
                  {{ getStatusText(checkIn.status) }}
                </span>
                <span class="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                  {{ checkIn.goals?.type || '-' }}
                </span>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span class="text-gray-400">打卡日期:</span>
                  <p class="text-white">{{ formatDate(checkIn.date) }}</p>
                </div>
                <div>
                  <span class="text-gray-400">创建时间:</span>
                  <p class="text-white">{{ formatDateTime(checkIn.created_at) }}</p>
                </div>
                <div v-if="checkIn.learning_data?.timeSpent">
                  <span class="text-gray-400">用时:</span>
                  <p class="text-white">{{ checkIn.learning_data.timeSpent }} 分钟</p>
                </div>
                <div v-if="checkIn.learning_data?.actualAmount">
                  <span class="text-gray-400">完成量:</span>
                  <p class="text-white">{{ checkIn.learning_data.actualAmount }}</p>
                </div>
              </div>

              <!-- 笔记预览 -->
              <div v-if="checkIn.learning_data?.notes" class="mt-2 text-sm text-gray-400">
                📝 {{ truncateText(checkIn.learning_data.notes, 100) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12">
        <div class="text-4xl mb-4">📭</div>
        <p class="text-gray-400">暂无打卡记录</p>
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
import { exportToCSV, formatCheckInsForExport } from '@/utils/export'
import dayjs from 'dayjs'

const adminStore = useAdminStore()
const loading = ref(false)
const checkIns = ref([])
const currentPage = ref(1)
const pageSize = ref(15)
const totalCheckIns = ref(0)
const todayCount = ref(0)
const weekCount = ref(0)
const filters = ref({
  status: '',
  date: ''
})

const totalPages = computed(() => Math.ceil(totalCheckIns.value / pageSize.value))
const completionRate = computed(() => {
  if (checkIns.value.length === 0) return 0
  const completed = checkIns.value.filter(c => c.status === 'completed').length
  return Math.round((completed / checkIns.value.length) * 100)
})

function formatDate(date) {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

function formatDateTime(datetime) {
  if (!datetime) return '-'
  return dayjs(datetime).format('YYYY-MM-DD HH:mm')
}

function getStatusIcon(status) {
  const icons = {
    'completed': '✅',
    'partial': '⚠️',
    'missed': '❌'
  }
  return icons[status] || '❓'
}

function getStatusText(status) {
  const texts = {
    'completed': '已完成',
    'partial': '部分完成',
    'missed': '未完成'
  }
  return texts[status] || status
}

function getStatusClass(status) {
  const classes = {
    'completed': 'bg-green-600 text-white',
    'partial': 'bg-orange-600 text-white',
    'missed': 'bg-red-600 text-white'
  }
  return classes[status] || 'bg-gray-600 text-white'
}

function truncateText(text, maxLength) {
  if (!text) return ''
  // 去除HTML标签
  const cleanText = text.replace(/<[^>]*>/g, '')
  if (cleanText.length <= maxLength) return cleanText
  return cleanText.substring(0, maxLength) + '...'
}

async function loadCheckIns() {
  loading.value = true
  const result = await adminStore.getAllCheckIns(currentPage.value, pageSize.value, filters.value)
  checkIns.value = result.data
  totalCheckIns.value = result.total
  loading.value = false
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadCheckIns()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadCheckIns()
  }
}

function exportCheckIns() {
  if (checkIns.value.length === 0) {
    alert('没有数据可导出')
    return
  }
  const formatted = formatCheckInsForExport(checkIns.value)
  const filename = `checkins_${new Date().getTime()}`
  exportToCSV(formatted, filename)
  alert('导出成功！')
}

onMounted(() => {
  loadCheckIns()
  // 模拟今日和本周统计
  todayCount.value = 0
  weekCount.value = 0
})
</script>

<style scoped>
.admin-card {
  @apply bg-gray-800 border border-gray-700 rounded-lg p-6;
}

.stat-card-small {
  @apply rounded-lg p-4;
}
</style>

