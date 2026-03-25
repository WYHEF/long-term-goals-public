<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-3xl font-bold text-white">系统设置</h1>
      <p class="text-gray-400 mt-2">管理系统配置和参数</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-4xl mb-4">⏳</div>
      <p class="text-gray-400">加载中...</p>
    </div>

    <div v-else class="space-y-6">
      <!-- 基础设置 -->
      <div class="admin-card">
        <h2 class="text-xl font-semibold text-white mb-4 flex items-center">
          <span class="text-2xl mr-2">⚙️</span>
          基础设置
        </h2>

        <div class="space-y-4">
          <!-- 维护模式 -->
          <div class="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h3 class="text-white font-medium">维护模式</h3>
              <p class="text-sm text-gray-400 mt-1">开启后普通用户无法访问系统</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.maintenance_mode"
                @change="saveSetting('maintenance_mode', settings.maintenance_mode)"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <!-- 深色模式（用户端） -->
          <div class="flex items-center justify-between p-4 bg-gray-700 rounded-lg border-2 border-green-500">
            <div>
              <h3 class="text-white font-medium flex items-center">
                深色模式
                <span class="ml-2 px-2 py-0.5 text-xs bg-green-500 text-white rounded">已启用</span>
              </h3>
              <p class="text-sm text-gray-400 mt-1">用户可在顶部导航栏切换浅色/深色主题</p>
            </div>
            <div class="text-3xl">
              🌙
            </div>
          </div>

          <!-- 允许注册 -->
          <div class="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h3 class="text-white font-medium">允许新用户注册</h3>
              <p class="text-sm text-gray-400 mt-1">关闭后新用户无法注册</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.allow_registration"
                @change="saveSetting('allow_registration', settings.allow_registration)"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- AI功能 -->
          <div class="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h3 class="text-white font-medium">DeepSeek AI功能</h3>
              <p class="text-sm text-gray-400 mt-1">启用AI目标分析和计划生成</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.deepseek_api_enabled"
                @change="saveSetting('deepseek_api_enabled', settings.deepseek_api_enabled)"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- 限制设置 -->
      <div class="admin-card">
        <h2 class="text-xl font-semibold text-white mb-4 flex items-center">
          <span class="text-2xl mr-2">🔒</span>
          限制设置
        </h2>

        <div class="space-y-4">
          <!-- 最大目标数 -->
          <div class="p-4 bg-gray-700 rounded-lg">
            <h3 class="text-white font-medium mb-2">每用户最大目标数</h3>
            <div class="flex items-center space-x-4">
              <input
                type="number"
                v-model.number="settings.max_goals_per_user"
                min="1"
                max="100"
                class="w-32 px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <button
                @click="saveSetting('max_goals_per_user', settings.max_goals_per_user)"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                保存
              </button>
            </div>
            <p class="text-sm text-gray-400 mt-2">建议值：20-50</p>
          </div>
        </div>
      </div>

      <!-- 系统信息 -->
      <div class="admin-card">
        <h2 class="text-xl font-semibold text-white mb-4 flex items-center">
          <span class="text-2xl mr-2">ℹ️</span>
          系统信息
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-gray-700 rounded-lg">
            <div class="text-gray-400 text-sm">系统版本</div>
            <div class="text-white text-lg font-semibold mt-1">v2.1.0</div>
          </div>
          <div class="p-4 bg-gray-700 rounded-lg">
            <div class="text-gray-400 text-sm">数据库</div>
            <div class="text-white text-lg font-semibold mt-1">Supabase PostgreSQL</div>
          </div>
          <div class="p-4 bg-gray-700 rounded-lg">
            <div class="text-gray-400 text-sm">前端框架</div>
            <div class="text-white text-lg font-semibold mt-1">Vue 3 + Vite</div>
          </div>
          <div class="p-4 bg-gray-700 rounded-lg">
            <div class="text-gray-400 text-sm">UI框架</div>
            <div class="text-white text-lg font-semibold mt-1">Tailwind CSS</div>
          </div>
        </div>
      </div>

      <!-- 危险操作 -->
      <div class="admin-card border-2 border-red-600">
        <h2 class="text-xl font-semibold text-red-500 mb-4 flex items-center">
          <span class="text-2xl mr-2">⚠️</span>
          危险操作
        </h2>

        <div class="space-y-3">
          <div class="p-4 bg-gray-700 rounded-lg">
            <h3 class="text-white font-medium mb-2">清空所有打卡数据</h3>
            <p class="text-sm text-gray-400 mb-3">
              这将删除所有用户的打卡记录。此操作不可恢复！
            </p>
            <button
              @click="confirmDangerousAction('clear_checkins')"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              🗑️ 清空打卡数据
            </button>
          </div>

          <div class="p-4 bg-gray-700 rounded-lg">
            <h3 class="text-white font-medium mb-2">重置系统配置</h3>
            <p class="text-sm text-gray-400 mb-3">
              将所有系统配置恢复为默认值
            </p>
            <button
              @click="confirmDangerousAction('reset_config')"
              class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              🔄 重置配置
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'

const loading = ref(false)
const settings = ref({
  maintenance_mode: false,
  allow_registration: true,
  deepseek_api_enabled: true,
  max_goals_per_user: 50
})

async function loadSettings() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('system_configs')
      .select('*')

    if (error) throw error

    // 将数组转换为对象
    if (data && data.length > 0) {
      data.forEach(config => {
        let value = config.value
        
        // 处理不同类型的值
        if (typeof value === 'string') {
          // 布尔值转换
          if (value === 'true') {
            value = true
          } else if (value === 'false') {
            value = false
          } 
          // 数字转换
          else if (!isNaN(value) && value !== '') {
            value = Number(value)
          }
        }
        
        settings.value[config.key] = value
      })
    }
  } catch (error) {
    console.error('加载设置失败:', error)
    alert('加载设置失败：' + error.message)
  } finally {
    loading.value = false
  }
}

async function saveSetting(key, value) {
  try {
    // 使用upsert（插入或更新）
    const { error } = await supabase
      .from('system_configs')
      .upsert({ 
        key,
        value: value.toString(),
        description: `系统配置: ${key}`,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key' // 如果key已存在则更新
      })
    
    if (error) throw error

    alert(`✅ 设置已保存`)
  } catch (error) {
    console.error('保存设置失败:', error)
    alert('保存失败：' + error.message)
    await loadSettings() // 重新加载设置
  }
}

async function confirmDangerousAction(action) {
  const messages = {
    'clear_checkins': '确定要清空所有打卡数据吗？此操作不可恢复！',
    'reset_config': '确定要重置所有系统配置吗？'
  }

  if (!confirm(messages[action])) return
  if (!confirm('请再次确认，您真的要执行此操作吗？')) return

  try {
    if (action === 'clear_checkins') {
      await clearAllCheckIns()
    } else if (action === 'reset_config') {
      await resetSystemConfig()
    }
  } catch (error) {
    console.error('执行失败:', error)
    alert('操作失败：' + error.message)
  }
}

async function clearAllCheckIns() {
  try {
    const { error } = await supabase
      .from('check_ins')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 删除所有记录
    
    if (error) throw error
    
    alert('✅ 所有打卡数据已清空')
  } catch (error) {
    console.error('清空打卡数据失败:', error)
    throw error
  }
}

async function resetSystemConfig() {
  try {
    // 重置为默认值
    const defaultSettings = {
      maintenance_mode: false,
      allow_registration: true,
      deepseek_api_enabled: true,
      max_goals_per_user: 50
    }
    
    for (const [key, value] of Object.entries(defaultSettings)) {
      await saveSetting(key, value)
    }
    
    // 重新加载设置
    await loadSettings()
    
    alert('✅ 系统配置已重置为默认值')
  } catch (error) {
    console.error('重置配置失败:', error)
    throw error
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.admin-card {
  @apply bg-gray-800 border border-gray-700 rounded-lg p-6;
}
</style>

