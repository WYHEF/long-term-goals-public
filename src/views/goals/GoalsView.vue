<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <TrophyIcon class="w-8 h-8 text-primary-600 mr-3" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">目标管理</h1>
      </div>
      <router-link to="/app/goals/create" class="btn btn-primary flex items-center">
        <PlusIcon class="w-5 h-5 mr-1" />
        创建新目标
      </router-link>
    </div>

    <!-- 统计概览卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card card-body text-center p-4">
        <div class="text-3xl font-bold text-primary-600">{{ activeGoalsCount }}</div>
        <div class="text-sm text-gray-600 mt-1 dark:text-gray-300">进行中目标</div>
      </div>
      <div class="card card-body text-center p-4">
        <div class="text-3xl font-bold text-green-600">{{ completedGoalsCount }}</div>
        <div class="text-sm text-gray-600 mt-1 dark:text-gray-300">已完成目标</div>
      </div>
      <div class="card card-body text-center p-4">
        <div class="text-3xl font-bold text-orange-600">{{ totalCheckInsCount }}</div>
        <div class="text-sm text-gray-600 mt-1 dark:text-gray-300">累计打卡</div>
      </div>
      <div class="card card-body text-center p-4">
        <div class="text-3xl font-bold text-blue-600">{{ totalLearningHours }}</div>
        <div class="text-sm text-gray-600 mt-1 dark:text-gray-300">本月学习时长(h)</div>
      </div>
    </div>

    <!-- 成长日历（全宽显示） -->
    <div class="card card-body bg-white dark:bg-gray-800">
      <h2 class="section-title flex items-center text-lg mb-4">
        <CalendarIcon class="w-5 h-5 mr-2 text-primary-600" />
        成长日历
      </h2>
      <HeatmapCalendar />
    </div>

    <!-- 主要内容区域：左侧列表，右侧统计 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- 左侧：目标列表 (占比 2/3) -->
      <div class="lg:col-span-8 space-y-6">
        <!-- 状态筛选 Tabs -->
        <div class="flex space-x-2 overflow-x-auto pb-2">
          <button
            @click="currentTab = 'active'"
            :class="[
              'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center',
              currentTab === 'active'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            ]"
          >
            <RocketLaunchIcon class="w-4 h-4 mr-2" />
            进行中 ({{ activeGoals.length }})
          </button>
          <button
            @click="currentTab = 'paused'"
            :class="[
              'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center',
              currentTab === 'paused'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            ]"
          >
            <PauseCircleIcon class="w-4 h-4 mr-2" />
            已暂停 ({{ pausedGoals.length }})
          </button>
          <button
            @click="currentTab = 'completed'"
            :class="[
              'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center',
              currentTab === 'completed'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            ]"
          >
            <CheckBadgeIcon class="w-4 h-4 mr-2" />
            已完成 ({{ completedGoals.length }})
          </button>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-12">
          <div class="flex justify-center mb-4"><ArrowPathIcon class="w-10 h-10 animate-spin text-gray-400" /></div>
          <p class="text-gray-600 dark:text-gray-300">加载中...</p>
        </div>

        <!-- 目标列表内容 -->
        <div v-else>
          <!-- 进行中的目标 -->
          <div v-if="currentTab === 'active'">
            <div v-if="activeGoals.length === 0" class="text-center py-12 card bg-white dark:bg-gray-800">
              <div class="flex justify-center mb-4"><RocketLaunchIcon class="w-16 h-16 text-primary-200" /></div>
              <p class="text-gray-600 dark:text-gray-300 mb-4">还没有进行中的目标</p>
              <router-link to="/goals/create" class="btn btn-primary flex items-center mx-auto w-fit">
                <PlusIcon class="w-5 h-5 mr-1" />
                创建第一个目标
              </router-link>
            </div>
            <div v-else class="grid grid-cols-1 gap-6">
              <GoalCard
                v-for="goal in activeGoals"
                :key="goal.id"
                :goal="goal"
                @pause="handlePause"
                @complete="handleComplete"
              />
            </div>
          </div>
          
          <!-- 已暂停的目标 -->
          <div v-if="currentTab === 'paused'">
            <div v-if="pausedGoals.length === 0" class="text-center py-12 card bg-white dark:bg-gray-800">
              <div class="flex justify-center mb-4"><PauseCircleIcon class="w-16 h-16 text-gray-300" /></div>
              <p class="text-gray-600 dark:text-gray-300">没有暂停的目标</p>
            </div>
            <div v-else class="grid grid-cols-1 gap-6">
              <GoalCard
                v-for="goal in pausedGoals"
                :key="goal.id"
                :goal="goal"
                @resume="handleResume"
              />
            </div>
          </div>
          
          <!-- 已完成的目标 -->
          <div v-if="currentTab === 'completed'">
            <div v-if="completedGoals.length === 0" class="text-center py-12 card bg-white dark:bg-gray-800">
              <div class="flex justify-center mb-4"><TrophyIcon class="w-16 h-16 text-yellow-300" /></div>
              <p class="text-gray-600 dark:text-gray-300">还没有完成的目标，继续加油！</p>
            </div>
            <div v-else class="grid grid-cols-1 gap-6">
              <GoalCard
                v-for="goal in completedGoals"
                :key="goal.id"
                :goal="goal"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：数据统计面板 (占比 1/3) -->
      <div class="lg:col-span-4 space-y-6">
        <!-- 周报总结 -->
        <div class="card card-body bg-white dark:bg-gray-800">
          <div class="flex items-center justify-between mb-4">
            <h2 class="section-title flex items-center text-lg mb-0">
              <PresentationChartLineIcon class="w-5 h-5 mr-2 text-primary-600" />
              数据周报
            </h2>
            <div class="flex space-x-1">
              <button
                @click="reportType = 'week'"
                :class="[
                  'px-2 py-1 rounded text-xs font-medium transition-all',
                  reportType === 'week'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                ]"
              >
                本周
              </button>
              <button
                @click="reportType = 'month'"
                :class="[
                  'px-2 py-1 rounded text-xs font-medium transition-all',
                  reportType === 'month'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                ]"
              >
                本月
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <!-- 统计小方块 -->
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <div class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ weeklyStats.totalCheckIns }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">打卡次数</div>
              </div>
              <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <div class="text-xl font-bold text-green-600 dark:text-green-400">{{ weeklyStats.completionRate }}%</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">完成率</div>
              </div>
            </div>

            <!-- 最佳表现 -->
            <div v-if="weeklyStats.bestLearningGoal" class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
              <div class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <TrophyIcon class="w-4 h-4 mr-1 text-yellow-500" /> 最佳学习表现
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate" :title="weeklyStats.bestLearningGoal">
                {{ weeklyStats.bestLearningGoal }}
              </div>
            </div>

            <!-- 鼓励语 -->
            <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
              <div class="flex items-center text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">
                <FireIcon class="w-4 h-4 mr-1" /> 状态评估
              </div>
              <div class="text-xs text-orange-700 dark:text-orange-400 leading-relaxed">
                {{ weeklyStats.encouragement }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGoalsStore } from '@/stores/goals'
import { useCheckInsStore } from '@/stores/checkins'
import { useUserStore } from '@/stores/user'
import GoalCard from '@/components/GoalCard.vue'
import HeatmapCalendar from '@/components/HeatmapCalendar.vue'
import dayjs from 'dayjs'
import { 
  PlusIcon, 
  ArrowPathIcon, 
  RocketLaunchIcon, 
  PauseCircleIcon, 
  TrophyIcon,
  ChartBarIcon,
  CalendarIcon,
  PresentationChartLineIcon,
  FireIcon,
  FlagIcon,
  CheckBadgeIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const goalsStore = useGoalsStore()
const checkInsStore = useCheckInsStore()
const userStore = useUserStore()

const currentTab = ref('active')
const loading = ref(true)
const reportType = ref('week')
const totalCheckInsAllTime = ref(0)

const activeGoals = computed(() => goalsStore.activeGoals)
const pausedGoals = computed(() => goalsStore.pausedGoals)
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
    startDate = dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD')
    endDate = dayjs().format('YYYY-MM-DD')
  } else {
    startDate = dayjs().startOf('month').format('YYYY-MM-DD')
    endDate = dayjs().format('YYYY-MM-DD')
  }
  
  const periodCheckIns = checkIns.filter(c => {
    const checkInDate = c.date
    return checkInDate >= startDate && checkInDate <= endDate
  })
  
  const totalCheckIns = periodCheckIns.length
  const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1
  const completionRate = totalDays > 0 ? Math.round((totalCheckIns / (totalDays * (activeGoals.value.length || 1))) * 100) : 0
  
  const learningHours = (periodCheckIns
    .filter(c => c.learning_data)
    .reduce((sum, c) => sum + (c.learning_data.timeSpent || 0), 0) / 60).toFixed(1)
  
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
        bestLearningGoal = `${goal.title} (${count}次)`
      } else if (goal.type === '健康类' && count > maxHealthCheckIns) {
        maxHealthCheckIns = count
        bestHealthGoal = `${goal.title} (${count}次)`
      }
    }
  }
  
  let encouragement = '加油！坚持就是胜利！'
  if (completionRate >= 90) encouragement = '表现优异！继续保持节奏！'
  else if (completionRate >= 70) encouragement = '很不错！距离目标越来越近！'
  else if (completionRate >= 50) encouragement = '有进步！再加把劲！'
  else if (completionRate > 0) encouragement = '开始很重要，坚持更重要！'
  else encouragement = '新的一天，从现在开始行动吧！'
  
  return {
    totalCheckIns,
    completionRate: Math.min(completionRate, 100),
    learningHours,
    bestLearningGoal,
    bestHealthGoal,
    encouragement
  }
})

async function handlePause(goalId) {
  if (confirm('确定要暂停这个目标吗？')) {
    await goalsStore.pauseGoal(goalId)
  }
}

async function handleResume(goalId) {
  await goalsStore.resumeGoal(goalId)
}

async function handleComplete(goalId) {
  if (confirm('确定已经完成这个目标了吗？')) {
    await goalsStore.completeGoal(goalId)
  }
}

function goToGoalDetail(goalId) {
  router.push(`/app/goals/${goalId}`)
}

onMounted(async () => {
  loading.value = true
  try {
    const monthStart = dayjs().startOf('month').format('YYYY-MM-DD')
    const today = dayjs().format('YYYY-MM-DD')

    // 1. 先获取基础数据
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
    
    // 2. 如果用户已登录，尝试更新进度（非阻塞，不需要await）
    if (userStore.user?.id) {
      const todayKey = dayjs().format('YYYY-MM-DD')
      const storageKey = `progressRecalcLastRun_${userStore.user.id}`
      const lastRun = localStorage.getItem(storageKey)

      if (lastRun !== todayKey) {
        localStorage.setItem(storageKey, todayKey)
        checkInsStore.recalculateAllProgress(userStore.user.id)
          .catch(err => console.warn('后台更新进度失败:', err))
      }
        
      // 不需要再次 fetchGoals，因为 updateGoalProgress 只更新数据库
      // 如果需要最新进度，可以单个更新本地状态，或者在 recalculateAllProgress 后统一拉取
      // 但为了页面快速响应，这里先不阻塞
    }
  } catch (error) {
    console.error('加载目标数据失败:', error)
  } finally {
    loading.value = false
  }
})
</script>
