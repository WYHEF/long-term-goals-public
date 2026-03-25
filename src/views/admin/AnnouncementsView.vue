<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">公告管理</h1>
        <p class="text-gray-400 mt-2">发布和管理系统公告</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
      >
        <span>➕</span>
        <span>发布公告</span>
      </button>
    </div>

    <!-- 公告列表 -->
    <div class="admin-card">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-400">加载中...</p>
      </div>

      <!-- 公告列表 -->
      <div v-else-if="announcements.length > 0" class="space-y-4">
        <div
          v-for="announcement in announcements"
          :key="announcement.id"
          class="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-xl">{{ getTypeIcon(announcement.type) }}</span>
                <h3 class="text-lg font-semibold text-white">{{ announcement.title }}</h3>
                <span
                  class="px-2 py-1 rounded text-xs"
                  :class="announcement.is_active ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'"
                >
                  {{ announcement.is_active ? '✅ 已发布' : '❌ 已停用' }}
                </span>
                <span class="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                  {{ getTypeText(announcement.type) }}
                </span>
              </div>

              <p class="text-gray-300 text-sm mb-3 whitespace-pre-wrap">{{ announcement.content }}</p>

              <div class="text-xs text-gray-400">
                发布时间：{{ formatDateTime(announcement.created_at) }}
              </div>
            </div>

            <div class="flex items-center space-x-2 ml-4">
              <button
                @click="toggleStatus(announcement)"
                class="px-3 py-1 text-sm rounded transition-colors"
                :class="announcement.is_active ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'"
              >
                {{ announcement.is_active ? '停用' : '启用' }}
              </button>
              <button
                @click="editAnnouncement(announcement)"
                class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                编辑
              </button>
              <button
                @click="deleteAnnouncement(announcement.id)"
                class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12">
        <div class="text-4xl mb-4">📢</div>
        <p class="text-gray-400 mb-4">暂无公告</p>
        <button
          @click="showCreateModal = true"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          发布第一条公告
        </button>
      </div>
    </div>

    <!-- 创建/编辑公告弹窗 -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      @click="closeModal"
    >
      <div
        class="bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        @click.stop
      >
        <!-- 弹窗头部 -->
        <div class="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h3 class="text-xl font-semibold text-white">
            {{ editingAnnouncement ? '编辑公告' : '发布公告' }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="px-6 py-4 space-y-4">
          <!-- 标题 -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              标题 *
            </label>
            <input
              v-model="formData.title"
              type="text"
              placeholder="输入公告标题"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <!-- 类型 -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              类型 *
            </label>
            <select
              v-model="formData.type"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="info">📘 普通消息</option>
              <option value="warning">⚠️ 警告</option>
              <option value="success">✅ 成功/好消息</option>
              <option value="error">🚨 错误/紧急</option>
            </select>
          </div>

          <!-- 内容 -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              内容 *
            </label>
            <textarea
              v-model="formData.content"
              rows="6"
              placeholder="输入公告内容"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          <!-- 是否启用 -->
          <div class="flex items-center space-x-2">
            <input
              v-model="formData.is_active"
              type="checkbox"
              id="is_active"
              class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label for="is_active" class="text-sm text-gray-300">
              立即发布（用户可见）
            </label>
          </div>

          <!-- 按钮 -->
          <div class="flex items-center justify-end space-x-3 pt-4">
            <button
              @click="closeModal"
              class="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              @click="saveAnnouncement"
              :disabled="!canSubmit"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ editingAnnouncement ? '保存' : '发布' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import dayjs from 'dayjs'

const loading = ref(false)
const announcements = ref([])
const showCreateModal = ref(false)
const editingAnnouncement = ref(null)
const formData = ref({
  title: '',
  content: '',
  type: 'info',
  is_active: true
})

const canSubmit = computed(() => {
  return formData.value.title.trim() && formData.value.content.trim()
})

function formatDateTime(datetime) {
  if (!datetime) return '-'
  return dayjs(datetime).format('YYYY-MM-DD HH:mm:ss')
}

function getTypeIcon(type) {
  const icons = {
    'info': '📘',
    'warning': '⚠️',
    'success': '✅',
    'error': '🚨'
  }
  return icons[type] || '📘'
}

function getTypeText(type) {
  const texts = {
    'info': '普通消息',
    'warning': '警告',
    'success': '好消息',
    'error': '紧急'
  }
  return texts[type] || type
}

async function loadAnnouncements() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    announcements.value = data || []
  } catch (error) {
    console.error('加载公告失败:', error)
    alert('加载公告失败：' + error.message)
  } finally {
    loading.value = false
  }
}

async function saveAnnouncement() {
  if (!canSubmit.value) return

  try {
    if (editingAnnouncement.value) {
      // 更新
      const { error } = await supabase
        .from('announcements')
        .update({
          title: formData.value.title,
          content: formData.value.content,
          type: formData.value.type,
          is_active: formData.value.is_active
        })
        .eq('id', editingAnnouncement.value.id)

      if (error) throw error
      alert('公告更新成功！')
    } else {
      // 创建
      const { error } = await supabase
        .from('announcements')
        .insert([{
          title: formData.value.title,
          content: formData.value.content,
          type: formData.value.type,
          is_active: formData.value.is_active
        }])

      if (error) throw error
      alert('公告发布成功！')
    }

    closeModal()
    loadAnnouncements()
  } catch (error) {
    console.error('保存公告失败:', error)
    alert('保存失败：' + error.message)
  }
}

function editAnnouncement(announcement) {
  editingAnnouncement.value = announcement
  formData.value = {
    title: announcement.title,
    content: announcement.content,
    type: announcement.type,
    is_active: announcement.is_active
  }
  showCreateModal.value = true
}

async function toggleStatus(announcement) {
  try {
    const { error } = await supabase
      .from('announcements')
      .update({ is_active: !announcement.is_active })
      .eq('id', announcement.id)

    if (error) throw error
    loadAnnouncements()
  } catch (error) {
    console.error('更新状态失败:', error)
    alert('更新失败：' + error.message)
  }
}

async function deleteAnnouncement(id) {
  if (!confirm('确定要删除这条公告吗？')) return

  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (error) throw error
    alert('删除成功！')
    loadAnnouncements()
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败：' + error.message)
  }
}

function closeModal() {
  showCreateModal.value = false
  editingAnnouncement.value = null
  formData.value = {
    title: '',
    content: '',
    type: 'info',
    is_active: true
  }
}

onMounted(() => {
  loadAnnouncements()
})
</script>

<style scoped>
.admin-card {
  @apply bg-gray-800 border border-gray-700 rounded-lg p-6;
}
</style>

