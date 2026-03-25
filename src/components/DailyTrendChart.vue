<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-bold text-gray-900 dark:text-white text-sm flex items-center">
        <PresentationChartLineIcon class="w-4 h-4 mr-2 text-primary-600" />
        投入趋势
      </h3>
      <div class="flex bg-gray-100 dark:bg-gray-700 rounded-md p-0.5">
        <button
          v-for="range in ranges"
          :key="range.value"
          @click="rangeType = range.value"
          class="px-2 py-0.5 text-xs font-medium rounded-sm transition-all"
          :class="rangeType === range.value 
            ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          {{ range.label }}
        </button>
      </div>
    </div>
    <div ref="chartRef" class="flex-1 w-full min-h-[200px]"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import echarts from '@/utils/echarts'
import dayjs from 'dayjs'
import { PresentationChartLineIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  checkIns: {
    type: Array,
    default: () => []
  },
  currentMonth: {
    type: Object, // dayjs object
    required: true
  }
})

const chartRef = ref(null)
const rangeType = ref(7) // 7 or 30
let chartInstance = null

const ranges = [
  { label: '近7天', value: 7 },
  { label: '近30天', value: 30 }
]

// Process data for the chart
const chartData = computed(() => {
  // Determine the end date
  const today = dayjs()
  let endDate
  
  // If showing current month (or future), end at today
  // If showing past month, end at the end of that month
  if (props.currentMonth.isSame(today, 'month') || props.currentMonth.isAfter(today, 'month')) {
    endDate = today
  } else {
    endDate = props.currentMonth.endOf('month')
  }
  
  const startDate = endDate.subtract(rangeType.value - 1, 'day')
  
  const dates = []
  const values = []
  
  for (let i = 0; i < rangeType.value; i++) {
    const date = startDate.add(i, 'day')
    const dateStr = date.format('YYYY-MM-DD')
    dates.push(date.format('MM-DD'))
    
    const checkIn = props.checkIns.find(c => c.date === dateStr)
    let time = 0
    if (checkIn && checkIn.learning_data && checkIn.learning_data.timeSpent) {
      time = checkIn.learning_data.timeSpent
    }
    values.push(time)
  }
  
  return { dates, values }
})

function initChart() {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  updateChart()
  
  window.addEventListener('resize', handleResize)
}

function updateChart() {
  if (!chartInstance) return
  
  const { dates, values } = chartData.value
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br />投入: {c} 分钟'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#9ca3af'
        }
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 10,
        interval: rangeType.value === 30 ? 4 : 0 // Reduce labels for 30 days view
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1, // Ensure integer ticks if possible
      splitLine: {
        lineStyle: {
          color: '#e5e7eb',
          type: 'dashed'
        }
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 10
      }
    },
    series: [
      {
        name: '投入时间',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: rangeType.value === 30 ? 4 : 6, // Smaller dots for 30 days
        itemStyle: {
          color: '#3b82f6'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(59, 130, 246, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(59, 130, 246, 0.05)'
            }
          ])
        },
        data: values
      }
    ]
  }
  
  // Dark mode adaptation
  const isDark = document.documentElement.classList.contains('dark')
  if (isDark) {
    option.yAxis.splitLine.lineStyle.color = '#374151'
    option.xAxis.axisLine.lineStyle.color = '#4b5563'
    option.xAxis.axisLabel.color = '#9ca3af'
    option.yAxis.axisLabel.color = '#9ca3af'
  }
  
  chartInstance.setOption(option)
}

function handleResize() {
  chartInstance?.resize()
}

watch(() => props.checkIns, () => {
  updateChart()
}, { deep: true })

watch(() => props.currentMonth, () => {
  updateChart()
})

watch(rangeType, () => {
  updateChart()
})

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>
