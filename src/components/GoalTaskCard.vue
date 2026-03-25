<template>
  <div class="card hover:shadow-lg transition-all cursor-pointer" @click="goToDetail">
    <div class="card-body">
      <div class="flex items-start justify-between">
        <!-- 左侧：目标信息 -->
        <div class="flex-1">
          <div class="flex items-center mb-2">
            <h3 class="font-semibold text-gray-900 dark:text-white text-lg">{{ goal.title }}</h3>
            <span
              v-if="goal.strict_level"
              class="ml-2 badge"
              :class="{
                'badge-danger': goal.strict_level === '严格',
                'badge-primary': goal.strict_level === '标准',
                'badge-success': goal.strict_level === '弹性'
              }"
            >
              {{ goal.strict_level }}
            </span>
          </div>
          
          <!-- 今日任务 -->
          <div v-if="todayTask" class="mb-3">
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
              <ClipboardDocumentListIcon class="w-4 h-4 mr-1" /> 今日任务：
            </div>
            <div class="text-gray-700 dark:text-gray-200 bg-blue-50 dark:bg-gray-800/50 rounded p-2 border border-blue-100 dark:border-gray-700">
              {{ todayTask.name }}
              <span v-if="todayTask.target" class="text-primary-600 dark:text-primary-400 font-medium ml-2">
                ({{ isCumulativeType && checkedIn ? '目标' : '预计' }}{{ todayTask.target }}{{ todayTask.unit }})
              </span>
            </div>
            <div v-if="todayTask.emphasis" class="text-xs text-orange-600 mt-1 flex items-start">
              <LightBulbIcon class="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" /> {{ todayTask.emphasis }}
            </div>
            <!-- 累积打卡显示进度提示 -->
            <div v-if="isCumulativeType && checkedIn" class="text-xs text-green-600 mt-1 flex items-center">
              <CheckIcon class="w-3 h-3 mr-1" />
              <span>已打卡，可继续累加</span>
            </div>
          </div>
          
          <!-- 进度信息 -->
          <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div v-if="goal.progress">
              <span class="font-medium">进度：</span>
              <span class="text-primary-600">{{ goal.progress.percentage || 0 }}%</span>
            </div>
            <div v-if="daysRemaining !== null">
              <span class="font-medium">剩余：</span>
              <span>{{ daysRemaining }}天</span>
            </div>
            <div v-if="streakDays > 0" class="flex items-center text-orange-500">
              <FireIcon class="w-4 h-4 mr-1" />
              <span>连续{{ streakDays }}天</span>
            </div>
          </div>
        </div>
        
        <!-- 右侧：打卡按钮 -->
        <div class="ml-4">
          <!-- 累积打卡类型：始终显示打卡按钮 -->
          <button
            v-if="isCumulativeType"
            @click.stop="$emit('checkin')"
            :class="checkedIn ? 'btn btn-success' : 'btn btn-primary'"
            class="flex items-center"
          >
            <PencilSquareIcon class="w-4 h-4 mr-1" />
            {{ checkedIn ? '继续打卡' : '去打卡' }}
          </button>
          
          <!-- 普通打卡：打卡后显示已完成 -->
          <template v-else>
            <button
              v-if="!checkedIn"
              @click.stop="$emit('checkin')"
              class="btn btn-primary flex items-center"
            >
              <PencilSquareIcon class="w-4 h-4 mr-1" /> 去打卡
            </button>
            <div v-else class="text-center">
              <CheckIcon class="w-8 h-8 text-green-600 mb-1 mx-auto" />
              <div class="text-xs text-green-600 font-medium">已完成</div>
            </div>
          </template>
        </div>
      </div>
      
      <!-- 进度条 -->
      <div v-if="goal.progress" class="mt-4">
        <div class="progress">
          <div
            class="progress-bar"
            :style="{ width: (goal.progress.percentage || 0) + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { 
  ClipboardDocumentListIcon, 
  LightBulbIcon, 
  CheckIcon, 
  FireIcon, 
  PencilSquareIcon 
} from '@heroicons/vue/24/outline'

const props = defineProps({
  goal: {
    type: Object,
    required: true
  },
  checkedIn: {
    type: Boolean,
    default: false
  }
})

defineEmits(['checkin'])

// 判断是否为累积打卡类型（可以一天多次打卡）
const isCumulativeType = computed(() => {
  if (props.goal.type === '健康类') {
    // 喝水、运动等可以多次打卡累积
    return ['喝水', '运动'].includes(props.goal.sub_type)
  }
  return false
})

// 计算今日任务
const todayTask = computed(() => {
  if (props.goal.type === '学习类' && props.goal.plan) {
    // 计算目标已经进行了多少周和今天是第几天
    const startDate = dayjs(props.goal.start_date || props.goal.created_at)
    const today = dayjs()
    const daysPassed = today.diff(startDate, 'day')
    const weekNumber = Math.floor(daysPassed / 7) + 1 // 第几周（从1开始）
    const dayOfWeek = (daysPassed % 7) + 1 // 本周第几天（从1开始）
    
    // 从 weeklyTasks 中获取对应周的任务
    if (props.goal.plan.weeklyTasks && Array.isArray(props.goal.plan.weeklyTasks)) {
      const currentWeekTask = props.goal.plan.weeklyTasks.find(w => w.week === weekNumber)
      
      if (currentWeekTask && currentWeekTask.dailyTasks && Array.isArray(currentWeekTask.dailyTasks)) {
        // 找到今天的任务（根据dayOfWeek）
        const todayTaskData = currentWeekTask.dailyTasks.find(d => d.day === dayOfWeek)
        
        if (todayTaskData && todayTaskData.tasks && todayTaskData.tasks.length > 0) {
          // 返回今天的任务列表
          return {
            name: todayTaskData.tasks.join('；'), // 多个任务用分号连接
            target: todayTaskData.estimatedTime,
            unit: '分钟',
            emphasis: todayTaskData.emphasis
          }
        }
      }
      
      // 如果当前周没有详细的每日任务，显示周重点
      if (currentWeekTask && currentWeekTask.focus) {
        return {
          name: currentWeekTask.focus,
          target: null,
          unit: ''
        }
      }
    }
    
    // 兼容旧格式（dailyTaskTemplate）
    if (props.goal.plan.dailyTaskTemplate) {
      return {
        name: props.goal.plan.dailyTaskTemplate.taskName,
        target: props.goal.plan.dailyTaskTemplate.target,
        unit: props.goal.plan.dailyTaskTemplate.unit
      }
    }
  } else if (props.goal.type === '健康类' && props.goal.health_config) {
    // 健康类目标的今日任务
    const config = props.goal.health_config
    if (props.goal.sub_type === '喝水') {
      return {
        name: '喝水',
        target: config.targetWaterCups || 8,
        unit: '杯'
      }
    } else if (props.goal.sub_type === '睡眠') {
      return {
        name: '早睡',
        target: config.targetSleepTime,
        unit: ''
      }
    } else if (props.goal.sub_type === '减肥') {
      return {
        name: '记录体重',
        target: config.targetWeight,
        unit: 'kg'
      }
    } else if (props.goal.sub_type === '运动') {
      return {
        name: '运动打卡',
        target: null,
        unit: ''
      }
    }
  }
  return null
})

// 计算剩余天数
const daysRemaining = computed(() => {
  if (!props.goal.end_date) return null
  const today = dayjs()
  const endDate = dayjs(props.goal.end_date)
  return endDate.diff(today, 'day')
})

// 连续打卡天数（示例，实际需要从数据库获取）
const streakDays = computed(() => {
  // 这里应该从checkIns store获取
  return 0
})

// 跳转到目标详情
const router = useRouter()
const goToDetail = () => {
  if (props.goal && props.goal.id) {
    router.push(`/app/goals/${props.goal.id}`)
  }
}
</script>

