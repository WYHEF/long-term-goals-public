<template>
  <div 
    class="card card-body hover:shadow-lg transition-all duration-200 cursor-pointer"
    @click="goToDetail"
  >
    <div class="flex items-start justify-between mb-4">
      <!-- 左侧：图标 + 标题信息 -->
      <div class="flex items-start space-x-3 flex-1">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center" :class="iconBgClass">
            <component :is="typeIcon" class="w-8 h-8" />
          </div>
        </div>
        
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">{{ goal.title }}</h3>
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span class="badge" :class="typeBadgeClass">
              {{ goal.type }}
            </span>
            <span class="badge" :class="strictBadgeClass">
              {{ goal.strict_level }}
            </span>
            <span v-if="goal.status === '已完成'" class="badge badge-success flex items-center">
              <CheckCircleIcon class="w-3 h-3 mr-1" /> 已完成
            </span>
            <span v-if="goal.status === '已暂停'" class="badge badge-warning flex items-center">
              <PauseCircleIcon class="w-3 h-3 mr-1" /> 已暂停
            </span>
          </div>
        </div>
      </div>
      
      <!-- 右侧：圆形进度环 -->
      <div class="flex-shrink-0 ml-3" v-if="goal.progress">
        <CircularProgress 
          :percentage="goal.progress.percentage || 0"
          :size="70"
          :stroke-width="6"
          :progress-color="progressColor"
          background-color="#e5e7eb"
        />
      </div>
    </div>
      
    <!-- 操作按钮 -->
    <div class="flex justify-end space-x-2 mb-3" @click.stop>
      <button
        v-if="goal.status === '进行中'"
        @click="$emit('pause', goal.id)"
        class="btn btn-secondary btn-sm flex items-center"
        title="暂停"
      >
        <PauseIcon class="w-4 h-4" />
      </button>
      <button
        v-if="goal.status === '已暂停'"
        @click="$emit('resume', goal.id)"
        class="btn btn-success btn-sm flex items-center"
        title="恢复"
      >
        <PlayIcon class="w-4 h-4" />
      </button>
      <button
        v-if="goal.status === '进行中'"
        @click="$emit('complete', goal.id)"
        class="btn btn-success btn-sm flex items-center"
        title="完成"
      >
        <CheckIcon class="w-4 h-4" />
      </button>
    </div>
      
    <!-- 时间和统计信息 -->
    <div class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
      <div class="flex items-center space-x-4 text-sm">
        <div class="flex items-center space-x-1">
          <CalendarIcon class="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span class="text-gray-600 dark:text-gray-300">{{ formatDate(goal.start_date) || '-' }}</span>
        </div>
        
        <div v-if="goal.end_date" class="flex items-center space-x-1">
          <FlagIcon class="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span class="text-gray-600 dark:text-gray-300">{{ formatDate(goal.end_date) }}</span>
        </div>
      </div>
      
      <div v-if="goal.status === '已完成' && goal.completed_at" class="flex items-center space-x-1 text-sm">
        <SparklesIcon class="w-4 h-4 text-green-600 dark:text-green-400" />
        <span class="text-green-600 dark:text-green-400 font-medium">{{ formatDate(goal.completed_at) }}</span>
      </div>
      <div v-else-if="daysRemaining !== null" class="flex items-center space-x-1 px-2 py-1 rounded text-sm" :class="daysRemaining < 7 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'">
        <ClockIcon class="w-4 h-4" />
        <span class="font-semibold">{{ daysRemaining }}天</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import CircularProgress from './CircularProgress.vue'
import {
  AcademicCapIcon,
  HeartIcon,
  CheckCircleIcon,
  PauseCircleIcon,
  PauseIcon,
  PlayIcon,
  CheckIcon,
  CalendarIcon,
  FlagIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  goal: {
    type: Object,
    required: true
  }
})

defineEmits(['pause', 'resume', 'complete'])

const router = useRouter()

const typeIcon = computed(() => {
  return props.goal.type === '学习类' ? AcademicCapIcon : HeartIcon
})

// 图标背景色
const iconBgClass = computed(() => {
  if (props.goal.status === '已完成') {
    return 'bg-green-100 dark:bg-green-900/30'
  } else if (props.goal.status === '已暂停') {
    return 'bg-gray-100 dark:bg-gray-700'
  } else if (props.goal.type === '学习类') {
    return 'bg-primary-100 dark:bg-primary-900/30'
  } else {
    return 'bg-orange-100 dark:bg-orange-900/30'
  }
})

// 进度环颜色
const progressColor = computed(() => {
  if (props.goal.status === '已完成') {
    return '#10b981' // green-500
  } else if (props.goal.type === '学习类') {
    return '#3b82f6' // blue-500
  } else {
    return '#f97316' // orange-500
  }
})

// 类型标签样式
const typeBadgeClass = computed(() => {
  return props.goal.type === '学习类' ? 'badge-primary' : 'badge-warning'
})

// 严格程度标签样式
const strictBadgeClass = computed(() => {
  const level = props.goal.strict_level
  if (level === '严格') return 'badge-danger'
  if (level === '标准') return 'badge-primary'
  return 'badge-success'
})

const daysRemaining = computed(() => {
  if (!props.goal.end_date) return null
  const today = dayjs()
  const endDate = dayjs(props.goal.end_date)
  return endDate.diff(today, 'day')
})

function formatDate(date) {
  if (!date) return null
  return dayjs(date).format('YYYY-MM-DD')
}

function goToDetail() {
  router.push(`/app/goals/${props.goal.id}`)
}
</script>

