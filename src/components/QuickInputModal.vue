<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <div class="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <PencilSquareIcon class="w-5 h-5 mr-2 text-primary-600" /> 快速记录
            </h3>
            <button
              @click="close"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
          
          <div class="space-y-5">
            <!-- 类型选择 -->
            <div class="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
              <button
                @click="type = '新目标'"
                :class="[
                  'flex-1 py-2 px-4 rounded-sm text-sm font-medium transition-all flex items-center justify-center',
                  type === '新目标'
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                ]"
              >
                <TrophyIcon class="w-4 h-4 mr-1.5" /> 新目标
              </button>
              <button
                @click="type = '资料链接'"
                :class="[
                  'flex-1 py-2 px-4 rounded-sm text-sm font-medium transition-all flex items-center justify-center',
                  type === '资料链接'
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                ]"
              >
                <LinkIcon class="w-4 h-4 mr-1.5" /> 资料
              </button>
            </div>
            
            <!-- 新目标表单 -->
            <div v-if="type === '新目标'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">目标标题</label>
                <input
                  v-model="title"
                  type="text"
                  placeholder="例如：考取英语四级证书"
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 sm:text-sm"
                  enterkeyhint="next"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">描述（可选）</label>
                <textarea
                  v-model="description"
                  placeholder="简单描述一下这个目标..."
                  rows="3"
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 sm:text-sm resize-none"
                  enterkeyhint="done"
                />
              </div>
            </div>
            
            <!-- 资料链接表单 -->
            <div v-else class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">资料标题</label>
                <input
                  v-model="linkTitle"
                  type="text"
                  placeholder="例如：React 学习指南"
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">链接地址</label>
                <input
                  v-model="link"
                  type="url"
                  placeholder="https://example.com"
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">备注（可选）</label>
                <textarea
                  v-model="notes"
                  placeholder="关于这个资料的说明..."
                  rows="2"
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 sm:text-sm resize-none"
                />
              </div>
              
              <!-- 关联目标选择 -->
              <div v-if="goals.length > 0">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  关联目标（可选）
                </label>
                <div class="relative">
                  <select 
                    v-model="relatedGoalId" 
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm appearance-none"
                  >
                    <option :value="null">不关联</option>
                    <option
                      v-for="goal in goals"
                      :key="goal.id"
                      :value="goal.id"
                    >
                      {{ goal.title }}
                    </option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <ChevronUpDownIcon class="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 提交按钮 -->
            <div class="flex space-x-3 pt-2">
              <button
                @click="close"
                class="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1"
              >
                取消
              </button>
              <button
                @click="submit"
                :disabled="!canSubmit"
                class="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useIdeasStore } from '@/stores/ideas'
import { useGoalsStore } from '@/stores/goals'
import { useUserStore } from '@/stores/user'
import { 
  XMarkIcon, 
  TrophyIcon, 
  LinkIcon,
  PencilSquareIcon,
  ChevronUpDownIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['update:show'])

const ideasStore = useIdeasStore()
const goalsStore = useGoalsStore()
const userStore = useUserStore()

const type = ref('新目标')
const title = ref('')
const description = ref('')
const linkTitle = ref('')
const link = ref('')
const notes = ref('')
const relatedGoalId = ref(null)

const goals = computed(() => goalsStore.activeGoals)

const canSubmit = computed(() => {
  if (type.value === '新目标') {
    return title.value.trim().length > 0
  } else {
    return linkTitle.value.trim().length > 0
  }
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    // 重置表单
    resetForm()
    // 加载目标列表
    if (goals.value.length === 0) {
      goalsStore.fetchGoals({ select: 'id,title,status' })
    }
  }
})

function resetForm() {
  type.value = '新目标'
  title.value = ''
  description.value = ''
  linkTitle.value = ''
  link.value = ''
  notes.value = ''
  relatedGoalId.value = null
}

function close() {
  emit('update:show', false)
}

async function submit() {
  if (!canSubmit.value) return
  
  const ideaData = {
    user_id: userStore.user.id,
    type: type.value,
  }
  
  if (type.value === '新目标') {
    ideaData.title = title.value.trim()
    ideaData.description = description.value.trim()
  } else {
    ideaData.link_title = linkTitle.value.trim()
    ideaData.link = link.value.trim()
    ideaData.notes = notes.value.trim()
    ideaData.related_goal_id = relatedGoalId.value
  }
  
  const result = await ideasStore.createIdea(ideaData)
  
  if (result.success) {
    close()
  } else {
    alert('保存失败：' + result.error)
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>

