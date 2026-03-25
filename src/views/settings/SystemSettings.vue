<template>
  <div class="space-y-6">
    <!-- 主题设置 -->
    <div class="card card-body">
      <h2 class="section-title flex items-center">
        <SwatchIcon class="w-6 h-6 mr-2 text-primary-600" />
        外观
      </h2>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">主题</label>
        <select v-model="theme" class="input">
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="card card-body">
      <h2 class="section-title flex items-center">
        <CircleStackIcon class="w-6 h-6 mr-2 text-primary-600" />
        数据管理
      </h2>
      <div class="space-y-3">
        <div>
          <h3 class="font-medium text-gray-900 dark:text-white mb-2">导出数据</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            导出目标、打卡、想法、倒数日、名言为JSON格式
          </p>
          <button @click="exportData" class="btn btn-secondary flex items-center">
            <ArrowDownTrayIcon class="w-5 h-5 mr-1" />
            导出数据
          </button>
        </div>
        
        <div class="divider"></div>
        
        <div>
          <h3 class="font-medium text-gray-900 dark:text-white mb-2">导入数据</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            从之前导出的JSON文件恢复数据
          </p>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            class="hidden"
            @change="importData"
          />
          <button @click="$refs.fileInput.click()" class="btn btn-secondary flex items-center">
            <ArrowUpTrayIcon class="w-5 h-5 mr-1" />
            选择文件
          </button>
        </div>
      </div>
    </div>
    
    <!-- 危险区域 -->
    <div class="card card-body border-2 border-red-200">
      <h2 class="section-title text-red-600 flex items-center">
        <ExclamationTriangleIcon class="w-6 h-6 mr-2" />
        危险区域
      </h2>
      <div class="space-y-3">
        <div>
          <h3 class="font-medium text-gray-900 dark:text-white mb-2">清空所有数据</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            这将删除目标、打卡、想法、倒数日、名言等数据。此操作不可恢复！
          </p>
          <button @click="clearAllData" class="btn btn-danger flex items-center">
            <TrashIcon class="w-5 h-5 mr-1" />
            清空所有数据
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useGoalsStore } from '@/stores/goals'
import { useCheckInsStore } from '@/stores/checkins'
import { useIdeasStore } from '@/stores/ideas'
import { useCountdownsStore } from '@/stores/countdowns'
import { useQuotesStore } from '@/stores/quotes'
import { useThemeStore } from '@/stores/theme'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/config/supabase'
import { 
  SwatchIcon,
  CircleStackIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const userStore = useUserStore()
const goalsStore = useGoalsStore()
const checkInsStore = useCheckInsStore()
const ideasStore = useIdeasStore()
const countdownsStore = useCountdownsStore()
const quotesStore = useQuotesStore()
const themeStore = useThemeStore()
const toastStore = useToastStore()

const fileInput = ref(null)

const theme = computed({
  get: () => themeStore.theme,
  set: (value) => themeStore.setTheme(value)
})

async function exportData() {
  try {
    await goalsStore.fetchGoals()
    await checkInsStore.fetchCheckIns()
    await ideasStore.fetchIdeas()
    await countdownsStore.fetchCountdowns()
    await quotesStore.fetchQuotes()
    
    const data = {
      goals: goalsStore.goals,
      checkIns: checkInsStore.checkIns,
      ideas: ideasStore.ideas,
      countdowns: countdownsStore.countdowns,
      quotes: quotesStore.quotes,
      version: 1,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `goals-backup-${new Date().getTime()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toastStore.success('数据导出成功！')
  } catch (error) {
    toastStore.error('导出失败：' + error.message)
  }
}

async function importData(event) {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    if (!userStore.user?.id) {
      toastStore.error('请先登录')
      return
    }

    const text = await file.text()
    const data = JSON.parse(text)
    
    if (confirm('导入数据会覆盖现有数据，确定继续吗？')) {
      const userId = userStore.user.id

      const goals = Array.isArray(data.goals) ? data.goals : []
      const checkIns = Array.isArray(data.checkIns) ? data.checkIns : []
      const ideas = Array.isArray(data.ideas) ? data.ideas : []
      const countdowns = Array.isArray(data.countdowns) ? data.countdowns : []
      const quotes = Array.isArray(data.quotes) ? data.quotes : []

      const withUserId = (items) => items.map(item => ({ ...item, user_id: userId }))
      const chunk = (arr, size) => {
        const result = []
        for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
        return result
      }

      const upsertChunks = async (table, rows) => {
        const parts = chunk(rows, 50)
        for (const part of parts) {
          const { error } = await supabase.from(table).upsert(part, { onConflict: 'id' })
          if (error) throw error
        }
      }

      if (goals.length) await upsertChunks('goals', withUserId(goals))
      if (checkIns.length) await upsertChunks('check_ins', withUserId(checkIns))
      if (ideas.length) await upsertChunks('ideas', withUserId(ideas))
      if (countdowns.length) await upsertChunks('countdowns', withUserId(countdowns))
      if (quotes.length) await upsertChunks('quotes', withUserId(quotes))

      try {
        await supabase.from('user_settings').upsert({ user_id: userId, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      } catch (error) {
      }

      await Promise.all([
        goalsStore.fetchGoals(),
        checkInsStore.fetchCheckIns(null, null, null, { useCache: false }),
        ideasStore.fetchIdeas(),
        countdownsStore.fetchCountdowns(),
        quotesStore.fetchQuotes()
      ])

      alert('数据导入完成')
    }
  } catch (error) {
    alert('导入失败：' + error.message)
  }
  
  // 清空文件选择
  event.target.value = ''
}

async function clearAllData() {
  if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) return
  if (!confirm('请再次确认：真的要删除所有数据吗？')) return
  
  try {
    if (!userStore.user?.id) {
      alert('请先登录')
      return
    }

    const userId = userStore.user.id

    const del = async (table) => {
      const { error } = await supabase.from(table).delete().eq('user_id', userId)
      if (error) throw error
    }

    await del('check_ins')
    await del('ideas')
    await del('countdowns')
    await del('quotes')
    await del('goals')

    try {
      await supabase.from('user_settings').delete().eq('user_id', userId)
    } catch (error) {
    }

    await Promise.all([
      goalsStore.fetchGoals(),
      checkInsStore.fetchCheckIns(null, null, null, { useCache: false }),
      ideasStore.fetchIdeas(),
      countdownsStore.fetchCountdowns(),
      quotesStore.fetchQuotes()
    ])

    toastStore.success('所有数据已清空')
  } catch (error) {
    toastStore.error('清空失败：' + error.message)
  }
}
</script>