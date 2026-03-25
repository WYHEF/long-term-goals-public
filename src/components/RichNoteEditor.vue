<template>
  <div class="rich-note-editor">
    <!-- 文本输入区 -->
    <!-- 支持图片和文件上传的富文本编辑器 -->
    <textarea
      v-model="localNote"
      @input="updateNote"
      :placeholder="placeholder"
      :rows="rows"
      class="input resize-none mb-2"
    />
    
    <!-- 附件区域 -->
    <div v-if="files.length > 0" class="space-y-2 mb-3">
      <div class="text-sm font-medium text-gray-700 flex items-center">
        <PaperClipIcon class="w-4 h-4 mr-1" /> 附件 ({{ files.length }})
      </div>
      <div class="space-y-2">
        <div
          v-for="(file, index) in files"
          :key="index"
          class="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg"
        >
          <!-- 文件预览/信息 -->
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            <!-- 图片预览 -->
            <div v-if="file.type === 'image'" class="flex-shrink-0">
              <img
                :src="file.preview"
                :alt="file.name"
                class="w-12 h-12 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-80"
                @click="previewImage(file)"
              />
            </div>
            <!-- 文件图标 -->
            <div v-else class="flex-shrink-0">
              <component :is="getFileIcon(file)" class="w-8 h-8 text-gray-500" />
            </div>
            
            <!-- 文件名和大小 -->
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 truncate">{{ file.name }}</div>
              <div class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</div>
            </div>
          </div>
          
          <!-- 删除按钮 -->
          <button
            @click="removeFile(index)"
            class="flex-shrink-0 ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
            title="删除"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="flex space-x-2">
      <!-- 上传图片按钮 -->
      <label class="btn btn-secondary text-sm cursor-pointer flex items-center">
        <PhotoIcon class="w-4 h-4 mr-1" /> 添加图片
        <input
          type="file"
          accept="image/*"
          multiple
          @change="handleFileSelect($event, 'image')"
          class="hidden"
        />
      </label>
      
      <!-- 上传文件按钮 -->
      <label class="btn btn-secondary text-sm cursor-pointer flex items-center">
        <DocumentPlusIcon class="w-4 h-4 mr-1" /> 添加文件
        <input
          type="file"
          multiple
          @change="handleFileSelect($event, 'file')"
          class="hidden"
        />
      </label>
      
      <!-- 文件数量提示 -->
      <div v-if="files.length > 0" class="flex items-center text-sm text-gray-600">
        已添加 {{ files.length }} 个附件
      </div>
    </div>
    
    <!-- 图片预览弹窗 -->
    <div
      v-if="previewImageUrl"
      @click="closePreview"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      style="margin: 0;"
    >
      <div class="relative max-w-4xl max-h-full">
        <button
          @click="closePreview"
          class="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
        <img
          :src="previewImageUrl"
          alt="预览"
          class="max-w-full max-h-[80vh] object-contain"
          @click.stop
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { 
  PaperClipIcon, 
  XMarkIcon, 
  PhotoIcon, 
  DocumentPlusIcon,
  DocumentTextIcon, 
  DocumentIcon, 
  MusicalNoteIcon, 
  FilmIcon, 
  ArchiveBoxIcon 
} from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  attachments: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '记录今天的笔记...'
  },
  rows: {
    type: Number,
    default: 4
  },
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  }
})

const emit = defineEmits(['update:modelValue', 'update:attachments'])

const localNote = ref(props.modelValue || '')
const files = ref(props.attachments ? [...props.attachments] : [])
const previewImageUrl = ref(null)

// 监听外部变化
watch(() => props.modelValue, (newVal) => {
  localNote.value = newVal || ''
})

watch(() => props.attachments, (newVal) => {
  files.value = newVal ? [...newVal] : []
}, { deep: true })

// 更新笔记内容
function updateNote() {
  emit('update:modelValue', localNote.value)
}

// 处理文件选择
function handleFileSelect(event, type) {
  const selectedFiles = Array.from(event.target.files)
  
  if (selectedFiles.length === 0) return
  
  selectedFiles.forEach(file => {
    // 检查文件大小
    if (file.size > props.maxFileSize) {
      alert(`文件 "${file.name}" 超过大小限制 (${formatFileSize(props.maxFileSize)})`)
      return
    }
    
    const fileData = {
      name: file.name,
      size: file.size,
      type: type === 'image' && file.type.startsWith('image/') ? 'image' : 'file',
      file: file,
      preview: null
    }
    
    // 如果是图片，生成预览
    if (fileData.type === 'image') {
      const reader = new FileReader()
      reader.onload = (e) => {
        fileData.preview = e.target.result
        files.value.push(fileData)
        emit('update:attachments', files.value)
      }
      reader.readAsDataURL(file)
    } else {
      files.value.push(fileData)
      emit('update:attachments', files.value)
    }
  })
  
  // 清空input，允许重复选择同一文件
  event.target.value = ''
}

// 删除文件
function removeFile(index) {
  files.value.splice(index, 1)
  emit('update:attachments', files.value)
}

// 获取文件图标
function getFileIcon(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  
  if (['pdf'].includes(ext)) return '📕'
  if (['doc', 'docx'].includes(ext)) return '📘'
  if (['xls', 'xlsx'].includes(ext)) return '📗'
  if (['ppt', 'pptx'].includes(ext)) return '📙'
  if (['zip', 'rar', '7z'].includes(ext)) return '🗜️'
  if (['txt'].includes(ext)) return '📝'
  if (['mp3', 'wav', 'flac'].includes(ext)) return '🎵'
  if (['mp4', 'avi', 'mov'].includes(ext)) return '🎬'
  
  return '📄'
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 预览图片
function previewImage(file) {
  previewImageUrl.value = file.preview
}

// 关闭预览
function closePreview() {
  previewImageUrl.value = null
}
</script>

<style scoped>
.rich-note-editor {
  width: 100%;
}
</style>

