import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function addToast(message, type = 'success', duration = 2000) {
    const id = Date.now() + Math.random()
    toasts.value.push({
      id,
      message,
      type
    })

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function success(message, duration = 2000) {
    addToast(message, 'success', duration)
  }

  function error(message, duration = 3000) {
    addToast(message, 'error', duration)
  }

  function info(message, duration = 2000) {
    addToast(message, 'info', duration)
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info
  }
})
