<template>
  <div class="relative group min-h-[4rem] inline-flex items-center">
    <!-- 加载状态 -->
    <div v-if="loading" class="text-sm text-gray-500 dark:text-gray-400">
      加载中...
    </div>

    <!-- 有名言时显示 -->
    <div 
      v-else-if="quote" 
      class="pr-4"
    >
      <p class="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-1 quote-text transition-colors">
        "{{ quote.content }}"
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        —— {{ quote.author }}
      </p>
    </div>

    <!-- 悬浮操作栏 -->
    <div 
      v-if="quote"
      class="absolute left-full top-1/2 -translate-y-1/2 ml-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 z-10"
    >
      <button 
        @click.stop="copyQuote" 
        class="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 rounded-md transition-colors"
        title="复制"
      >
        <ClipboardIcon class="w-4 h-4" />
      </button>
      <button 
        @click.stop="refreshQuote" 
        class="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 rounded-md transition-colors"
        :class="{ 'animate-spin': refreshing }"
        title="刷新"
      >
        <ArrowPathIcon class="w-4 h-4" />
      </button>
      <button 
        @click.stop="searchQuote" 
        class="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 rounded-md transition-colors"
        title="搜索"
      >
        <MagnifyingGlassIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- 无名言时的提示 -->
    <div v-if="!loading && !quote" class="text-sm">
      <p class="text-gray-500 dark:text-gray-400 mb-1">
        还没有添加激励语
      </p>
      <router-link 
        to="/settings" 
        class="text-primary-600 dark:text-primary-400 text-sm hover:underline inline-flex items-center"
      >
        去添加 <ArrowRightIcon class="w-3 h-3 ml-1" />
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuotesStore } from '@/stores/quotes'
import { useToastStore } from '@/stores/toast'
import { 
  ArrowRightIcon, 
  ArrowPathIcon, 
  ClipboardIcon, 
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'

const quotesStore = useQuotesStore()
const toastStore = useToastStore()

const quote = ref(null)
const loading = ref(true)
const refreshing = ref(false)

// 刷新名言
async function refreshQuote() {
  if (refreshing.value) return
  
  refreshing.value = true
  
  // 添加一个小延迟，让动画更明显
  setTimeout(() => {
    quote.value = quotesStore.getRandomQuote()
    refreshing.value = false
  }, 300)
}

// 复制名言
function copyQuote() {
  if (!quote.value) return
  const text = `"${quote.value.content}" —— ${quote.value.author}`
  navigator.clipboard.writeText(text).then(() => {
    toastStore.success('已复制到剪切板')
  }).catch(err => {
    console.error('复制失败:', err)
    toastStore.error('复制失败')
  })
}

// 搜索名言
function searchQuote() {
  if (!quote.value) return
  const query = encodeURIComponent(`${quote.value.content} ${quote.value.author}`)
  window.open(`https://www.bing.com/search?q=${query}`, '_blank')
}

// 初始化
onMounted(async () => {
  loading.value = true
  try {
    await quotesStore.fetchQuotes()
    quote.value = quotesStore.getRandomQuote()
  } catch (error) {
    console.error('加载名言失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.quote-text {
  font-style: italic;
}
</style>

