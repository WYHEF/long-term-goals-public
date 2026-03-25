<template>
  <div class="max-w-6xl mx-auto">
    <!-- 顶部标题 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <ClockIcon class="w-8 h-8 text-primary-600 mr-3" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">倒数日</h1>
      </div>
      <button @click="showAddModal = true" class="btn btn-primary flex items-center">
        <PlusIcon class="w-5 h-5 mr-1" />
        添加倒数日
      </button>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      <!-- 左侧导航栏 -->
      <nav class="w-full md:w-64 flex-shrink-0">
        <div class="sticky top-6 flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
          <button
            @click="currentFilter = 'upcoming'"
            class="flex-shrink-0 md:w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
            :class="[
              currentFilter === 'upcoming'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
            ]"
          >
            <div class="flex items-center">
              <ClockIcon class="w-5 h-5 mr-3" />
              即将到来
            </div>
            <span class="ml-auto bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
              {{ upcomingCount }}
            </span>
          </button>

          <button
            @click="currentFilter = 'passed'"
            class="flex-shrink-0 md:w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
            :class="[
              currentFilter === 'passed'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
            ]"
          >
            <div class="flex items-center">
              <ArchiveBoxXMarkIcon class="w-5 h-5 mr-3" />
              已过期
            </div>
            <span class="ml-auto bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
              {{ passedCount }}
            </span>
          </button>

          <button
            @click="currentFilter = '3days'"
            class="flex-shrink-0 md:w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
            :class="[
              currentFilter === '3days'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
            ]"
          >
            <FireIcon class="w-5 h-5 mr-3" />
            最近3天
          </button>

          <button
            @click="currentFilter = '7days'"
            class="flex-shrink-0 md:w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
            :class="[
              currentFilter === '7days'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
            ]"
          >
            <CalendarDaysIcon class="w-5 h-5 mr-3" />
            最近7天
          </button>

          <button
            @click="currentFilter = 'completed'"
            class="flex-shrink-0 md:w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
            :class="[
              currentFilter === 'completed'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
            ]"
          >
            <div class="flex items-center">
              <CheckCircleIcon class="w-5 h-5 mr-3" />
              已完成
            </div>
            <span class="ml-auto bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
              {{ completedCount }}
            </span>
          </button>

          <button
            @click="currentFilter = 'all'"
            class="flex-shrink-0 md:w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
            :class="[
              currentFilter === 'all'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
            ]"
          >
            <div class="flex items-center">
              <ListBulletIcon class="w-5 h-5 mr-3" />
              全部
            </div>
            <span class="ml-auto bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
              {{ countdowns.length }}
            </span>
          </button>
        </div>
      </nav>

      <!-- 右侧内容区 -->
      <div class="flex-1 space-y-6">
        <!-- 说明卡片 -->
        <div class="card card-body bg-blue-50 dark:bg-gray-800 mb-6">
          <div class="flex items-start space-x-3">
            <CalendarIcon class="w-8 h-8 text-primary-600 flex-shrink-0" />
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">记录重要日期</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                添加考试、生日、纪念日等重要日期，系统会自动计算倒数天数并在首页提醒你。
              </p>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-12">
          <ArrowPathIcon class="w-10 h-10 animate-spin text-gray-400 mx-auto mb-4" />
          <p class="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredCountdowns.length === 0" class="text-center py-12 card">
          <CalendarIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ getEmptyStateText() }}
          </p>
          <button @click="showAddModal = true" class="btn btn-primary flex items-center mx-auto">
            <PlusIcon class="w-5 h-5 mr-1" />
            立即添加
          </button>
        </div>

        <!-- 倒数日列表 -->
        <div v-else class="space-y-3">
          <CountdownCard
            v-for="countdown in filteredCountdowns"
            :key="countdown.id"
            :countdown="countdown"
            @pin="togglePin"
            @edit="editCountdown"
            @delete="deleteCountdown"
            @complete="markAsCompleted"
          />
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold">{{ editingCountdown ? '编辑倒数日' : '添加倒数日' }}</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <!-- 标题 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">事件名称 *</label>
            <input
              v-model="form.title"
              type="text"
              class="input"
              placeholder="例如：英语四级考试、妈妈生日..."
            />
          </div>
          
          <!-- 描述 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述（可选）</label>
            <textarea
              v-model="form.description"
              rows="4"
              class="input resize-none"
              placeholder="粘贴包含日期和时间的文字，例如：
【通知】应学院党总支要求，各支部需召开二级党组织师生党员研讨交流会。
会议时间：12月18日晚20:00
会议地点：390-563-038
研讨主题：坚定自信、挺膺担当，以青春实践书写文化新篇"
            ></textarea>
            <!-- AI自动识别按钮 -->
            <div class="mt-2 flex items-center gap-2">
              <button
                type="button"
                @click="aiParseDescription"
                :disabled="!form.description || aiParsing"
                class="text-sm px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <ArrowPathIcon v-if="aiParsing" class="w-4 h-4 animate-spin" />
                <SparklesIcon v-else class="w-4 h-4" />
                {{ aiParsing ? 'AI识别中...' : 'AI自动识别' }}
              </button>
              <span v-if="aiParseResult" class="text-sm" :class="aiParseResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ aiParseResult.message }}
              </span>
            </div>
          </div>
          
          <!-- 日期和时间 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">日期 *</label>
              <input
                v-model="form.date"
                type="date"
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">时间</label>
              <input
                v-model="form.time"
                type="time"
                class="input"
              />
            </div>
          </div>
          
          <!-- 分类 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分类</label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="cat in categories"
                :key="cat.value"
                type="button"
                @click="form.category = cat.value"
                :class="[
                  'p-3 rounded-lg border-2 transition-all text-left',
                  form.category === cat.value
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                ]"
              >
                <div class="mb-1">
                  <component :is="cat.icon" class="w-6 h-6" />
                </div>
                <div class="text-sm font-medium">{{ cat.label }}</div>
              </button>
            </div>
          </div>
          
          <!-- 颜色 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">颜色标记</label>
            <div class="flex gap-3">
              <button
                v-for="c in colors"
                :key="c.value"
                type="button"
                @click="form.color = c.value"
                :class="[
                  'w-10 h-10 rounded-full border-2 transition-all',
                  form.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                ]"
                :style="{ backgroundColor: c.hex }"
              ></button>
            </div>
          </div>
          
          <!-- 置顶 -->
          <div class="flex items-center">
            <input
              v-model="form.is_pinned"
              type="checkbox"
              id="is_pinned"
              class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label for="is_pinned" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
              📌 在首页置顶显示
            </label>
          </div>
        </div>
        
        <div class="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end space-x-3">
          <button @click="closeModal" class="btn btn-secondary">
            取消
          </button>
          <button
            @click="saveCountdown"
            :disabled="!canSave"
            class="btn btn-primary"
          >
            {{ editingCountdown ? '保存' : '添加' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCountdownsStore } from '@/stores/countdowns'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import CountdownCard from '@/components/CountdownCard.vue'
import { parseCountdownInfo } from '@/config/deepseek'
import dayjs from 'dayjs'
import { 
  CalendarIcon, 
  PlusIcon, 
  ClockIcon, 
  SparklesIcon, 
  XMarkIcon,
  AcademicCapIcon,
  CakeIcon,
  BriefcaseIcon,
  FlagIcon,
  TagIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ArchiveBoxXMarkIcon,
  FireIcon,
  CalendarDaysIcon,
  ListBulletIcon
} from '@heroicons/vue/24/outline'

const countdownsStore = useCountdownsStore()
const userStore = useUserStore()
const toastStore = useToastStore()

const loading = ref(true)
const currentFilter = ref('upcoming')
const showAddModal = ref(false)
const editingCountdown = ref(null)
const aiParsing = ref(false)
const aiParseResult = ref(null)

const form = ref({
  title: '',
  description: '',
  date: '',
  time: '00:00',
  category: 'other',
  color: 'blue',
  is_pinned: false
})

const categories = [
  { value: 'exam', label: '考试', icon: AcademicCapIcon },
  { value: 'birthday', label: '生日', icon: CakeIcon },
  { value: 'anniversary', label: '纪念日', icon: SparklesIcon },
  { value: 'deadline', label: '截止日', icon: FlagIcon },
  { value: 'work', label: '工作', icon: BriefcaseIcon },
  { value: 'other', label: '其他', icon: TagIcon }
]

const colors = [
  { value: 'blue', hex: '#3B82F6' },
  { value: 'red', hex: '#EF4444' },
  { value: 'green', hex: '#10B981' },
  { value: 'yellow', hex: '#F59E0B' },
  { value: 'purple', hex: '#8B5CF6' },
  { value: 'pink', hex: '#EC4899' }
]

const countdowns = computed(() => countdownsStore.countdowns)

const upcomingCount = computed(() => {
  return countdowns.value.filter(c => {
    const diff = dayjs(c.target_date).diff(dayjs())
    return diff >= 0 && !c.is_completed
  }).length
})

const passedCount = computed(() => {
  return countdowns.value.filter(c => {
    const diff = dayjs(c.target_date).diff(dayjs())
    return diff < 0 && !c.is_completed
  }).length
})

const completedCount = computed(() => {
  return countdowns.value.filter(c => c.is_completed).length
})

const filteredCountdowns = computed(() => {
  let result = []
  
  if (currentFilter.value === 'all') {
    result = countdowns.value
  } else if (currentFilter.value === 'upcoming') {
    result = countdowns.value.filter(c => {
      const diff = dayjs(c.target_date).diff(dayjs())
      return diff >= 0 && !c.is_completed
    }).sort((a, b) => dayjs(a.target_date).diff(dayjs(b.target_date)))
  } else if (currentFilter.value === 'passed') {
    result = countdowns.value.filter(c => {
      const diff = dayjs(c.target_date).diff(dayjs())
      return diff < 0 && !c.is_completed
    }).sort((a, b) => dayjs(b.target_date).diff(dayjs(a.target_date)))
  } else if (currentFilter.value === '3days') {
    result = countdowns.value.filter(c => {
      const today = dayjs().startOf('day')
      const target = dayjs(c.target_date).startOf('day')
      const diffDays = today.diff(target, 'day')
      return diffDays > 0 && diffDays <= 3 && !c.is_completed
    }).sort((a, b) => dayjs(b.target_date).diff(dayjs(a.target_date)))
  } else if (currentFilter.value === '7days') {
    result = countdowns.value.filter(c => {
      const today = dayjs().startOf('day')
      const target = dayjs(c.target_date).startOf('day')
      const diffDays = today.diff(target, 'day')
      return diffDays > 0 && diffDays <= 7 && !c.is_completed
    }).sort((a, b) => dayjs(b.target_date).diff(dayjs(a.target_date)))
  } else if (currentFilter.value === 'completed') {
    result = countdowns.value.filter(c => c.is_completed)
  }
  
  return result
})

function getEmptyStateText() {
  switch (currentFilter.value) {
    case 'upcoming': return '暂无即将到来的倒数日'
    case 'passed': return '暂无已过期的倒数日'
    case '3days': return '最近3天没有倒数日'
    case '7days': return '最近7天没有倒数日'
    case 'completed': return '暂无已完成的倒数日'
    default: return '还没有添加任何倒数日'
  }
}

const canSave = computed(() => {
  return form.value.title.trim() && form.value.date
})

async function togglePin(id) {
  await countdownsStore.togglePin(id)
}

function editCountdown(countdown) {
  editingCountdown.value = countdown
  const targetDate = dayjs(countdown.target_date)
  form.value = {
    title: countdown.title,
    description: countdown.description || '',
    date: targetDate.format('YYYY-MM-DD'),
    time: targetDate.format('HH:mm'),
    category: countdown.category,
    color: countdown.color,
    is_pinned: countdown.is_pinned
  }
  showAddModal.value = true
}

async function deleteCountdown(id) {
  if (confirm('确定要删除这个倒数日吗？')) {
    await countdownsStore.deleteCountdown(id)
  }
}

async function markAsCompleted(id) {
  await countdownsStore.markAsCompleted(id, true)
}

// AI自动识别描述中的信息
async function aiParseDescription() {
  if (!form.value.description || aiParsing.value) return
  
  aiParsing.value = true
  aiParseResult.value = null
  
  try {
    const result = await parseCountdownInfo(form.value.description)
    
    if (result.success) {
      // 自动填充识别的信息
      form.value.title = result.data.title
      form.value.date = result.data.date
      form.value.time = result.data.time
      form.value.category = result.data.category
      
      aiParseResult.value = {
        success: true,
        message: `识别成功！已自动填充信息（置信度：${result.data.confidence === 'high' ? '高' : result.data.confidence === 'medium' ? '中' : '低'}）`
      }
      
      // 3秒后清除提示
      setTimeout(() => {
        aiParseResult.value = null
      }, 3000)
    } else {
      aiParseResult.value = {
        success: false,
        message: result.error || '识别失败，请检查输入内容'
      }
      
      // 5秒后清除错误提示
      setTimeout(() => {
        aiParseResult.value = null
      }, 5000)
    }
  } catch (error) {
    console.error('AI识别失败:', error)
    aiParseResult.value = {
      success: false,
      message: 'AI识别失败：' + error.message
    }
    
    setTimeout(() => {
      aiParseResult.value = null
    }, 5000)
  } finally {
    aiParsing.value = false
  }
}

function closeModal() {
  showAddModal.value = false
  editingCountdown.value = null
  aiParsing.value = false
  aiParseResult.value = null
  form.value = {
    title: '',
    description: '',
    date: '',
    time: '00:00',
    category: 'other',
    color: 'blue',
    is_pinned: false
  }
}

async function saveCountdown() {
  if (!canSave.value) return
  
  // 合并日期和时间
  const targetDate = dayjs(`${form.value.date} ${form.value.time}`).toISOString()
  
  const countdownData = {
    user_id: userStore.user.id,
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    target_date: targetDate,
    category: form.value.category,
    color: form.value.color,
    is_pinned: form.value.is_pinned
  }
  
  let result
  if (editingCountdown.value) {
    result = await countdownsStore.updateCountdown(editingCountdown.value.id, countdownData)
  } else {
    result = await countdownsStore.createCountdown(countdownData)
  }
  
  if (result.success) {
    toastStore.success(editingCountdown.value ? '倒数日更新成功' : '倒数日添加成功')
    closeModal()
  } else {
    toastStore.error('保存失败：' + result.error)
  }
}

onMounted(async () => {
  loading.value = true
  await countdownsStore.fetchCountdowns()
  loading.value = false
})
</script>

