<template>
  <div
    :class="[
      'rounded-lg p-4 shadow-sm border-l-4 transition-all hover:shadow-md',
      getColorClass(countdown.color),
      countdown.is_pinned ? 'ring-2 ring-offset-2 ring-yellow-400' : ''
    ]"
  >
    <div class="flex items-start justify-between">
      <!-- 左侧内容 -->
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <component :is="getCategoryIconComponent(countdown.category)" class="w-6 h-6" />
          <h3 class="font-semibold text-gray-900 dark:text-white">{{ countdown.title }}</h3>
          <MapPinIcon v-if="countdown.is_pinned" class="w-4 h-4 text-yellow-500" />
        </div>
        
        <p v-if="countdown.description" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {{ countdown.description }}
        </p>
        
        <div class="flex items-center gap-4 text-sm">
          <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <CalendarIcon class="w-4 h-4" />
            <span>{{ formatDateTime(countdown.target_date) }}</span>
          </div>
          
          <div v-if="!isPassed" class="flex items-center gap-1">
            <ClockIcon class="w-4 h-4" />
            <span class="text-gray-600 dark:text-gray-400">{{ formatTime(countdown.target_date) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 右侧倒计时 -->
      <div class="ml-4 text-right">
        <div v-if="!isPassed" class="mb-1">
          <div
            :class="[
              'text-3xl font-bold',
              daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-orange-500' : 'text-blue-600'
            ]"
          >
            {{ daysLeft }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">天</div>
        </div>
        
        <div v-else class="mb-1">
          <div class="text-2xl font-bold text-gray-400">
            已过期
          </div>
          <div class="text-xs text-gray-400">{{ passedDays }}天前</div>
        </div>
        
        <!-- 详细倒计时 -->
        <div v-if="!isPassed && daysLeft <= 30" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ timeLeftDetailed }}
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div v-if="showActions" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
      <button
        @click="$emit('pin', countdown.id)"
        class="text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        :class="countdown.is_pinned ? 'text-yellow-600' : 'text-gray-600 dark:text-gray-300'"
      >
        {{ countdown.is_pinned ? '取消置顶' : '置顶' }}
      </button>
      
      <button
        @click="$emit('edit', countdown)"
        class="text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 transition-colors"
      >
        编辑
      </button>
      
      <button
        v-if="!countdown.is_completed"
        @click="$emit('complete', countdown.id)"
        class="text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-green-600 transition-colors"
      >
        标记完成
      </button>
      
      <button
        @click="$emit('delete', countdown.id)"
        class="text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 transition-colors ml-auto"
      >
        删除
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import {
  AcademicCapIcon,
  CakeIcon,
  SparklesIcon,
  FlagIcon,
  BriefcaseIcon,
  TagIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

dayjs.extend(duration)

const props = defineProps({
  countdown: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

defineEmits(['pin', 'edit', 'delete', 'complete'])

// 计算剩余天数
const now = computed(() => dayjs())
const targetDate = computed(() => dayjs(props.countdown.target_date))
const diffMs = computed(() => targetDate.value.diff(now.value))
const isPassed = computed(() => diffMs.value < 0)
const daysLeft = computed(() => Math.floor(diffMs.value / (1000 * 60 * 60 * 24)))
const passedDays = computed(() => Math.abs(Math.floor(diffMs.value / (1000 * 60 * 60 * 24))))

// 详细倒计时（天时分）
const timeLeftDetailed = computed(() => {
  if (isPassed.value) return ''
  
  const dur = dayjs.duration(diffMs.value)
  const days = Math.floor(dur.asDays())
  const hours = dur.hours()
  const minutes = dur.minutes()
  
  if (days > 0) {
    return `${days}天 ${hours}时 ${minutes}分`
  } else if (hours > 0) {
    return `${hours}时 ${minutes}分`
  } else {
    return `${minutes}分钟`
  }
})

function formatDateTime(date) {
  return dayjs(date).format('YYYY年MM月DD日')
}

function formatTime(date) {
  return dayjs(date).format('HH:mm')
}

function getCategoryIconComponent(category) {
  const map = {
    'exam': AcademicCapIcon,
    'birthday': CakeIcon,
    'anniversary': SparklesIcon,
    'deadline': FlagIcon,
    'work': BriefcaseIcon,
    'other': TagIcon
  }
  return map[category] || TagIcon
}

function getColorClass(color) {
  const classes = {
    blue: 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-800',
    red: 'bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-800',
    green: 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-800',
    yellow: 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-800',
    purple: 'bg-purple-50 border-purple-500 dark:bg-purple-900/20 dark:border-purple-800',
    pink: 'bg-pink-50 border-pink-500 dark:bg-pink-900/20 dark:border-pink-800'
  }
  return classes[color] || classes.blue
}
</script>

