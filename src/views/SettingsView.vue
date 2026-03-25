<template>
  <div class="max-w-6xl mx-auto">
    <!-- 顶部标题 -->
    <div class="flex items-center mb-6">
      <Cog6ToothIcon class="w-8 h-8 text-primary-600 mr-3" />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">设置</h1>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      <!-- 左侧导航栏 -->
      <nav class="w-full md:w-64 flex-shrink-0">
        <div class="sticky top-6 flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex-shrink-0 md:w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
            :class="[
              activeTab === tab.id
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
            ]"
          >
            <component :is="tab.icon" class="w-5 h-5 mr-3" />
            {{ tab.name }}
          </button>
        </div>
      </nav>

      <!-- 右侧内容区 -->
      <div class="flex-1">
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
          mode="out-in"
        >
          <component :is="currentTabComponent" />
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Cog6ToothIcon,  
  UserCircleIcon, 
  CpuChipIcon
} from '@heroicons/vue/24/outline'

// 引入子组件
import AccountSettings from './settings/AccountSettings.vue'
import FeatureSettings from './settings/FeatureSettings.vue'
import SystemSettings from './settings/SystemSettings.vue'

const activeTab = ref('account')

const tabs = [
  { id: 'account', name: '账户设置', icon: UserCircleIcon, component: AccountSettings },
  { id: 'features', name: '功能配置', icon: CpuChipIcon, component: FeatureSettings },
  { id: 'system', name: '系统与数据', icon: Cog6ToothIcon, component: SystemSettings }
]

const currentTabComponent = computed(() => {
  return tabs.find(tab => tab.id === activeTab.value)?.component || AccountSettings
})
</script>