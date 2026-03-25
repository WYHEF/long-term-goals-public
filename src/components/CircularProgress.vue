<template>
  <div class="relative inline-flex items-center justify-center">
    <svg :width="size" :height="size" class="transform -rotate-90">
      <!-- 背景圆环 -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        :class="backgroundClass"
      />
      <!-- 进度圆环 -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        class="transition-all duration-500 ease-out"
      />
    </svg>
    <!-- 中心文字 -->
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-lg font-bold" :style="{ color: progressColor }">
        {{ percentage }}%
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    default: 80
  },
  strokeWidth: {
    type: Number,
    default: 8
  },
  progressColor: {
    type: String,
    default: '#3b82f6'
  },
  backgroundColor: {
    type: String,
    default: 'currentColor'
  }
})

// 根据当前主题动态计算背景色
// 注意：这里我们使用 CSS 类来控制颜色，而不是直接传值，这样可以更好地支持暗色模式切换
const backgroundClass = computed(() => {
  return 'text-gray-200 dark:text-gray-700'
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => {
  const progress = Math.min(Math.max(props.percentage, 0), 100)
  return circumference.value - (progress / 100) * circumference.value
})
</script>
