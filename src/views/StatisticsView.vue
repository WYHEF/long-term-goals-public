<template>
  <div class="space-y-6">
    <div class="flex items-center">
      <ChartBarIcon class="w-8 h-8 text-primary-600 mr-3" />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">数据统计</h1>
    </div>
    
    <!-- 总览卡片 -->
    <div class="grid md:grid-cols-4 gap-4">
      <div class="card card-body text-center">
        <div class="text-3xl font-bold text-primary-600">{{ activeGoalsCount }}</div>
        <div class="text-sm text-gray-600 mt-1 dark:text-gray-300">进行中目标</div>
      </div>
      <div class="card card-body text-center">
        <div class="text-3xl font-bold text-green-600">{{ completedGoalsCount }}</div>
        <div class="text-sm text-gray-600 mt-1 dark:text-gray-300">已完成目标</div>
      </div>
      <div class="card card-body text-center">
        <div class="text-3xl font-bold text-orange-600">{{ totalCheckInsCount }}</div>
        <div class="text-sm text-gray-600 mt-1 dark:text-gray-300">累计打卡</div>
      </div>
      <div class="card card-body text-center">
        <div class="text-3xl font-bold text-blue-600">{{ totalLearningHours }}</div>
        <div class="text-sm text-gray-600 mt-1 dark:text-gray-300">本月学习时长(h)</div>
      </div>
    </div>
    
    <!-- 我的成长日历（全局热力图） -->
    <div class="card card-body">
      <h2 class="section-title flex items-center">
        <CalendarIcon class="w-6 h-6 mr-2 text-primary-600" />
        我的成长日历
      </h2>
      <HeatmapCalendar />
    </div>
    
    <!-- 目标进度总览 -->
    <div class="card card-body">
      <h2 class="section-title flex items-center">
        <FlagIcon class="w-6 h-6 mr-2 text-primary-600" />
        目标进度总览
      </h2>
      <div v-if="activeGoals.length === 0" class="text-center py-8 text-gray-500">
        还没有进行中的目标
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="goal in activeGoals"
          :key="goal.id"
          class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          @click="goToGoalDetail(goal.id)"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-gray-900 dark:text-gray-100">{{ goal.title }}</span>
            <span class="text-sm font-semibold text-primary-600 dark:text-primary-400">
              {{ goal.progress?.percentage || 0 }}%
            </span>
          </div>
          <div class="progress">
            <div
              class="progress-bar"
              :style="{ width: (goal.progress?.percentage || 0) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 周报/月报 -->
    <div class="card card-body">
      <div class="flex items-center justify-between mb-4">
        <h2 class="section-title mb-0">📈 周报总结</h2>
        <div class="flex space-x-2">
          <button
            @click="reportType = 'week'"
            :class="[
              'px-3 py-1 rounded-lg text-sm font-medium transition-all',
              reportType === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            本周
          </button>
          <button
            @click="reportType = 'month'"
            :class="[
              'px-3 py-1 rounded-lg text-sm font-medium transition-all',
              reportType === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            本月
          </button>
        </div>
      </div>
      
      <!-- 完成情况统计卡片 -->
      <div class="grid md:grid-cols-3 gap-4 mb-4">
        <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ weeklyStats.totalCheckIns }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">总打卡次数</div>
        </div>
        <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ weeklyStats.completionRate }}%</div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">完成率</div>
        </div>
        <div class="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-center">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ weeklyStats.learningHours }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">学习时长(小时)</div>
        </div>
      </div>
      
      <!-- 最佳表现 -->
      <div v-if="weeklyStats.bestLearningGoal || weeklyStats.bestHealthGoal" class="grid md:grid-cols-2 gap-4 mb-4">
        <div v-if="weeklyStats.bestLearningGoal" class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 class="font-semibold text-green-900 dark:text-green-300 mb-2 flex items-center">
            <TrophyIcon class="w-5 h-5 mr-2 text-green-600" />
            学习类最佳表现
          </h3>
          <p class="text-gray-700 dark:text-gray-300 text-sm">{{ weeklyStats.bestLearningGoal }}</p>
        </div>
        <div v-if="weeklyStats.bestHealthGoal" class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 class="font-semibold text-green-900 dark:text-green-300 mb-2 flex items-center">
            <TrophyIcon class="w-5 h-5 mr-2 text-green-600" />
            健康类最佳表现
          </h3>
          <p class="text-gray-700 dark:text-gray-300 text-sm">{{ weeklyStats.bestHealthGoal }}</p>
        </div>
      </div>
      
      <!-- 鼓励语 -->
      <div class="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h3 class="font-semibold text-yellow-900 dark:text-yellow-300 mb-2 flex items-center">
          <FireIcon class="w-5 h-5 mr-2 text-yellow-600" />
          继续保持
        </h3>
        <p class="text-gray-700 dark:text-gray-300">{{ weeklyStats.encouragement }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGoalsStore } from '@/stores/goals'
import { useCheckInsStore } from '@/stores/checkins'
import HeatmapCalendar from '@/components/HeatmapCalendar.vue'
import dayjs from 'dayjs'

const router = useRouter()
const goalsStore = useGoalsStore()
const checkInsStore = useCheckInsStore()

const reportType = ref('week')
const loading = ref(true)
const totalCheckInsAllTime = ref(0)

const activeGoals = computed(() => goalsStore.activeGoals)
const completedGoals = computed(() => goalsStore.completedGoals)

const activeGoalsCount = computed(() => activeGoals.value.length)
const completedGoalsCount = computed(() => completedGoals.value.length)

const totalCheckInsCount = computed(() => totalCheckInsAllTime.value)

const totalLearningHours = computed(() => {
  const hours = checkInsStore.checkIns
    .filter(c => c.learning_data)
    .reduce((sum, c) => sum + (c.learning_data.timeSpent || 0), 0) / 60
  return hours.toFixed(1)
})

// 计算周报/月报数据
const weeklyStats = computed(() => {
  const checkIns = checkInsStore.checkIns
  let startDate, endDate
  
  if (reportType.value === 'week') {
    // 本周：周一到今天
    startDate = dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD')
    endDate = dayjs().format('YYYY-MM-DD')
  } else {
    // 本月：1号到今天
    startDate = dayjs().startOf('month').format('YYYY-MM-DD')
    endDate = dayjs().format('YYYY-MM-DD')
  }
  
  // 过滤指定时间范围的打卡记录
  const periodCheckIns = checkIns.filter(c => {
    const checkInDate = c.date
    return checkInDate >= startDate && checkInDate <= endDate
  })
  
  // 计算总打卡次数
  const totalCheckIns = periodCheckIns.length
  
  // 计算完成率（有打卡的天数 / 总天数）
  const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1
  const completionRate = totalDays > 0 ? Math.round((totalCheckIns / (totalDays * activeGoals.value.length || 1)) * 100) : 0
  
  // 计算学习时长
  const learningHours = (periodCheckIns
    .filter(c => c.learning_data)
    .reduce((sum, c) => sum + (c.learning_data.timeSpent || 0), 0) / 60).toFixed(1)
  
  // 找出表现最好的目标（打卡次数最多）- 分别统计学习类和健康类
  const goalCheckInCounts = {}
  periodCheckIns.forEach(c => {
    const goalId = c.goal_id
    goalCheckInCounts[goalId] = (goalCheckInCounts[goalId] || 0) + 1
  })
  
  let bestLearningGoal = null
  let bestHealthGoal = null
  let maxLearningCheckIns = 0
  let maxHealthCheckIns = 0
  
  for (const [goalId, count] of Object.entries(goalCheckInCounts)) {
    const goal = goalsStore.goals.find(g => g.id === goalId)
    if (goal) {
      if (goal.type === '学习类' && count > maxLearningCheckIns) {
        maxLearningCheckIns = count
        bestLearningGoal = `${goal.title} - 连续${count}次打卡`
      } else if (goal.type === '健康类' && count > maxHealthCheckIns) {
        maxHealthCheckIns = count
        bestHealthGoal = `${goal.title} - 连续${count}次打卡`
      }
    }
  }
  
  // 生成鼓励语
  let encouragement = '加油！坚持就是胜利！'
  if (completionRate >= 90) {
    encouragement = '表现优异！继续保持这个高效的节奏，你正在成为更好的自己！'
  } else if (completionRate >= 70) {
    encouragement = '很不错！保持这个势头，距离目标越来越近了！'
  } else if (completionRate >= 50) {
    encouragement = '有进步！再加把劲，相信你能做得更好！'
  } else if (completionRate > 0) {
    encouragement = '开始很重要，坚持更重要。继续加油！'
  } else {
    encouragement = '新的一周开始了，制定计划，从现在开始行动吧！'
  }
  
  return {
    totalCheckIns,
    completionRate: Math.min(completionRate, 100),
    learningHours,
    bestLearningGoal,
    bestHealthGoal,
    encouragement
  }
})

function goToGoalDetail(goalId) {
  router.push(`/app/goals/${goalId}`)
}

onMounted(async () => {
  loading.value = true
  const monthStart = dayjs().startOf('month').format('YYYY-MM-DD')
  const today = dayjs().format('YYYY-MM-DD')

  await Promise.all([
    goalsStore.fetchGoals({
      select: 'id,title,type,sub_type,strict_level,status,start_date,end_date,completed_at,created_at,progress'
    }),
    checkInsStore.fetchCheckIns(null, monthStart, today, {
      select: 'id, goal_id, date, status, learning_data',
      storeResult: true,
      useCache: true
    }),
    (async () => {
      totalCheckInsAllTime.value = await checkInsStore.getCheckInsCount()
    })()
  ])
  loading.value = false
})

// 监听 reportType 变化，自动更新数据
watch(() => reportType.value, () => {
  // computed 会自动重新计算
})
</script>

