<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click="handleBackdropClick"
      >
        <div 
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all"
          @click.stop
        >
          <!-- 头部/图标 -->
          <div class="p-6 pb-4 text-center">
            <div 
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4"
              :class="iconBgClass"
            >
              <component :is="iconComponent" class="h-6 w-6" :class="iconColorClass" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-6">
              {{ title }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ message }}
              </p>
            </div>
          </div>

          <!-- 按钮组 -->
          <div class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex flex-row-reverse gap-3">
            <button
              type="button"
              class="inline-flex w-full justify-center rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto transition-colors"
              :class="confirmButtonClass"
              @click="onConfirm"
              :disabled="loading"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ confirmText }}
            </button>
            <button
              type="button"
              class="mt-3 inline-flex w-full justify-center rounded-lg bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto transition-colors"
              @click="onCancel"
              :disabled="loading"
            >
              {{ cancelText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: '确认操作'
  },
  message: {
    type: String,
    default: '确定要执行此操作吗？'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  type: {
    type: String,
    default: 'warning', // warning, danger, info, success
    validator: (value) => ['warning', 'danger', 'info', 'success'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel', 'update:show'])

const iconComponent = computed(() => {
  switch (props.type) {
    case 'success': return CheckCircleIcon
    case 'info': return InformationCircleIcon
    default: return ExclamationTriangleIcon
  }
})

const iconBgClass = computed(() => {
  switch (props.type) {
    case 'danger': return 'bg-red-100 dark:bg-red-900/30'
    case 'success': return 'bg-green-100 dark:bg-green-900/30'
    case 'info': return 'bg-blue-100 dark:bg-blue-900/30'
    default: return 'bg-yellow-100 dark:bg-yellow-900/30'
  }
})

const iconColorClass = computed(() => {
  switch (props.type) {
    case 'danger': return 'text-red-600 dark:text-red-400'
    case 'success': return 'text-green-600 dark:text-green-400'
    case 'info': return 'text-blue-600 dark:text-blue-400'
    default: return 'text-yellow-600 dark:text-yellow-400'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'danger': return 'bg-red-600 hover:bg-red-500'
    case 'success': return 'bg-green-600 hover:bg-green-500'
    case 'info': return 'bg-blue-600 hover:bg-blue-500'
    default: return 'bg-primary-600 hover:bg-primary-500'
  }
})

function onConfirm() {
  emit('confirm')
}

function onCancel() {
  emit('cancel')
  emit('update:show', false)
}

function handleBackdropClick() {
  if (props.closeOnBackdrop && !props.loading) {
    onCancel()
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div > div,
.modal-leave-active > div > div {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from > div > div,
.modal-leave-to > div > div {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
