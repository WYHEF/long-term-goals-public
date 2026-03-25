<template>
  <div class="flex flex-col lg:flex-row gap-4 h-full">
    <!-- 左侧：日历视图 (变窄) -->
    <div class="w-full lg:w-80 shrink-0">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
        <!-- 日历头部 -->
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-gray-900 dark:text-white flex items-center text-sm">
            {{ currentMonth.format('YYYY年MM月') }}
          </h3>
          <div class="flex space-x-1">
            <button @click="prevMonth" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
              <ChevronLeftIcon class="w-4 h-4" />
            </button>
            <button @click="nextMonth" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
              <ChevronRightIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 日历网格 -->
        <div class="grid grid-cols-7 gap-1 text-center text-xs mb-1">
          <div v-for="day in weekDays" :key="day" class="text-gray-400 py-0.5 scale-90">{{ day }}</div>
        </div>
        <div class="grid grid-cols-7 gap-1 text-xs">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            @click="selectDay(day)"
            class="h-9 flex flex-col items-center justify-center rounded cursor-pointer transition-all relative border"
            :class="getDayClass(day)"
          >
            <span :class="{'font-bold': day.isToday}">{{ day.date.date() }}</span>
            
            <!-- 状态标记 -->
            <div v-if="day.checkIn" class="mt-0.5">
               <div v-if="day.checkIn.status === 'completed'" class="w-1 h-1 rounded-full bg-green-500"></div>
               <div v-else-if="day.checkIn.status === 'partial'" class="w-1 h-1 rounded-full bg-yellow-500"></div>
               <div v-else-if="day.checkIn.status === 'paused'" class="w-1 h-1 rounded-full bg-gray-400"></div>
            </div>
            <div v-else-if="day.isPast && !day.isFuture" class="mt-0.5">
               <div class="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-600"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间：数据趋势图 -->
    <div class="flex-1 min-w-0 h-[320px] lg:h-auto">
      <DailyTrendChart :check-ins="checkIns" :current-month="currentMonth" />
    </div>

    <!-- 右侧：详情面板 -->
    <div class="w-full lg:w-64 shrink-0">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 h-full flex flex-col">
        <h3 class="font-bold text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center justify-between text-sm">
          <span>{{ selectedDayDisplayDate }}</span>
          <span class="text-[10px] font-normal text-gray-500 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full" v-if="selectedDayInfo?.checkIn">
            {{ getStatusText(selectedDayInfo.checkIn.status) }}
          </span>
        </h3>

        <div v-if="loading" class="flex-1 flex items-center justify-center text-gray-400 text-xs">
          <ArrowPathIcon class="w-4 h-4 animate-spin mr-1.5" /> 加载中...
        </div>

        <div v-else-if="selectedDayInfo?.checkIn" class="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
          <!-- 学习数据 -->
          <div v-if="selectedDayInfo.checkIn.learning_data" class="space-y-2">
            <div v-if="selectedDayInfo.checkIn.learning_data.timeSpent" class="flex items-center text-gray-700 dark:text-gray-300 text-xs">
              <ClockIcon class="w-4 h-4 mr-1.5 text-primary-500" />
              <span>投入 {{ selectedDayInfo.checkIn.learning_data.timeSpent }} 分钟</span>
            </div>

            <!-- 实际完成量 -->
            <div v-if="selectedDayInfo.checkIn.learning_data.actualAmount" class="bg-gray-50 dark:bg-gray-700/30 rounded p-2 border border-gray-100 dark:border-gray-700">
              <div class="text-[10px] text-gray-500 mb-0.5 font-medium">实际完成</div>
              <div class="text-xs text-gray-900 dark:text-white font-medium whitespace-pre-wrap leading-relaxed">
                 {{ selectedDayInfo.checkIn.learning_data.actualAmount }}
              </div>
            </div>
            
            <div v-if="selectedDayInfo.checkIn.learning_data.todayTasks?.length" class="bg-gray-50 dark:bg-gray-700/30 rounded p-2">
              <div class="text-[10px] text-gray-500 mb-1 font-medium">完成任务</div>
              <ul class="space-y-0.5">
                <li v-for="(task, i) in selectedDayInfo.checkIn.learning_data.todayTasks" :key="i" class="flex items-start text-xs text-gray-700 dark:text-gray-300">
                  <CheckIcon class="w-3.5 h-3.5 mr-1 text-green-500 mt-0.5 shrink-0" />
                  <span>{{ task }}</span>
                </li>
              </ul>
            </div>

            <div v-if="selectedDayInfo.checkIn.learning_data.notes" class="text-xs text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded border border-yellow-100 dark:border-yellow-900/30">
              <div class="flex items-center mb-0.5 text-yellow-700 dark:text-yellow-500 font-medium text-[10px]">
                <DocumentTextIcon class="w-3.5 h-3.5 mr-1" /> 笔记
              </div>
              <div class="whitespace-pre-wrap leading-relaxed">{{ selectedDayInfo.checkIn.learning_data.notes }}</div>
            </div>
          </div>

          <!-- 健康数据 -->
          <div v-if="selectedDayInfo.checkIn.health_data" class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
             <div v-if="selectedDayInfo.checkIn.health_data.sleepTime">
                睡眠: {{ selectedDayInfo.checkIn.health_data.sleepTime }} - {{ selectedDayInfo.checkIn.health_data.wakeTime }}
             </div>
             <div v-if="selectedDayInfo.checkIn.health_data.weight">
                体重: {{ selectedDayInfo.checkIn.health_data.weight }}kg
             </div>
             <!-- 更多健康数据可在此扩展 -->
          </div>
        </div>

        <div v-else class="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-8">
          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
            <CalendarIcon class="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <p class="mb-4">该日无打卡记录</p>
          <!-- 仅当是过去的日子且不是未来时显示补卡提示，或者如果是今天显示去打卡 -->
          <!-- 这里暂时只做展示，未来可添加补卡按钮跳转 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCheckInsStore } from '@/stores/checkins'
import dayjs from 'dayjs'
import DailyTrendChart from '@/components/DailyTrendChart.vue'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  goalId: {
    type: String,
    required: true
  }
})

const checkInsStore = useCheckInsStore()
const loading = ref(false)
const currentMonth = ref(dayjs())
const checkIns = ref([])
const selectedDay = ref(dayjs())

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 计算日历天数
const calendarDays = computed(() => {
  const startOfMonth = currentMonth.value.startOf('month')
  const endOfMonth = currentMonth.value.endOf('month')
  const startDay = startOfMonth.day() // 0-6
  const daysInMonth = currentMonth.value.daysInMonth()
  
  const days = []
  
  // 填充上个月的空位
  for (let i = 0; i < startDay; i++) {
    const d = startOfMonth.subtract(startDay - i, 'day')
    days.push({
      date: d,
      isCurrentMonth: false,
      isFuture: d.isAfter(dayjs(), 'day'),
      isPast: d.isBefore(dayjs(), 'day'),
      isToday: d.isSame(dayjs(), 'day'),
      checkIn: getCheckInForDate(d)
    })
  }
  
  // 本月天数
  for (let i = 1; i <= daysInMonth; i++) {
    const d = startOfMonth.date(i)
    days.push({
      date: d,
      isCurrentMonth: true,
      isFuture: d.isAfter(dayjs(), 'day'),
      isPast: d.isBefore(dayjs(), 'day'),
      isToday: d.isSame(dayjs(), 'day'),
      checkIn: getCheckInForDate(d)
    })
  }
  
  // 填充下个月的空位（保持6行）
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = endOfMonth.add(i, 'day')
    days.push({
      date: d,
      isCurrentMonth: false,
      isFuture: d.isAfter(dayjs(), 'day'),
      isPast: d.isBefore(dayjs(), 'day'),
      isToday: d.isSame(dayjs(), 'day'),
      checkIn: getCheckInForDate(d)
    })
  }
  
  return days
})

const selectedDayDisplayDate = computed(() => {
  return selectedDay.value.format('YYYY年MM月DD日')
})

const selectedDayInfo = computed(() => {
  const day = calendarDays.value.find(d => d.date.isSame(selectedDay.value, 'day'))
  // 如果当前视图没找到（比如切月份了但selectedDay还在），尝试直接从checkIns找
  if (day) return day
  
  return {
    date: selectedDay.value,
    checkIn: getCheckInForDate(selectedDay.value)
  }
})

function getCheckInForDate(date) {
  const dateStr = date.format('YYYY-MM-DD')
  return checkIns.value.find(c => c.date === dateStr)
}

function getStatusText(status) {
  const map = {
    'completed': '已完成',
    'partial': '部分完成',
    'missed': '未完成',
    'paused': '暂停'
  }
  return map[status] || status
}

function getDayClass(day) {
  const classes = []
  
  if (!day.isCurrentMonth) classes.push('text-gray-300 dark:text-gray-600')
  else classes.push('text-gray-700 dark:text-gray-300')
  
  // 选中状态
  if (day.date.isSame(selectedDay.value, 'day')) {
    classes.push('ring-2 ring-primary-500 border-transparent z-10')
  } else {
    classes.push('border-transparent hover:bg-gray-50 dark:hover:bg-gray-700')
  }
  
  // 今天的特殊样式
  if (day.isToday) {
    classes.push('bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400')
  }
  
  return classes.join(' ')
}

function selectDay(day) {
  selectedDay.value = day.date
}

async function prevMonth() {
  currentMonth.value = currentMonth.value.subtract(1, 'month')
  await loadCheckIns()
}

async function nextMonth() {
  currentMonth.value = currentMonth.value.add(1, 'month')
  await loadCheckIns()
}

async function loadCheckIns() {
  loading.value = true
  // Fetch more past data to support 30-day trend chart
  const start = currentMonth.value.startOf('month').subtract(35, 'day').format('YYYY-MM-DD')
  const end = currentMonth.value.endOf('month').add(14, 'day').format('YYYY-MM-DD')
  
  checkIns.value = await checkInsStore.fetchCheckIns(props.goalId, start, end, {
    select: 'id, goal_id, date, status, learning_data, health_data',
    storeResult: false,
    useCache: true
  })
  loading.value = false
}

watch(() => props.goalId, () => {
  loadCheckIns()
})

onMounted(() => {
  loadCheckIns()
})
</script>
