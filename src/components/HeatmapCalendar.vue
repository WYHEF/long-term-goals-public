<template>
  <div class="heatmap-container">
    <!-- 加载状态 -->
    <div v-if="!dataLoaded" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <div class="flex justify-center mb-2">
        <ArrowPathIcon class="w-8 h-8 animate-spin text-primary-500" />
      </div>
      <p>加载打卡数据中...</p>
    </div>
    
    <!-- 热力图内容 -->
    <div v-else class="heatmap-wrapper">
      <!-- 顶部：统计信息和年份选择 -->
      <div class="flex items-center justify-between mb-4">
        <div class="text-sm text-gray-700 dark:text-gray-300">
          <span class="font-semibold">{{ totalContributions }}</span> 次打卡 in {{ selectedYear }}
        </div>
        <div class="year-selector">
          <button
            v-for="year in availableYears"
            :key="year"
            @click="selectedYear = year"
            :class="[
              'year-button',
              selectedYear === year ? 'year-button-active' : 'year-button-inactive'
            ]"
          >
            {{ year }}
          </button>
        </div>
      </div>
      
      <!-- 热力图主体 -->
      <div class="contribution-graph">
        <!-- 月份标签 -->
        <div class="months-row">
          <div class="month-spacer"></div>
          <div class="months-container">
            <span 
              v-for="(month, index) in monthLabels" 
              :key="index"
              :style="{ gridColumn: `span ${month.weeks}` }"
              class="month-label"
            >
              {{ month.name }}
            </span>
          </div>
        </div>
        
        <!-- 星期标签和格子 -->
        <div class="graph-row">
          <!-- 星期标签 -->
          <div class="weekday-labels">
            <span class="weekday-label">Mon</span>
            <span class="weekday-label"></span>
            <span class="weekday-label">Wed</span>
            <span class="weekday-label"></span>
            <span class="weekday-label">Fri</span>
            <span class="weekday-label"></span>
            <span class="weekday-label"></span>
          </div>
          
          <!-- 日期格子 -->
          <div class="weeks-container">
            <div 
              v-for="(week, weekIndex) in weeks" 
              :key="weekIndex"
              class="week-column"
            >
              <div
                v-for="(day, dayIndex) in week"
                :key="dayIndex"
                :class="['day-cell', getDayClass(day)]"
                :title="getDayTooltip(day)"
                @click="handleDayClick(day)"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 图例 -->
      <div class="legend-container">
        <span class="legend-text">Less</span>
        <div class="legend-boxes">
          <div class="legend-box level-0"></div>
          <div class="legend-box level-1"></div>
          <div class="legend-box level-2"></div>
          <div class="legend-box level-3"></div>
          <div class="legend-box level-4"></div>
        </div>
        <span class="legend-text">More</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useCheckInsStore } from '@/stores/checkins'
import dayjs from 'dayjs'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  goalId: {
    type: String,
    default: null
  }
})

const checkInsStore = useCheckInsStore()
const checkInsData = ref([])
const dataLoaded = ref(false)
const selectedYear = ref(new Date().getFullYear())

// 可选择的年份（从第一次打卡到今年）
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  
  // 从2024年开始到当前年份
  for (let year = 2024; year <= currentYear; year++) {
    years.push(year)
  }
  
  return years.reverse() // 最新年份在前
})

const checkInCountsByDate = computed(() => {
  const map = new Map()
  for (const c of checkInsData.value || []) {
    if (!c?.date) continue
    const dateStr =
      typeof c.date === 'string' && c.date.match(/^\d{4}-\d{2}-\d{2}$/)
        ? c.date
        : dayjs(c.date).format('YYYY-MM-DD')
    map.set(dateStr, (map.get(dateStr) || 0) + 1)
  }
  return map
})

// 总打卡次数
const totalContributions = computed(() => {
  if (!dataLoaded.value) return 0
  return checkInsData.value.length
})

// 生成选定年份的所有周数据
const weeks = computed(() => {
  if (!dataLoaded.value) {
    return []
  }
  
  const year = selectedYear.value
  const startDate = dayjs(`${year}-01-01`)
  const endDate = dayjs(`${year}-12-31`)
  
  // 找到第一个周一
  let currentDate = startDate
  while (currentDate.day() !== 1) {
    currentDate = currentDate.subtract(1, 'day')
  }
  
  const weeksData = []
  
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
    const week = []
    
    for (let i = 0; i < 7; i++) {
      const dateStr = currentDate.format('YYYY-MM-DD')
      const isInYear = currentDate.year() === year
      
      week.push({
        date: dateStr,
        count: isInYear ? getCheckInCount(dateStr) : -1, // -1 表示不在当前年份
        isInYear: isInYear
      })
      
      currentDate = currentDate.add(1, 'day')
    }
    
    weeksData.push(week)
  }
  
  return weeksData
})

// 月份标签（计算每个月占据的周数）
const monthLabels = computed(() => {
  if (!dataLoaded.value || weeks.value.length === 0) {
    return []
  }
  
  const labels = []
  let currentMonth = null
  let weekCount = 0
  
  // 遍历每一周
  weeks.value.forEach(week => {
    // 取每周的第一天（周一）
    const firstDay = week[0]
    if (!firstDay.isInYear) return
    
    const month = dayjs(firstDay.date).format('MMM')
    
    if (month !== currentMonth) {
      if (currentMonth !== null) {
        labels.push({
          name: currentMonth,
          weeks: weekCount
        })
      }
      currentMonth = month
      weekCount = 1
    } else {
      weekCount++
    }
  })
  
  // 添加最后一个月
  if (currentMonth !== null) {
    labels.push({
      name: currentMonth,
      weeks: weekCount
    })
  }
  
  return labels
})

function getCheckInCount(date) {
  return checkInCountsByDate.value.get(date) || 0
}

function getDayClass(day) {
  if (!day.isInYear) return 'level-empty'
  if (day.count === 0) return 'level-0'
  if (day.count === 1) return 'level-1'
  if (day.count <= 3) return 'level-2'
  if (day.count <= 6) return 'level-3'
  return 'level-4'
}

function getDayTooltip(day) {
  if (!day.isInYear) return ''
  if (day.count === 0) return `${day.date}: 无打卡`
  return `${day.date}: ${day.count}次打卡`
}

function handleDayClick(day) {
  if (day.isInYear && day.count > 0) {
    console.log('点击日期:', day.date, '打卡次数:', day.count)
  }
}

async function loadYearData(year) {
  dataLoaded.value = false

  const currentYear = new Date().getFullYear()
  const startDate = dayjs(`${year}-01-01`).format('YYYY-MM-DD')
  const endDate =
    year === currentYear
      ? dayjs().format('YYYY-MM-DD')
      : dayjs(`${year}-12-31`).format('YYYY-MM-DD')

  try {
    const data = await checkInsStore.fetchCheckIns(props.goalId, startDate, endDate, {
      select: 'id, goal_id, date',
      storeResult: false,
      useCache: true
    })
    checkInsData.value = data || []
    
    // 等待数据设置完成后再标记为已加载
    await nextTick()
    dataLoaded.value = true
  } catch (error) {
    // 忽略 406 错误，因为这可能是由于没有打卡数据导致的
    if (error.status !== 406) {
      console.error('加载热力图数据失败:', error)
    }
    checkInsData.value = []
    dataLoaded.value = true
  }
}

onMounted(async () => {
  await loadYearData(selectedYear.value)
})

watch(
  () => selectedYear.value,
  async (year) => {
    await loadYearData(year)
  }
)

watch(
  () => props.goalId,
  async () => {
    await loadYearData(selectedYear.value)
  }
)
</script>

<style scoped>
.heatmap-container {
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.heatmap-container::-webkit-scrollbar {
  display: none;
}

.heatmap-wrapper {
  width: 100%;
}

/* 年份选择器 */
.year-selector {
  display: flex;
  gap: 4px;
  background: #f3f4f6;
  padding: 2px;
  border-radius: 6px;
}

:global(.dark) .year-selector {
  background: #374151;
}

.year-button {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.year-button-active {
  background: #2563eb;
  color: white;
}

.year-button-inactive {
  background: transparent;
  color: #6b7280;
}

:global(.dark) .year-button-inactive {
  color: #9ca3af;
}

.year-button-inactive:hover {
  background: #e5e7eb;
}

:global(.dark) .year-button-inactive:hover {
  background: #4b5563;
}

/* 贡献图 */
.contribution-graph {
  @apply border border-gray-200 rounded-md p-4 bg-white dark:bg-gray-800 dark:border-gray-700;
}

/* 月份行 */
.months-row {
  display: flex;
  margin-bottom: 8px;
}

.month-spacer {
  width: 30px;
  flex-shrink: 0;
}

.months-container {
  flex: 1;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 4px;
}

.month-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
}

:global(.dark) .month-label {
  color: #9ca3af;
}

/* 图表行 */
.graph-row {
  display: flex;
  gap: 8px;
}

/* 星期标签 */
.weekday-labels {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 30px;
  flex-shrink: 0;
}

.weekday-label {
  flex: 1;
  font-size: 10px;
  color: #6b7280;
  display: flex;
  align-items: center;
}

:global(.dark) .weekday-label {
  color: #9ca3af;
}

/* 周容器 */
.weeks-container {
  flex: 1;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 4px;
}

.week-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 日期格子 */
.day-cell {
  width: 100%;
  aspect-ratio: 1;
  max-width: 15px;
  max-height: 15px;
  min-width: 10px;
  min-height: 10px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.1s;
}

.day-cell:hover {
  outline: 2px solid rgba(0, 0, 0, 0.3);
  outline-offset: -1px;
}

:global(.dark) .day-cell:hover {
  outline-color: rgba(255, 255, 255, 0.3);
}

/* 空白（不在当前年份） */
.level-empty {
  background-color: transparent;
  cursor: default;
}

.level-empty:hover {
  outline: none;
}

/* 无打卡 */
.level-0 {
  @apply bg-[#ebedf0] dark:bg-[#1e1e20];
}

/* 1次打卡 */
.level-1 {
  @apply bg-[#9be9a8] dark:bg-[#0e4429];
}

/* 2-3次打卡 */
.level-2 {
  @apply bg-[#40c463] dark:bg-[#006d32];
}

/* 4-6次打卡 */
.level-3 {
  @apply bg-[#30a14e] dark:bg-[#26a641];
}

/* 7+次打卡 */
.level-4 {
  @apply bg-[#216e39] dark:bg-[#39d353];
}

/* 图例 */
.legend-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 12px;
}

.legend-text {
  font-size: 11px;
  color: #6b7280;
}

:global(.dark) .legend-text {
  color: #9ca3af;
}

.legend-boxes {
  display: flex;
  gap: 3px;
}

.legend-box {
  width: 11px;
  height: 11px;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .contribution-graph {
    padding: 12px;
  }
  
  .day-cell {
    width: 10px;
    height: 10px;
  }
  
  .week-column {
    gap: 3px;
  }
  
  .weeks-container {
    gap: 3px;
  }
}
</style>

