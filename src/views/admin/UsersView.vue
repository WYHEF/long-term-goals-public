<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">用户管理</h1>
        <p class="text-gray-400 mt-2">管理系统所有用户</p>
      </div>
      <div class="text-sm text-gray-400">
        共 {{ totalUsers }} 位用户
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="admin-card">
      <div class="flex items-center space-x-4">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索用户邮箱..."
          class="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
        <button
          @click="loadUsers"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          🔍 搜索
        </button>
        <button
          @click="exportUsers"
          class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          📥 导出数据
        </button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="admin-card">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-400">加载中...</p>
      </div>

      <!-- 用户表格 -->
      <div v-else-if="users.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-700">
              <th class="text-left py-3 px-4 text-gray-300 font-medium">邮箱</th>
              <th class="text-left py-3 px-4 text-gray-300 font-medium">用户名</th>
              <th class="text-left py-3 px-4 text-gray-300 font-medium">注册时间</th>
              <th class="text-left py-3 px-4 text-gray-300 font-medium">最后登录</th>
              <th class="text-left py-3 px-4 text-gray-300 font-medium">目标数</th>
              <th class="text-left py-3 px-4 text-gray-300 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.user_id"
              class="border-b border-gray-700 hover:bg-gray-750 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="text-white text-sm">{{ user.email }}</div>
                <div class="text-xs text-gray-500 font-mono mt-1">
                  ID: {{ user.user_id.slice(0, 8) }}...
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center space-x-2">
                  <span class="text-white">{{ getUserName(user.email) }}</span>
                  <span v-if="user.email === adminEmail" class="px-2 py-0.5 bg-purple-600 text-white text-xs rounded">
                    管理员
                  </span>
                </div>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-300 text-sm">
                  {{ formatDate(user.created_at) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-400 text-sm">
                  {{ user.last_sign_in_at ? formatDate(user.last_sign_in_at) : '从未登录' }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="text-gray-300">{{ user.goal_count || 0 }}</span>
              </td>
              <td class="py-3 px-4">
                <button
                  @click="viewUserDetail(user)"
                  class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  查看详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12">
        <div class="text-4xl mb-4">📭</div>
        <p class="text-gray-400">暂无用户数据</p>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center space-x-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        <span class="text-gray-400 px-4">
          第 {{ currentPage }} / {{ totalPages }} 页
        </span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 用户详情弹窗 -->
    <div
      v-if="selectedUser"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      @click="closeUserDetail"
    >
      <div
        class="bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        @click.stop
      >
        <!-- 弹窗头部 -->
        <div class="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h3 class="text-xl font-semibold text-white">用户详情</h3>
          <button
            @click="closeUserDetail"
            class="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="px-6 py-4 space-y-4">
          <div class="bg-gray-700 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-400">邮箱:</span>
                <p class="text-white mt-1">{{ selectedUser.email }}</p>
              </div>
              <div>
                <span class="text-gray-400">用户ID:</span>
                <p class="text-white font-mono mt-1 text-xs">{{ selectedUser.user_id }}</p>
              </div>
              <div>
                <span class="text-gray-400">注册时间:</span>
                <p class="text-white mt-1">{{ formatDate(selectedUser.created_at) }}</p>
              </div>
              <div>
                <span class="text-gray-400">最后登录:</span>
                <p class="text-white mt-1">{{ selectedUser.last_sign_in_at ? formatDate(selectedUser.last_sign_in_at) : '从未登录' }}</p>
              </div>
              <div>
                <span class="text-gray-400">目标数量:</span>
                <p class="text-white mt-1">{{ selectedUser.goal_count || 0 }} 个</p>
              </div>
              <div>
                <span class="text-gray-400">主题:</span>
                <p class="text-white mt-1">{{ selectedUser.theme || 'light' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useUserStore } from '@/stores/user'
import { exportToCSV, formatUsersForExport } from '@/utils/export'
import dayjs from 'dayjs'

const adminStore = useAdminStore()
const userStore = useUserStore()
const loading = ref(false)
const users = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalUsers = ref(0)
const searchKeyword = ref('')
const selectedUser = ref(null)

const adminEmail = computed(() => userStore.user?.email || '')

const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value))

function formatDate(date) {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function getUserName(email) {
  if (!email) return '-'
  // 如果是占位符格式（用户_xxx），直接返回
  if (email.startsWith('用户_')) return email
  // 从邮箱中提取用户名（@之前的部分）
  return email.split('@')[0]
}

async function loadUsers() {
  loading.value = true
  const result = await adminStore.getAllUsers(currentPage.value, pageSize.value)
  users.value = result.data
  totalUsers.value = result.total
  loading.value = false
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadUsers()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadUsers()
  }
}

function viewUserDetail(user) {
  selectedUser.value = user
}

function closeUserDetail() {
  selectedUser.value = null
}

function exportUsers() {
  if (users.value.length === 0) {
    alert('没有数据可导出')
    return
  }
  const formatted = formatUsersForExport(users.value)
  const filename = `users_${new Date().getTime()}`
  exportToCSV(formatted, filename)
  alert('导出成功！')
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-card {
  @apply bg-gray-800 border border-gray-700 rounded-lg p-6;
}
</style>

