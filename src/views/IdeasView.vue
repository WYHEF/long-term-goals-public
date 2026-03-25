<template>
  <div class="max-w-6xl mx-auto">
    <!-- 顶部标题 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <LightBulbIcon class="w-8 h-8 text-primary-600 mr-3" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">想法收集箱</h1>
      </div>
      <button @click="showQuickInput = true" class="btn btn-primary flex items-center">
        <PlusIcon class="w-5 h-5 mr-1" />
        快速记录
      </button>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      <!-- 左侧导航栏 -->
      <nav class="w-full md:w-64 flex-shrink-0">
        <div class="sticky top-6 flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
          <button
            @click="currentTab = 'all'"
            class="flex-shrink-0 md:w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
            :class="[
              currentTab === 'all'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
            ]"
          >
            <div class="flex items-center">
              <ListBulletIcon class="w-5 h-5 mr-3" />
              全部
            </div>
            <span class="ml-auto bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
              {{ ideas.length }}
            </span>
          </button>

          <button
            @click="currentTab = '新目标'"
            class="flex-shrink-0 md:w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
            :class="[
              currentTab === '新目标'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
            ]"
          >
            <div class="flex items-center">
              <TrophyIcon class="w-5 h-5 mr-3" />
              新目标
            </div>
            <span class="ml-auto bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
              {{ newGoalIdeas.length }}
            </span>
          </button>

          <button
            @click="currentTab = '资料链接'"
            class="flex-shrink-0 md:w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
            :class="[
              currentTab === '资料链接'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
            ]"
          >
            <div class="flex items-center">
              <LinkIcon class="w-5 h-5 mr-3" />
              资料链接
            </div>
            <span class="ml-auto bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
              {{ resourceIdeas.length }}
            </span>
          </button>
        </div>
      </nav>

      <!-- 右侧内容区 -->
      <div class="flex-1 space-y-6">
        <!-- 说明卡片 -->
        <div class="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-gray-800 dark:border-gray-700 p-4 mb-6">
          <div class="flex items-start space-x-3">
            <LightBulbIcon class="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1 text-sm">记录你的每一个想法</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                随时记录突然冒出的目标想法，或者收集与现有目标相关的学习资料。
                等时机成熟时，可以将想法转换为正式目标。
              </p>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-12">
          <div class="flex justify-center mb-4"><ArrowPathIcon class="w-8 h-8 animate-spin text-gray-400" /></div>
          <p class="text-gray-600 dark:text-gray-300 text-sm">加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredIdeas.length === 0" class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex justify-center mb-4"><PencilSquareIcon class="w-12 h-12 text-gray-300" /></div>
          <p class="text-gray-600 dark:text-gray-300 mb-6">还没有记录任何想法</p>
          <button @click="showQuickInput = true" class="btn btn-primary">
            立即记录
          </button>
        </div>

        <!-- 想法列表 -->
        <div v-else class="grid grid-cols-1 gap-4">
          <div
            v-for="idea in filteredIdeas"
            :key="idea.id"
            class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group"
          >
            <div class="p-5">
              <!-- 新目标草稿 -->
              <div v-if="idea.type === '新目标'" class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center mb-2">
                    <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                      <TrophyIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{{ idea.title }}</h3>
                      <div class="flex items-center mt-1">
                        <span class="text-xs text-gray-400 flex-shrink-0">
                          {{ formatDate(idea.created_at) }}
                        </span>
                        <span v-if="idea.status === 'converted'" class="ml-2 badge badge-success text-xs flex-shrink-0">
                          已转为目标
                        </span>
                      </div>
                    </div>
                  </div>
                  <p v-if="idea.description" class="text-gray-600 dark:text-gray-300 text-sm ml-13 mt-2 whitespace-pre-wrap break-words">
                    {{ idea.description }}
                  </p>
                </div>
                
                <div class="flex space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <router-link
                    v-if="idea.status !== 'converted'"
                    to="/app/goals/create"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="启动目标"
                    @click="prepareGoalFromIdea(idea)"
                  >
                    <RocketLaunchIcon class="w-5 h-5" />
                  </router-link>
                  <button
                    @click="editIdea(idea)"
                    class="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                    title="编辑"
                  >
                    <PencilSquareIcon class="w-5 h-5" />
                  </button>
                  <button
                    @click="deleteIdea(idea.id)"
                    class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="删除"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <!-- 资料链接 -->
              <div v-else class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center mb-2">
                    <div class="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                      <LinkIcon class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{{ idea.link_title }}</h3>
                      <div class="flex items-center mt-1">
                        <span class="text-xs text-gray-400 flex-shrink-0">
                          {{ formatDate(idea.created_at) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="ml-13 space-y-2 mt-2">
                    <a
                      v-if="idea.link"
                      :href="idea.link"
                      target="_blank"
                      class="text-primary-600 hover:text-primary-700 text-sm flex items-center group/link max-w-full"
                    >
                      <LinkIcon class="w-4 h-4 mr-1.5 text-gray-400 group-hover/link:text-primary-600 flex-shrink-0" />
                      <span class="truncate block min-w-0">{{ idea.link }}</span>
                    </a>
                    
                    <p v-if="idea.notes" class="text-gray-600 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md break-words">
                      {{ idea.notes }}
                    </p>
                    
                    <div v-if="idea.related_goal_id" class="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <TagIcon class="w-3 h-3 mr-1" />
                      关联目标：{{ getGoalTitle(idea.related_goal_id) }}
                    </div>
                  </div>
                </div>
                
                <div class="flex space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click="editIdea(idea)"
                    class="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                    title="编辑"
                  >
                    <PencilSquareIcon class="w-5 h-5" />
                  </button>
                  <button
                    @click="deleteIdea(idea.id)"
                    class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="删除"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快捷输入弹窗 -->
    <QuickInputModal v-model:show="showQuickInput" />
    
    <!-- 编辑想法弹窗 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">编辑想法</h2>
          <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <!-- 新目标表单 -->
          <div v-if="editingIdea?.type === '新目标'">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">目标标题</label>
              <input
                v-model="editForm.title"
                type="text"
                class="input"
                placeholder="输入目标标题..."
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">详细描述</label>
              <textarea
                v-model="editForm.description"
                rows="6"
                class="input resize-none"
                placeholder="描述这个目标的具体内容..."
              ></textarea>
            </div>
          </div>
          
          <!-- 资料链接表单 -->
          <div v-else>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">资料标题</label>
              <input
                v-model="editForm.link_title"
                type="text"
                class="input"
                placeholder="输入资料标题..."
              />
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">链接地址</label>
              <input
                v-model="editForm.link"
                type="url"
                class="input"
                placeholder="https://..."
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">备注说明</label>
              <textarea
                v-model="editForm.notes"
                rows="4"
                class="input resize-none"
                placeholder="关于这个链接的备注..."
              ></textarea>
            </div>
          </div>
        </div>
        
        <div class="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
          <button @click="closeEditModal" class="btn btn-secondary">
            取消
          </button>
          <button
            @click="saveEdit"
            :disabled="!canSave"
            class="btn btn-primary"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useIdeasStore } from '@/stores/ideas'
import { useGoalsStore } from '@/stores/goals'
import QuickInputModal from '@/components/QuickInputModal.vue'
import dayjs from 'dayjs'
import { 
  LightBulbIcon, 
  PlusIcon, 
  TrophyIcon, 
  PaperClipIcon, 
  ArrowPathIcon, 
  SparklesIcon, 
  LinkIcon, 
  CheckCircleIcon, 
  XMarkIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  RocketLaunchIcon, 
  TagIcon,
  ListBulletIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const ideasStore = useIdeasStore()
const goalsStore = useGoalsStore()

const loading = ref(true)
const currentTab = ref('all')
const showQuickInput = ref(false)
const showEditModal = ref(false)
const editingIdea = ref(null)
const editForm = ref({
  title: '',
  description: '',
  link_title: '',
  link: '',
  notes: ''
})

const ideas = computed(() => ideasStore.ideas)

const newGoalIdeas = computed(() =>
  ideas.value.filter(i => i.type === '新目标')
)

const resourceIdeas = computed(() =>
  ideas.value.filter(i => i.type === '资料链接')
)

const filteredIdeas = computed(() => {
  if (currentTab.value === 'all') return ideas.value
  return ideas.value.filter(i => i.type === currentTab.value)
})

const canSave = computed(() => {
  if (editingIdea.value?.type === '新目标') {
    return editForm.value.title.trim().length > 0
  } else {
    return editForm.value.link_title.trim().length > 0
  }
})

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function getGoalTitle(goalId) {
  const goal = goalsStore.goals.find(g => g.id === goalId)
  return goal?.title || '未知目标'
}

async function deleteIdea(id) {
  if (confirm('确定要删除这个想法吗？')) {
    await ideasStore.deleteIdea(id)
  }
}

function prepareGoalFromIdea(idea) {
  // 可以通过路由参数传递想法信息到创建页面
  // 这里简化处理
  console.log('准备从想法创建目标:', idea)
}

function editIdea(idea) {
  editingIdea.value = idea
  if (idea.type === '新目标') {
    editForm.value = {
      title: idea.title || '',
      description: idea.description || '',
      link_title: '',
      link: '',
      notes: ''
    }
  } else {
    editForm.value = {
      title: '',
      description: '',
      link_title: idea.link_title || '',
      link: idea.link || '',
      notes: idea.notes || ''
    }
  }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingIdea.value = null
  editForm.value = {
    title: '',
    description: '',
    link_title: '',
    link: '',
    notes: ''
  }
}

async function saveEdit() {
  if (!canSave.value || !editingIdea.value) return
  
  const updateData = {}
  if (editingIdea.value.type === '新目标') {
    updateData.title = editForm.value.title.trim()
    updateData.description = editForm.value.description.trim()
  } else {
    updateData.link_title = editForm.value.link_title.trim()
    updateData.link = editForm.value.link.trim()
    updateData.notes = editForm.value.notes.trim()
  }
  
  const result = await ideasStore.updateIdea(editingIdea.value.id, updateData)
  if (result.success) {
    closeEditModal()
  } else {
    alert('更新失败：' + result.error)
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    ideasStore.fetchIdeas(),
    goalsStore.fetchGoals({ select: 'id,title,status,type' })
  ])
  loading.value = false
})
</script>

