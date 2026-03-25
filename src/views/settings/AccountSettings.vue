<template>
  <div class="space-y-6">
    <!-- 账户信息 -->
    <div class="card card-body">
      <h2 class="section-title flex items-center">
        <UserCircleIcon class="w-6 h-6 mr-2 text-primary-600" />
        账户信息
      </h2>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="relative group">
            <img
              :src="currentAvatarUrl || `https://ui-avatars.com/api/?name=${currentDisplayName}&background=random`"
              alt="Avatar"
              class="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md transition-all duration-300 group-hover:opacity-75"
            />
            <label 
              class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300"
              title="更换头像"
            >
              <input 
                type="file" 
                accept="image/*" 
                class="hidden" 
                @change="handleAvatarFileChange"
                :disabled="avatarUploading"
              />
              <ArrowPathIcon v-if="avatarUploading" class="w-6 h-6 text-white animate-spin" />
              <PhotoIcon v-else class="w-6 h-6 text-white" />
            </label>
          </div>
          <div>
            <div class="font-bold text-gray-900 dark:text-white text-lg">
              {{ currentDisplayName }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ userStore.user?.email }}
            </div>
            <div v-if="avatarUploadHint" class="text-xs text-blue-500 mt-1">
              {{ avatarUploadHint }}
            </div>
          </div>
        </div>
        
        <div v-if="adminStore.isAdmin" class="pt-3 border-t border-gray-200 dark:border-gray-700">
          <router-link
            to="/admin"
            class="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <CommandLineIcon class="w-5 h-5" />
            <span class="font-semibold">进入管理员后台</span>
          </router-link>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            您拥有管理员权限，可以管理系统数据
          </p>
        </div>
      </div>
    </div>

    <!-- 个人资料 -->
    <div class="card card-body">
      <h2 class="section-title flex items-center">
        <PhotoIcon class="w-6 h-6 mr-2 text-primary-600" />
        个人资料
      </h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            显示名称
          </label>
          <input v-model="profileForm.displayName" type="text" class="input" placeholder="输入昵称" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            头像路径 (可选)
          </label>
          <input v-model="profileForm.avatarPath" type="text" class="input" placeholder="输入头像图片URL或存储路径" />
          <p class="text-xs text-gray-500 mt-1">支持 HTTP URL 或 Supabase Storage 路径</p>
        </div>
        <button class="btn btn-primary" :disabled="profileSaving" @click="saveProfile">
          {{ profileSaving ? '保存中...' : '保存修改' }}
        </button>
      </div>
    </div>

    <!-- 安全设置 -->
    <div class="card card-body">
      <h2 class="section-title flex items-center">
        <KeyIcon class="w-6 h-6 mr-2 text-primary-600" />
        安全设置
      </h2>
      <div class="space-y-6">
        <div>
          <h3 class="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
            <EnvelopeIcon class="w-5 h-5 mr-2 text-primary-600" />
            修改邮箱
          </h3>
          <div class="flex items-center space-x-2">
            <input v-model="emailForm.newEmail" type="email" class="input" placeholder="输入新邮箱地址" />
            <button class="btn btn-secondary whitespace-nowrap" :disabled="emailSaving" @click="changeEmail">
              发送验证
            </button>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            修改邮箱后通常需要前往新邮箱完成验证。
          </p>
        </div>

        <div class="divider"></div>

        <div>
          <h3 class="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
            <KeyIcon class="w-5 h-5 mr-2 text-primary-600" />
            修改密码
          </h3>
          <div class="space-y-2">
            <input v-model="passwordForm.newPassword" type="password" class="input" placeholder="输入新密码（至少6位）" />
            <input v-model="passwordForm.confirmPassword" type="password" class="input" placeholder="再次输入新密码" />
            <button class="btn btn-secondary" :disabled="passwordSaving || !userStore.user?.id" @click="changePassword">
              保存新密码
            </button>
          </div>
        </div>

        <div class="divider"></div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-1">退出登录</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">在此设备上退出当前账号</p>
          </div>
          <button class="btn btn-secondary flex items-center" :disabled="signOutLoading" @click="logout">
            <ArrowRightOnRectangleIcon class="w-5 h-5 mr-1" />
            退出
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/config/supabase'
import {
  UserCircleIcon,
  PhotoIcon,
  ArrowPathIcon,
  CommandLineIcon,
  KeyIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const userStore = useUserStore()
const adminStore = useAdminStore()
const toastStore = useToastStore()

const profileForm = ref({
  displayName: '',
  avatarPath: ''
})
const emailForm = ref({
  newEmail: ''
})
const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})

const avatarUploading = ref(false)
const avatarUploadHint = ref('')
const profileSaving = ref(false)
const emailSaving = ref(false)
const passwordSaving = ref(false)
const signOutLoading = ref(false)

const currentDisplayName = computed(() => {
  const user = userStore.user
  const name = user?.user_metadata?.display_name
  if (name && String(name).trim()) return String(name).trim()
  const email = user?.email
  if (!email) return '未命名用户'
  return String(email).split('@')[0] || '未命名用户'
})

const avatarCacheBuster = ref(Date.now())

function buildAvatarPublicUrl(avatarPath) {
  if (!avatarPath) return ''
  const { data } = supabase.storage.from('avatars').getPublicUrl(String(avatarPath))
  if (!data?.publicUrl) return ''
  return `${data.publicUrl}?v=${avatarCacheBuster.value}`
}

const currentAvatarUrl = computed(() => {
  const avatarPath = userStore.user?.user_metadata?.avatar_path
  if (avatarPath && String(avatarPath).trim()) {
    return buildAvatarPublicUrl(String(avatarPath).trim())
  }
  const legacyUrl = userStore.user?.user_metadata?.avatar_url
  if (!legacyUrl) return ''
  return String(legacyUrl)
})

// 初始化表单
watch(
  () => userStore.user,
  (user) => {
    if (user) {
      profileForm.value.displayName = user.user_metadata?.display_name || ''
      profileForm.value.avatarPath = user.user_metadata?.avatar_path || ''
    }
    avatarUploadHint.value = ''
  },
  { immediate: true }
)

onMounted(() => {
  adminStore.checkAdminStatus()
})

async function saveProfile() {
  if (!userStore.user?.id) {
    toastStore.error('请先登录')
    return
  }

  profileSaving.value = true
  try {
    const displayName = profileForm.value.displayName?.trim() || null
    const avatarPath = profileForm.value.avatarPath?.trim() || null

    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName,
        avatar_path: avatarPath
      }
    })
    if (error) throw error

    await userStore.initUser()
    toastStore.success('资料已保存')
  } catch (error) {
    toastStore.error('保存失败：' + error.message)
  } finally {
    profileSaving.value = false
  }
}

async function handleAvatarFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (!userStore.user?.id) {
    toastStore.error('请先登录')
    event.target.value = ''
    return
  }

  avatarUploading.value = true
  try {
    avatarUploadHint.value = ''
    const userId = userStore.user.id
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // 更新用户元数据
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_path: filePath }
    })

    if (updateError) throw updateError

    // 刷新缓存
    avatarCacheBuster.value = Date.now()
    await userStore.initUser()
    toastStore.success('头像已更新')
  } catch (error) {
    console.error('上传失败:', error)
    toastStore.error('上传失败: ' + error.message)
    avatarUploadHint.value = '上传失败，请重试'
  } finally {
    avatarUploading.value = false
    event.target.value = ''
  }
}

async function changeEmail() {
  const newEmail = emailForm.value.newEmail?.trim()
  if (!newEmail) {
    toastStore.error('请输入新邮箱')
    return
  }
  
  emailSaving.value = true
  try {
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) throw error
    toastStore.success('验证邮件已发送，请查收')
    emailForm.value.newEmail = ''
  } catch (error) {
    toastStore.error('发送失败：' + error.message)
  } finally {
    emailSaving.value = false
  }
}

async function changePassword() {
  const newPassword = passwordForm.value.newPassword
  const confirmPassword = passwordForm.value.confirmPassword
  
  if (!newPassword || newPassword.length < 6) {
    toastStore.error('密码长度至少6位')
    return
  }
  if (newPassword !== confirmPassword) {
    toastStore.error('两次输入的密码不一致')
    return
  }

  passwordSaving.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    passwordForm.value.newPassword = ''
    passwordForm.value.confirmPassword = ''
    toastStore.success('密码已更新')
  } catch (error) {
    toastStore.error('修改失败：' + error.message)
  } finally {
    passwordSaving.value = false
  }
}

async function logout() {
  signOutLoading.value = true
  try {
    const result = await userStore.logout()
    if (!result.success) throw new Error(result.error || '退出失败')
    router.push('/login')
  } catch (error) {
    toastStore.error('退出失败：' + error.message)
  } finally {
    signOutLoading.value = false
  }
}
</script>
