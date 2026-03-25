<template>
  <div class="space-y-6">
    <!-- 名言警句管理 -->
    <div class="card card-body">
      <div class="flex items-center justify-between mb-4">
        <h2 class="section-title mb-0 flex items-center">
          <ChatBubbleBottomCenterTextIcon class="w-6 h-6 mr-2 text-primary-600" />
          名言警句管理
        </h2>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          共 {{ quotesStore.totalCount }} 条 · 启用 {{ quotesStore.activeCount }} 条
        </span>
      </div>

      <!-- 添加名言表单 -->
      <div v-if="showAddForm" class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              名言内容 *
            </label>
            <textarea
              v-model="newQuote.content"
              placeholder="输入激励语..."
              rows="3"
              class="input resize-none"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              作者/来源（可选）
            </label>
            <input
              v-model="newQuote.author"
              type="text"
              placeholder="例如：老子、屈原等"
              class="input"
            />
          </div>
          <div class="flex gap-2">
            <button @click="handleAddQuote" class="btn btn-primary flex items-center">
              <CheckIcon class="w-5 h-5 mr-1" />
              添加
            </button>
            <button @click="cancelAddQuote" class="btn btn-secondary">
              取消
            </button>
          </div>
        </div>
      </div>

      <!-- 添加按钮 -->
      <button 
        v-else
        @click="showAddForm = true" 
        class="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-colors mb-4 flex items-center justify-center"
      >
        <PlusIcon class="w-5 h-5 mr-1" />
        添加新名言
      </button>

      <!-- 加载状态 -->
      <div v-if="quotesLoading" class="text-center py-8">
        <ArrowPathIcon class="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
        <p class="text-gray-500 dark:text-gray-400 text-sm">加载中...</p>
      </div>

      <!-- 名言列表 -->
      <div v-else-if="quotesStore.quotes.length > 0" class="space-y-3">
        <div
          v-for="quote in quotesStore.quotes"
          :key="quote.id"
          class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          :class="{ 'opacity-50': !quote.is_active }"
        >
          <!-- 编辑模式 -->
          <div v-if="editingQuoteId === quote.id" class="space-y-3">
            <textarea
              v-model="editForm.content"
              rows="3"
              class="input resize-none"
            ></textarea>
            <input
              v-model="editForm.author"
              type="text"
              placeholder="作者/来源"
              class="input"
            />
            <div class="flex gap-2">
              <button @click="handleUpdateQuote(quote.id)" class="btn btn-primary btn-sm">
                保存
              </button>
              <button @click="cancelEdit" class="btn btn-secondary btn-sm">
                取消
              </button>
            </div>
          </div>

          <!-- 显示模式 -->
          <div v-else>
            <!-- 名言内容 -->
            <div class="mb-3">
              <p class="text-gray-800 dark:text-gray-100 font-medium mb-1 break-words">
                {{ quote.content }}
              </p>
              <p v-if="quote.author" class="text-sm text-gray-600 dark:text-gray-400">
                —— {{ quote.author }}
              </p>
            </div>
            
            <!-- 操作按钮组 -->
            <div class="flex items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <div class="flex items-center gap-2">
                <!-- 启用/禁用开关 -->
                <label class="relative inline-flex items-center cursor-pointer" :title="quote.is_active ? '点击禁用' : '点击启用'">
                  <input
                    type="checkbox"
                    :checked="quote.is_active"
                    @change="handleToggleActive(quote.id)"
                    class="sr-only peer"
                  />
                  <div class="w-9 h-5 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                </label>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ quote.is_active ? '已启用' : '已禁用' }}
                </span>
              </div>

              <div class="flex items-center gap-1">
                <!-- 编辑按钮 -->
                <button
                  @click="startEdit(quote)"
                  class="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="编辑"
                >
                  <PencilSquareIcon class="w-5 h-5 text-blue-500" />
                </button>

                <!-- 删除按钮 -->
                <button
                  @click="handleDeleteQuote(quote.id)"
                  class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  title="删除"
                >
                  <TrashIcon class="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-8">
        <ChatBubbleBottomCenterTextIcon class="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p class="text-gray-500 dark:text-gray-400">还没有添加名言警句</p>
      </div>
    </div>

    <!-- API配置 -->
    <div class="card card-body">
      <h2 class="section-title flex items-center">
        <CpuChipIcon class="w-6 h-6 mr-2 text-primary-600" />
        AI配置
      </h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            DeepSeek API Key
          </label>
          <input
            v-model="apiKey"
            type="password"
            placeholder="sk-..."
            class="input"
          />
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            用于AI目标分析和计划生成。如果不配置，将使用系统默认配置。
          </p>
        </div>
        <button @click="saveAPIKey" class="btn btn-primary">
          保存配置
        </button>
      </div>
    </div>

    <!-- 确认删除名言弹窗 -->
    <ConfirmModal
      v-model:show="showDeleteQuoteModal"
      title="删除名言"
      message="确定要删除这条名言吗？此操作不可恢复。"
      confirm-text="删除"
      cancel-text="取消"
      type="danger"
      :loading="deletingQuote"
      @confirm="confirmDeleteQuote"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuotesStore } from '@/stores/quotes'
import { useToastStore } from '@/stores/toast'
import ConfirmModal from '@/components/ConfirmModal.vue'
import {
  ChatBubbleBottomCenterTextIcon,
  CheckIcon,
  PlusIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
  CpuChipIcon
} from '@heroicons/vue/24/outline'

const quotesStore = useQuotesStore()
const toastStore = useToastStore()

const apiKey = ref('')
const quotesLoading = ref(false)
const showAddForm = ref(false)
const newQuote = ref({ content: '', author: '' })
const editingQuoteId = ref(null)
const editForm = ref({ content: '', author: '' })
const showDeleteQuoteModal = ref(false)
const quoteToDeleteId = ref(null)
const deletingQuote = ref(false)

function saveAPIKey() {
  localStorage.setItem('deepseek_api_key', apiKey.value)
  toastStore.success('API Key 已保存')
}

// 名言管理方法
async function handleAddQuote() {
  if (!newQuote.value.content.trim()) {
    toastStore.error('请输入名言内容')
    return
  }

  try {
    await quotesStore.addQuote(newQuote.value.content, newQuote.value.author)
    toastStore.success('添加成功！')
    cancelAddQuote()
  } catch (error) {
    toastStore.error('添加失败：' + error.message)
  }
}

function cancelAddQuote() {
  showAddForm.value = false
  newQuote.value = { content: '', author: '' }
}

function startEdit(quote) {
  editingQuoteId.value = quote.id
  editForm.value = {
    content: quote.content,
    author: quote.author || ''
  }
}

function cancelEdit() {
  editingQuoteId.value = null
  editForm.value = { content: '', author: '' }
}

async function handleUpdateQuote(id) {
  if (!editForm.value.content.trim()) {
    toastStore.error('请输入名言内容')
    return
  }

  try {
    await quotesStore.updateQuote(id, {
      content: editForm.value.content.trim(),
      author: editForm.value.author.trim()
    })
    toastStore.success('更新成功！')
    cancelEdit()
  } catch (error) {
    toastStore.error('更新失败：' + error.message)
  }
}

async function handleToggleActive(id) {
  try {
    await quotesStore.toggleActive(id)
  } catch (error) {
    toastStore.error('操作失败：' + error.message)
  }
}

async function handleDeleteQuote(id) {
  quoteToDeleteId.value = id
  showDeleteQuoteModal.value = true
}

async function confirmDeleteQuote() {
  if (!quoteToDeleteId.value) return
  
  deletingQuote.value = true
  try {
    await quotesStore.deleteQuote(quoteToDeleteId.value)
    toastStore.success('删除成功！')
    showDeleteQuoteModal.value = false
    quoteToDeleteId.value = null
  } catch (error) {
    toastStore.error('删除失败：' + error.message)
  } finally {
    deletingQuote.value = false
  }
}

onMounted(async () => {
  apiKey.value = localStorage.getItem('deepseek_api_key') || ''
  
  // 加载名言列表
  quotesLoading.value = true
  try {
    await quotesStore.fetchQuotes()
  } catch (error) {
    console.error('加载名言失败:', error)
  } finally {
    quotesLoading.value = false
  }
})
</script>
