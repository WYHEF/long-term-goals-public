<template>
  <div class="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
    <transition-group name="toast">
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id"
        class="flex items-center backdrop-blur px-4 py-2 rounded-full shadow-2xl text-sm font-medium whitespace-nowrap border pointer-events-auto"
        :class="[
          toast.type === 'error' 
            ? 'bg-red-50/90 dark:bg-red-900/90 text-red-900 dark:text-red-100 border-red-200/50 dark:border-red-700/50' 
            : 'bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white border-gray-200/50 dark:border-gray-700/50'
        ]"
      >
        <CheckCircleIcon v-if="toast.type === 'success'" class="w-5 h-5 mr-2 text-green-500 dark:text-green-400" />
        <ExclamationCircleIcon v-else-if="toast.type === 'error'" class="w-5 h-5 mr-2 text-red-500 dark:text-red-400" />
        <InformationCircleIcon v-else class="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon 
} from '@heroicons/vue/24/outline'

const toastStore = useToastStore()
</script>

<style scoped>
/* 列表过渡动画 */
.toast-move,
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-active {
  position: absolute;
  /* 保持居中：相对于父容器(flex-col items-center)的中心 */
  left: 50%;
  /* 需要同时抵消 left:50% 和自身的宽度偏移 */
  transform: translateX(-50%);
}

.toast-leave-to {
  opacity: 0;
  /* 离开时向上移动，同时保持水平居中 */
  transform: translate(-50%, -20px);
}
</style>