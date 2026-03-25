<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full">
      <!-- 维护图标 -->
      <div class="text-center mb-8 animate-bounce">
        <div class="text-9xl mb-4">🔧</div>
      </div>
      
      <!-- 主要内容卡片 -->
      <div class="card card-body shadow-xl">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center mb-4">
          系统维护中
        </h1>
        
        <p class="text-xl text-gray-600 dark:text-gray-300 text-center mb-8">
          我们正在进行系统升级和维护，请稍后再访问
        </p>
        
        <!-- 维护信息 -->
        <div class="bg-primary-50 dark:bg-gray-800 rounded-lg p-6 mb-8 border border-primary-100 dark:border-gray-700">
          <div class="space-y-4">
            <div class="flex items-start">
              <span class="text-2xl mr-3">⏰</span>
              <div class="flex-1">
                <div class="font-semibold text-gray-900 dark:text-white mb-1">预计维护时间</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">约30分钟 - 2小时</div>
              </div>
            </div>
            
            <div class="flex items-start">
              <span class="text-2xl mr-3">📝</span>
              <div class="flex-1">
                <div class="font-semibold text-gray-900 dark:text-white mb-1">维护内容</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">系统升级、性能优化、功能更新</div>
              </div>
            </div>
            
            <div class="flex items-start">
              <span class="text-2xl mr-3">💡</span>
              <div class="flex-1">
                <div class="font-semibold text-gray-900 dark:text-white mb-1">温馨提示</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">您的数据是安全的，维护完成后即可正常使用</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 刷新按钮 -->
        <div class="text-center mb-6">
          <button
            @click="checkStatus"
            :disabled="checking"
            class="btn btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="checking">⏳ 检查中...</span>
            <span v-else>🔄 刷新状态</span>
          </button>
        </div>
        
        <!-- 管理员登录提示 -->
        <div class="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            管理员？
            <router-link to="/login" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium underline">
              点击登录
            </router-link>
          </p>
        </div>
      </div>
      
      <!-- 底部信息 -->
      <div class="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm space-y-2">
        <p>如有紧急问题，请联系管理员</p>
        <p>© 2024 星煜凡程 - 长期目标管理系统</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMaintenance } from '@/composables/useMaintenance'

const router = useRouter()
const { checkMaintenanceMode, canAccessDuringMaintenance } = useMaintenance()
const checking = ref(false)

async function checkStatus() {
  checking.value = true
  try {
    const inMaintenance = await checkMaintenanceMode()
    
    if (!inMaintenance) {
      // 维护结束，跳转到首页
      router.push('/app/today')
    } else {
      // 检查是否是管理员
      const canAccess = await canAccessDuringMaintenance()
      if (canAccess) {
        router.push('/admin')
      } else {
        alert('系统仍在维护中，请稍后再试')
      }
    }
  } catch (error) {
    console.error('检查状态失败:', error)
    alert('检查失败，请稍后再试')
  } finally {
    checking.value = false
  }
}
</script>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}
</style>
