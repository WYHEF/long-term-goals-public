<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <div class="flex justify-center mb-4"><ArrowPathIcon class="w-10 h-10 animate-spin text-gray-400 dark:text-gray-500" /></div>
      <p class="text-gray-600 dark:text-gray-400">加载中...</p>
    </div>
    
    <!-- 目标不存在 -->
    <div v-else-if="!goal" class="text-center py-12">
      <div class="flex justify-center mb-4"><XCircleIcon class="w-10 h-10 text-red-500" /></div>
      <p class="text-gray-600 dark:text-gray-400 mb-4">目标不存在</p>
      <router-link to="/" class="btn btn-primary">
        返回首页
      </router-link>
    </div>
    
    <!-- 打卡表单 -->
    <div v-else>
      <!-- 页面标题 -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">打卡</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">{{ goal.title }}</p>
          <div v-if="isEarlyWindow" class="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-200 flex items-start">
            <ClockIcon class="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
            <div>
              现在是凌晨时段（2:00 前）。
              <span v-if="goal.type==='健康类' && goal.sub_type==='喝水'">
                喝水打卡必须记当天累计。当前打卡日期：{{ effectiveDate }}。
              </span>
              <span v-else>
                可以补打昨天的卡；若昨天已完成则记今天。当前打卡日期：{{ effectiveDate }}。
              </span>
            </div>
          </div>
        </div>
        <router-link to="/" class="btn btn-ghost flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <ArrowLeftIcon class="w-4 h-4 mr-1" /> 返回
        </router-link>
      </div>
      
      <!-- 学习类打卡 -->
      <div v-if="goal.type === '学习类'" class="card card-body space-y-4">
        <h2 class="section-title flex items-center"><AcademicCapIcon class="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" /> 学习打卡</h2>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
            <span class="flex items-center"><ClipboardDocumentListIcon class="w-4 h-4 mr-1" /> 今日任务</span>
            <button
              v-if="isFlexibleMode"
              @click="showTaskEditor = !showTaskEditor"
              class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
            >
              <template v-if="showTaskEditor">
                收起编辑
              </template>
              <template v-else>
                <PencilSquareIcon class="w-4 h-4 mr-1" /> 编辑任务
              </template>
            </button>
          </label>
          
          <!-- 灵活模式：可编辑任务列表 -->
          <div v-if="isFlexibleMode && showTaskEditor" class="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div v-if="todayTasks.length === 0" class="text-gray-500 dark:text-gray-400 text-sm mb-2">
              还没有添加今日任务，点击下方添加
            </div>
            <div
              v-for="(task, index) in todayTasks"
              :key="index"
              class="flex items-center gap-2"
            >
              <input
                v-model="todayTasks[index]"
                type="text"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="输入任务内容..."
              />
              <button
                @click="removeTask(index)"
                class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xl"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
            <button
              @click="addTask"
              class="w-full py-2 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-sm transition-colors flex items-center justify-center"
            >
              <PlusIcon class="w-4 h-4 mr-1" /> 添加任务
            </button>
          </div>
          
          <!-- 显示模式：只读显示 -->
          <div v-else class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div v-if="isFlexibleMode && todayTasks.length > 0" class="space-y-1">
              <div
                v-for="(task, index) in todayTasks"
                :key="index"
                class="font-medium text-blue-900 dark:text-blue-100"
              >
                • {{ task }}
              </div>
            </div>
            <div v-else class="font-medium text-blue-900 dark:text-blue-100 whitespace-pre-line">
              {{ todayTask || '使用通用任务模板' }}
            </div>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            完成情况 *
          </label>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="status in completionStatuses"
              :key="status.value"
              @click="checkInData.status = status.value"
              :class="[
                'p-3 rounded-lg border-2 transition-all',
                checkInData.status === status.value
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
              ]"
            >
              <component :is="status.icon" class="w-8 h-8 mx-auto mb-1" :class="status.color" />
              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ status.label }}</div>
            </button>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            实际完成量
          </label>
          <textarea
            v-model="learningData.actualAmount"
            :placeholder="'例如：完成3道题、背了50个单词、看了20页书...'"
            rows="2"
            class="input resize-none"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            用时（分钟）
          </label>
          <input
            v-model.number="learningData.timeSpent"
            type="number"
            placeholder="30"
            class="input"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            今日笔记（可选）
          </label>
          <!-- 富文本编辑器组件 - 支持图片和文件上传 -->
          <RichNoteEditor
            v-model="learningData.notes"
            v-model:attachments="learningData.attachments"
            placeholder="记录今天的学习心得、遇到的问题、掌握的技巧..."
            :rows="4"
          />
        </div>
      </div>
      
      <!-- 健康类打卡 -->
      <div v-else-if="goal.type === '健康类'" class="card card-body space-y-4">
        <h2 class="section-title flex items-center"><HeartIcon class="w-6 h-6 mr-2 text-red-500" /> 健康打卡</h2>
        
        <!-- 睡眠打卡 -->
        <div v-if="goal.sub_type === '睡眠'" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                睡觉时间 *
              </label>
              <input
                v-model="healthData.sleepTime"
                type="time"
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                起床时间 *
              </label>
              <input
                v-model="healthData.wakeTime"
                type="time"
                class="input"
              />
            </div>
          </div>
          
          <div v-if="sleepHours !== null" class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">睡眠时长：</span>
              <span class="text-lg font-semibold text-blue-900 dark:text-blue-100">{{ sleepHours }}小时</span>
            </div>
            <div class="mt-2 text-sm">
              <span :class="isEarlyEnough ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ isEarlyEnough ? '✅' : '❌' }} 早睡达标
              </span>
              <span class="mx-2">·</span>
              <span :class="isLongEnough ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ isLongEnough ? '✅' : '❌' }} 时长达标
              </span>
            </div>
          </div>
        </div>
        
        <!-- 喝水打卡 -->
        <div v-if="goal.sub_type === '喝水'" class="space-y-4">
          <!-- 显示今日累计 -->
          <div class="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">今日累计：</span>
              <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {{ todayWaterTotal }} / {{ goal.health_config.targetWaterCups }} 杯
              </span>
            </div>
            <div class="text-4xl mb-2">
              {{ '💧'.repeat(Math.min(todayWaterTotal, goal.health_config.targetWaterCups)) }}{{ '░'.repeat(Math.max(0, goal.health_config.targetWaterCups - todayWaterTotal)) }}
            </div>
            <div v-if="todayWaterTotal >= goal.health_config.targetWaterCups" class="text-center text-sm text-green-600 dark:text-green-400 font-medium">
              🎉 今日目标已达成！
            </div>
            <div v-else class="text-center text-sm text-gray-500 dark:text-gray-400">
              还需喝 {{ goal.health_config.targetWaterCups - todayWaterTotal }} 杯
            </div>
          </div>
          
          <!-- 本次打卡 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
              <span>本次喝了几杯？*</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">（多次打卡会累加）</span>
            </label>
            <div class="flex items-center space-x-4">
              <button
                @click="healthData.waterCups = Math.max(0, healthData.waterCups - 1)"
                class="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-2xl transition-colors"
              >
                -
              </button>
              <div class="text-center flex-1">
                <div class="text-5xl font-bold text-primary-600 dark:text-primary-400">{{ healthData.waterCups }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">杯</div>
              </div>
              <button
                @click="healthData.waterCups++"
                class="w-12 h-12 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-2xl transition-colors"
              >
                +
              </button>
            </div>
          </div>
          
          <!-- 打卡记录 -->
          <div v-if="todayWaterRecords.length > 0" class="space-y-2">
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300">今日打卡记录：</div>
            <div class="space-y-1">
              <div
                v-for="(record, index) in todayWaterRecords"
                :key="index"
                class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
              >
                <span class="text-gray-600 dark:text-gray-400">{{ formatTime(record.created_at) }}</span>
                <span class="font-medium text-primary-600 dark:text-primary-400">{{ record.health_data.waterCups }} 杯</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 减肥打卡 -->
        <div v-if="goal.sub_type === '减肥'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              今日体重（kg）*
            </label>
            <input
              v-model.number="healthData.weight"
              type="number"
              step="0.1"
              placeholder="65.5"
              class="input"
            />
          </div>
          
          <div v-if="healthData.weight" class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">当前BMI：</span>
              <span class="text-lg font-semibold text-blue-900 dark:text-blue-100">{{ calculateBMI }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">距离目标：</span>
              <span class="text-lg font-semibold" :class="weightDiff > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
                {{ Math.abs(weightDiff).toFixed(1) }}kg
              </span>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              今日运动（可选）
            </label>
            <input
              v-model="healthData.exercise"
              type="text"
              placeholder="跑步30分钟"
              class="input"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              饮食记录（可选）
            </label>
            <textarea
              v-model="healthData.diet"
              placeholder="早餐：燕麦粥..."
              rows="3"
              class="input resize-none"
            />
          </div>
        </div>
        
        <!-- 运动打卡 -->
        <div v-if="goal.sub_type === '运动'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              运动类型 *
            </label>
            <input
              v-model="exerciseItem.type"
              type="text"
              placeholder="跑步/俯卧撑/游泳..."
              class="input"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                运动量
              </label>
              <input
                v-model.number="exerciseItem.amount"
                type="number"
                placeholder="5"
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                单位
              </label>
              <select v-model="exerciseItem.unit" class="input">
                <option value="km">公里</option>
                <option value="个">个</option>
                <option value="次">次</option>
                <option value="分钟">分钟</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              用时（分钟，可选）
            </label>
            <input
              v-model.number="exerciseItem.duration"
              type="number"
              placeholder="30"
              class="input"
            />
          </div>
        </div>
        
        <!-- 通用完成状态 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            完成情况 *
          </label>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="status in completionStatuses"
              :key="status.value"
              @click="checkInData.status = status.value"
              :class="[
                'p-3 rounded-lg border-2 transition-all',
                checkInData.status === status.value
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
              ]"
            >
              <component :is="status.icon" class="w-8 h-8 mx-auto mb-1" :class="status.color" />
              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ status.label }}</div>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 提交按钮 -->
      <div class="flex space-x-3">
        <router-link to="/" class="btn btn-secondary flex-1">
          取消
        </router-link>
        <button
          @click="submitCheckIn"
          :disabled="!canSubmit || submitting"
          class="btn btn-success flex-1 flex items-center justify-center"
          :class="{ 'opacity-50 cursor-not-allowed': !canSubmit || submitting }"
        >
          <span v-if="submitting">提交中...</span>
          <span v-else class="flex items-center"><CheckIcon class="w-5 h-5 mr-1" /> 提交打卡</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGoalsStore } from '@/stores/goals'
import { useCheckInsStore } from '@/stores/checkins'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/config/supabase'
import dayjs from 'dayjs'
import RichNoteEditor from '@/components/RichNoteEditor.vue'
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  HeartIcon,
  ClockIcon,
  BeakerIcon,
  MinusIcon,
  ScaleIcon,
  ArrowPathIcon,
  XCircleIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const goalsStore = useGoalsStore()
const checkInsStore = useCheckInsStore()
const userStore = useUserStore()
const toastStore = useToastStore()

const loading = ref(true)
const submitting = ref(false)
const goal = ref(null)
const showTaskEditor = ref(false)
const todayTasks = ref([])
const todayWaterRecords = ref([]) // 今日喝水打卡记录
const isEarlyWindow = ref(false)
const effectiveDate = ref('')

const completionStatuses = [
  { value: 'completed', label: '完成', icon: CheckCircleIcon, color: 'text-green-500' },
  { value: 'partial', label: '部分完成', icon: ExclamationTriangleIcon, color: 'text-yellow-500' },
  { value: 'missed', label: '未完成', icon: XMarkIcon, color: 'text-red-500' }
]

const checkInData = ref({
  status: 'completed'
})

const learningData = ref({
  taskName: '',
  targetAmount: 0,
  actualAmount: '',
  timeSpent: 0,
  notes: '',
  attachments: []
})

// 判断是否为灵活模式
const isFlexibleMode = computed(() => {
  return goal.value?.plan?.flexibleMode === true
})

// 计算今日喝水总杯数
const todayWaterTotal = computed(() => {
  if (goal.value?.sub_type !== '喝水') return 0
  return todayWaterRecords.value.reduce((sum, record) => {
    return sum + (record.health_data?.waterCups || 0)
  }, 0)
})

const healthData = ref({
  sleepTime: '',
  wakeTime: '',
  waterCups: 0,
  weight: null,
  exercise: '',
  diet: ''
})

const exerciseItem = ref({
  type: '',
  amount: 0,
  unit: 'km',
  duration: 0
})

// 添加任务
function addTask() {
  todayTasks.value.push('')
}

// 删除任务
function removeTask(index) {
  todayTasks.value.splice(index, 1)
}

// 格式化时间
function formatTime(datetime) {
  return dayjs(datetime).format('HH:mm')
}

const todayTask = computed(() => {
  if (!goal.value) return ''
  
  if (goal.value.type === '学习类' && goal.value.plan) {
    // 灵活模式：使用通用模板
    if (goal.value.plan.flexibleMode) {
      if (goal.value.plan.dailyTaskTemplate) {
        return `${goal.value.plan.dailyTaskTemplate.taskName} (${goal.value.plan.dailyTaskTemplate.target}${goal.value.plan.dailyTaskTemplate.unit})`
      }
      return '每日学习任务'
    }
    
    // 计划模式：从详细计划中获取
    const startDate = dayjs(goal.value.start_date || goal.value.created_at)
    const today = dayjs()
    const daysPassed = today.diff(startDate, 'day')
    const weekNumber = Math.floor(daysPassed / 7) + 1
    const dayOfWeek = (daysPassed % 7) + 1
    
    // 从 weeklyTasks 中获取对应周的任务
    if (goal.value.plan.weeklyTasks && Array.isArray(goal.value.plan.weeklyTasks)) {
      const currentWeekTask = goal.value.plan.weeklyTasks.find(w => w.week === weekNumber)
      
      if (currentWeekTask && currentWeekTask.dailyTasks && Array.isArray(currentWeekTask.dailyTasks)) {
        // 找到今天的任务（根据dayOfWeek）
        const todayTaskData = currentWeekTask.dailyTasks.find(d => d.day === dayOfWeek)
        
        if (todayTaskData && todayTaskData.tasks && todayTaskData.tasks.length > 0) {
          // 返回今天的任务列表（每个任务前加上项目符号）
          return '• ' + todayTaskData.tasks.join('\n• ')
        }
      }
      
      // 如果当前周没有详细的每日任务，显示周重点
      if (currentWeekTask && currentWeekTask.focus) {
        return `本周重点：${currentWeekTask.focus}`
      }
    }
    
    // 兼容旧格式（dailyTaskTemplate）
    if (goal.value.plan.dailyTaskTemplate) {
      return `${goal.value.plan.dailyTaskTemplate.taskName} (${goal.value.plan.dailyTaskTemplate.target}${goal.value.plan.dailyTaskTemplate.unit})`
    }
  }
  
  return '今日任务'
})

const sleepHours = computed(() => {
  if (!healthData.value.sleepTime || !healthData.value.wakeTime) return null
  const sleep = dayjs(`2000-01-01 ${healthData.value.sleepTime}`)
  let wake = dayjs(`2000-01-01 ${healthData.value.wakeTime}`)
  if (wake.isBefore(sleep)) {
    wake = wake.add(1, 'day')
  }
  return wake.diff(sleep, 'hour', true).toFixed(1)
})

const isEarlyEnough = computed(() => {
  if (!healthData.value.sleepTime || !goal.value?.health_config?.targetSleepTime) return false
  return healthData.value.sleepTime <= goal.value.health_config.targetSleepTime
})

const isLongEnough = computed(() => {
  if (!sleepHours.value || !goal.value?.health_config?.targetSleepHours) return false
  return parseFloat(sleepHours.value) >= goal.value.health_config.targetSleepHours
})

const calculateBMI = computed(() => {
  if (!healthData.value.weight) return '-'
  // 假设身高1.7m，实际应该保存在用户配置中
  const height = 1.7
  const bmi = healthData.value.weight / (height * height)
  return bmi.toFixed(1)
})

const weightDiff = computed(() => {
  if (!healthData.value.weight || !goal.value?.health_config?.targetWeight) return 0
  return healthData.value.weight - goal.value.health_config.targetWeight
})

const canSubmit = computed(() => {
  if (!checkInData.value.status) return false
  
  if (goal.value?.type === '学习类') {
    return true
  } else if (goal.value?.type === '健康类') {
    if (goal.value.sub_type === '睡眠') {
      return healthData.value.sleepTime && healthData.value.wakeTime
    } else if (goal.value.sub_type === '喝水') {
      return healthData.value.waterCups > 0
    } else if (goal.value.sub_type === '减肥') {
      return healthData.value.weight !== null
    } else if (goal.value.sub_type === '运动') {
      return exerciseItem.value.type && exerciseItem.value.amount
    }
  }
  return false
})

async function submitCheckIn() {
  if (!canSubmit.value) return
  
  submitting.value = true
  try {
    const date = await checkInsStore.getEffectiveDateForGoal(goal.value.id, goal.value)
    const data = {
      user_id: userStore.user.id,
      goal_id: goal.value.id,
      status: checkInData.value.status,
      date
    }
    
    if (goal.value.type === '学习类') {
      data.learning_data = {
        taskName: goal.value.plan?.dailyTaskTemplate?.taskName || '学习任务',
        targetAmount: goal.value.plan?.dailyTaskTemplate?.target || 0,
        actualAmount: learningData.value.actualAmount,
        timeSpent: learningData.value.timeSpent,
        notes: learningData.value.notes,
        attachments: learningData.value.attachments.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.preview
        })),
        // 灵活模式：保存今日任务列表
        todayTasks: isFlexibleMode.value ? todayTasks.value.filter(t => t.trim()) : undefined
      }
    } else if (goal.value.type === '健康类') {
      if (goal.value.sub_type === '睡眠') {
        data.health_data = {
          sleepTime: healthData.value.sleepTime,
          wakeTime: healthData.value.wakeTime,
          sleepHours: parseFloat(sleepHours.value),
          earlyEnough: isEarlyEnough.value,
          longEnough: isLongEnough.value
        }
      } else if (goal.value.sub_type === '喝水') {
        // 计算本次打卡后的总杯数
        const newTotal = todayWaterTotal.value + healthData.value.waterCups
        
        // 自动判断完成状态
        if (newTotal >= goal.value.health_config.targetWaterCups) {
          data.status = 'completed'
        } else {
          data.status = 'partial'
        }
        
        data.health_data = {
          waterCups: healthData.value.waterCups, // 本次打卡的杯数
          totalCups: newTotal, // 今日总杯数
          targetCups: goal.value.health_config.targetWaterCups
        }
      } else if (goal.value.sub_type === '减肥') {
        data.health_data = {
          weight: healthData.value.weight,
          bmi: parseFloat(calculateBMI.value),
          exercise: healthData.value.exercise,
          diet: healthData.value.diet
        }
      } else if (goal.value.sub_type === '运动') {
        data.health_data = {
          exercises: [{
            type: exerciseItem.value.type,
            amount: exerciseItem.value.amount,
            unit: exerciseItem.value.unit,
            duration: exerciseItem.value.duration
          }]
        }
      }
    }
    
    const result = await checkInsStore.createCheckIn(data)
    if (result.success) {
      // 喝水打卡成功后不跳转，重置输入并刷新记录
      if (goal.value.type === '健康类' && goal.value.sub_type === '喝水') {
        toastStore.success(`打卡成功！本次 +${healthData.value.waterCups} 杯`)
        
        // 将新记录添加到记录列表
        todayWaterRecords.value.push(result.data)
        
        // 重置本次打卡数量
        healthData.value.waterCups = 1
        
        // 如果已达标，提示并询问是否返回首页
        if (todayWaterTotal.value >= goal.value.health_config.targetWaterCups) {
          const goHome = confirm('恭喜！今日目标已达成！\n\n是否返回首页？')
          if (goHome) {
            router.push('/app/today')
          }
        }
      } else {
        // 其他类型的打卡正常跳转
        toastStore.success('打卡成功！')
        router.push('/app/today')
      }
    } else {
      toastStore.error('打卡失败：' + result.error)
    }
  } catch (error) {
    toastStore.error('打卡出错：' + error.message)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  loading.value = true
  const goalId = route.params.goalId
  goal.value = await goalsStore.getGoalById(goalId)
  
  // 初始化默认值
  if (goal.value?.type === '学习类') {
    learningData.value.taskName = goal.value.plan?.dailyTaskTemplate?.taskName || ''
    learningData.value.targetAmount = goal.value.plan?.dailyTaskTemplate?.target || 0
    
    // 灵活模式：初始化todayTasks
    if (goal.value.plan?.flexibleMode) {
      // 尝试加载昨天的任务作为参考
      const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
      const yesterdayCheckIns = await checkInsStore.getCheckInsByDateRange(yesterday, yesterday, {
        select: 'id, goal_id, date, learning_data'
      })
      const yesterdayCheckIn = yesterdayCheckIns.find(c => c.goal_id === goalId)
      
      if (yesterdayCheckIn?.learning_data?.todayTasks && Array.isArray(yesterdayCheckIn.learning_data.todayTasks)) {
        // 复制昨天的任务作为今日参考
        todayTasks.value = [...yesterdayCheckIn.learning_data.todayTasks]
      } else {
        // 默认添加一个空任务
        todayTasks.value = [goal.value.plan.dailyTaskTemplate?.description || '']
      }
    }
  } else if (goal.value?.type === '健康类') {
    if (goal.value.sub_type === '喝水') {
      // 加载有效日期（喝水必须当天）的喝水打卡记录
      const today = await checkInsStore.getEffectiveDateForGoal(goalId)
      const todayCheckIns = await checkInsStore.getCheckInsByDateRange(today, today, {
        select: 'id, goal_id, date, status, health_data, created_at'
      })
      todayWaterRecords.value = todayCheckIns.filter(c => 
        c.goal_id === goalId && c.health_data?.waterCups
      )
      
      // 默认本次打卡1杯
      healthData.value.waterCups = 1
    }
  }
  
  // 提示与有效日期
  isEarlyWindow.value = dayjs().hour() < 2
  effectiveDate.value = await checkInsStore.getEffectiveDateForGoal(goalId)
  
  loading.value = false
})
</script>
