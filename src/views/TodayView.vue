<template>
  <div class="space-y-6">
    <!-- 页面标题和日期 -->
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <h1 class="page-title">今日任务</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-3">{{ todayDate }}</p>
        <!-- 每日名言 -->
        <div class="max-w-2xl">
          <QuoteCard />
        </div>
      </div>
      <div class="text-right">
        <div class="text-3xl font-bold text-primary-600">
          {{ overallProgress }}%
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">今日完成度</div>
      </div>
    </div>
    
    <!-- 两栏布局：左侧任务 2/3，右侧倒数日 1/3（桌面端）；移动端垂直布局 -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- 左侧：今日任务（2/3） -->
      <div class="flex-1 lg:w-2/3 space-y-6">
        <!-- 整体进度条 -->
        <div class="card card-body">
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-gray-700 dark:text-gray-300">今日进度</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ completedTasksCount }} / {{ totalTasksCount }}</span>
          </div>
          <div class="progress">
            <div
              class="progress-bar"
              :style="{ width: overallProgress + '%' }"
            ></div>
          </div>
        </div>
        
        <!-- 本周总结 -->
        <div v-if="activeGoals.length > 0" class="card card-body">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <CalendarIcon class="w-5 h-5 mr-2" /> 本周情况
          </h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-primary-600">{{ weekStats.completedDays }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">完成天数</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-primary-600">{{ weekStats.totalHours }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">学习时长(h)</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-primary-600">{{ weekStats.streakDays }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">连续天数</div>
            </div>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-12">
          <div class="mb-4 flex justify-center"><ArrowPathIcon class="w-10 h-10 animate-spin text-primary-500" /></div>
          <p class="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
        
        <!-- 无目标提示 -->
        <div v-else-if="activeGoals.length === 0" class="text-center py-12">
          <div class="mb-4 flex justify-center"><TrophyIcon class="w-16 h-16 text-primary-200" /></div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">还没有进行中的目标</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">创建第一个目标，开始你的成长之旅！</p>
          <router-link to="/app/goals/create" class="btn btn-primary btn-lg">
            创建目标
          </router-link>
        </div>
        
        <!-- 任务列表 -->
        <div v-else class="space-y-6">
          <!-- 学习类任务 -->
          <div v-if="learningGoals.length > 0">
            <h2 class="section-title flex items-center">
              <BookOpenIcon class="w-5 h-5 mr-2" />
              学习类
            </h2>
            <div class="space-y-3">
              <GoalTaskCard
                v-for="goal in learningGoals"
                :key="goal.id"
                :goal="goal"
                :checked-in="isCheckedInToday(goal.id)"
                @checkin="goToCheckIn(goal.id)"
              />
            </div>
          </div>
          
          <!-- 健康类任务 -->
          <div v-if="healthGoals.length > 0">
            <h2 class="section-title flex items-center">
              <HeartIcon class="w-5 h-5 mr-2 text-red-500" />
              健康类
            </h2>
            <div class="space-y-3">
              <GoalTaskCard
                v-for="goal in healthGoals"
                :key="goal.id"
                :goal="goal"
                :checked-in="isCheckedInToday(goal.id)"
                @checkin="goToCheckIn(goal.id)"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧：重要日期提醒（1/3） -->
      <div class="lg:w-1/3 space-y-4">
        <div class="lg:sticky lg:top-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="section-title flex items-center">
              <ClockIcon class="w-5 h-5 mr-2 text-orange-500" />
              重要日期提醒
            </h2>
            <router-link to="/countdowns" class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center">
              全部 <ArrowRightIcon class="w-3 h-3 ml-1" />
            </router-link>
          </div>
          
          <!-- 倒数日卡片 -->
          <div v-if="urgentCountdowns.length > 0" class="space-y-3">
            <CountdownCard
              v-for="countdown in urgentCountdowns"
              :key="countdown.id"
              :countdown="countdown"
              :show-actions="false"
            />
          </div>
          
          <!-- 空状态 -->
          <div v-else class="card card-body text-center py-8">
            <div class="mb-2 flex justify-center"><CalendarIcon class="w-10 h-10 text-gray-300" /></div>
            <p class="text-gray-500 text-sm mb-3 dark:text-gray-400">暂无紧急倒数日</p>
            <router-link to="/countdowns" class="text-primary-600 text-sm hover:underline dark:text-primary-400 flex items-center justify-center">
              添加倒数日 <ArrowRightIcon class="w-3 h-3 ml-1" />
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGoalsStore } from '@/stores/goals'
import { useCheckInsStore } from '@/stores/checkins'
import { useCountdownsStore } from '@/stores/countdowns'
import GoalTaskCard from '@/components/GoalTaskCard.vue'
import CountdownCard from '@/components/CountdownCard.vue'
import QuoteCard from '@/components/QuoteCard.vue'
import dayjs from 'dayjs'
import { 
  CalendarIcon, 
  BookOpenIcon, 
  HeartIcon, 
  ClockIcon, 
  TrophyIcon,
  ArrowPathIcon,
  ArrowRightIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const goalsStore = useGoalsStore()
const checkInsStore = useCheckInsStore()
const countdownsStore = useCountdownsStore()

const loading = ref(true)
const todayCheckIns = ref([])

// 计算属性
const todayDate = computed(() => dayjs().format('YYYY年MM月DD日 dddd'))

const activeGoals = computed(() => goalsStore.activeGoals)

const learningGoals = computed(() => {
  const goals = activeGoals.value.filter(g => g.type === '学习类')
  // 按照打卡状态排序：未打卡的在前，已打卡的在后
  return goals.sort((a, b) => {
    const aChecked = isCheckedInToday(a.id)
    const bChecked = isCheckedInToday(b.id)
    if (aChecked === bChecked) return 0
    return aChecked ? 1 : -1  // 未打卡的排前面
  })
})

const healthGoals = computed(() => {
  const goals = activeGoals.value.filter(g => g.type === '健康类')
  // 按照打卡状态排序：未打卡的在前，已打卡的在后
  return goals.sort((a, b) => {
    const aChecked = isCheckedInToday(a.id)
    const bChecked = isCheckedInToday(b.id)
    if (aChecked === bChecked) return 0
    return aChecked ? 1 : -1  // 未打卡的排前面
  })
})

const totalTasksCount = computed(() => activeGoals.value.length)

// 统计完成的目标数（按 goal_id 去重）
const completedTasksCount = computed(() => {
  // 获取今天已打卡的所有唯一目标ID
  const uniqueGoalIds = new Set(todayCheckIns.value.map(c => c.goal_id))
  
  // 遍历每个已打卡的目标，检查是否真正完成
  let completedCount = 0
  
  for (const goalId of uniqueGoalIds) {
    const goal = activeGoals.value.find(g => g.id === goalId)
    if (!goal) continue
    
    // 获取该目标今天的所有打卡记录
    const goalCheckIns = todayCheckIns.value.filter(c => c.goal_id === goalId)
    
    // 判断是否完成
    if (goal.type === '健康类') {
      // 检查是否有累积类型的健康目标
      const subType = goal.sub_type
      
      if (subType === '喝水') {
        // 喝水目标：计算今日累计是否达标
        const totalCups = goalCheckIns.reduce((sum, c) => {
          return sum + (c.health_data?.waterCups || 0)
        }, 0)
        const targetCups = goal.target_value || 8
        if (totalCups >= targetCups) {
          completedCount++
        }
      } else if (subType === '运动') {
        // 运动目标：检查是否有完成状态的打卡
        if (goalCheckIns.some(c => c.status === 'completed')) {
          completedCount++
        }
      } else {
        // 其他健康目标：有打卡记录就算完成
        if (goalCheckIns.some(c => c.status === 'completed')) {
          completedCount++
        }
      }
    } else {
      // 学习类目标：有打卡记录就算完成
      if (goalCheckIns.some(c => c.status === 'completed')) {
        completedCount++
      }
    }
  }
  
  return completedCount
})

const overallProgress = computed(() => {
  if (totalTasksCount.value === 0) return 0
  const progress = Math.round((completedTasksCount.value / totalTasksCount.value) * 100)
  // 确保不超过100%
  return Math.min(progress, 100)
})

// 紧急倒数日（60天内或置顶的）
const urgentCountdowns = computed(() => {
  const now = dayjs()
  return countdownsStore.countdowns
    .filter(c => {
      const diff = dayjs(c.target_date).diff(now, 'day')
      // 显示60天内的或者置顶的倒数日
      return (diff >= 0 && diff <= 60) || c.is_pinned
    })
    .filter(c => !c.is_completed) // 过滤已完成的
    .sort((a, b) => {
      // 置顶的优先
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1
      // 按日期排序，最近的在前
      return dayjs(a.target_date).diff(dayjs(b.target_date))
    })
})

// 本周统计（动态计算）
const weekStats = ref({
  completedDays: 0,
  totalHours: 0,
  streakDays: 0
})

// 计算本周统计数据
async function calculateWeekStats() {
  try {
    const weekStart = dayjs().startOf('week')
    const weekEnd = dayjs().endOf('week')
    
    // 获取本周所有打卡记录
    const weekCheckIns = await checkInsStore.getCheckInsByDateRange(
      weekStart.format('YYYY-MM-DD'),
      weekEnd.format('YYYY-MM-DD')
    )
    
    // 计算完成天数（去重日期）
    const uniqueDays = new Set(
      weekCheckIns.map(c => dayjs(c.created_at).format('YYYY-MM-DD'))
    )
    weekStats.value.completedDays = uniqueDays.size
    
    // 计算学习时长（只统计学习类目标）
    const learningCheckIns = weekCheckIns.filter(c => {
      const goal = goalsStore.goals.find(g => g.id === c.goal_id)
      return goal && goal.type === '学习类'
    })
    // learning_data.timeSpent 存储的是分钟数
    const totalMinutes = learningCheckIns.reduce((sum, c) => {
      const timeSpent = c.learning_data?.timeSpent || 0
      return sum + timeSpent
    }, 0)
    weekStats.value.totalHours = Math.round(totalMinutes / 60 * 10) / 10 // 保留1位小数
    
    // 计算连续打卡天数
    weekStats.value.streakDays = await calculateStreakDays()
  } catch (error) {
    console.error('计算本周统计失败:', error)
  }
}

// 计算连续打卡天数
async function calculateStreakDays() {
  try {
    const baseDateStr = checkInsStore.getEffectiveDate()
    const baseDate = dayjs(baseDateStr)
    const startDate = baseDate.subtract(29, 'day').format('YYYY-MM-DD')
    const endDate = baseDate.format('YYYY-MM-DD')

    const recent = await checkInsStore.getCheckInsByDateRange(startDate, endDate, {
      select: 'id, date'
    })

    const hasCheckInByDate = new Set((recent || []).map(c => dayjs(c.date).format('YYYY-MM-DD')))

    let streak = 0
    for (let i = 0; i < 30; i++) {
      const d = baseDate.subtract(i, 'day').format('YYYY-MM-DD')
      if (!hasCheckInByDate.has(d)) break
      streak++
    }
    return streak
  } catch (error) {
    console.error('计算连续天数失败:', error)
    return 0
  }
}

// 方法
function isCheckedInToday(goalId) {
  return todayCheckIns.value.some(c => c.goal_id === goalId)
}

function goToCheckIn(goalId) {
  router.push(`/app/checkin/${goalId}`)
}

// 初始化
onMounted(async () => {
  loading.value = true
  try {
    await goalsStore.fetchGoals({
      select: 'id,title,type,sub_type,strict_level,status,start_date,end_date,completed_at,created_at,progress,plan,health_config'
    })
    todayCheckIns.value = await checkInsStore.getTodayCheckIns()
    // 加载倒数日
    await countdownsStore.fetchCountdowns()
    // 计算本周统计
    await calculateWeekStats()
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

