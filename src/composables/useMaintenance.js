import { ref } from 'vue'
import { supabase } from '@/config/supabase'
import { useAdminStore } from '@/stores/admin'

const isMaintenanceMode = ref(false)
const isChecking = ref(false)
const lastCheckedAt = ref(0)
let checkPromise = null

export function useMaintenance() {
  
  async function checkMaintenanceMode(force = false) {
    if (checkPromise) return checkPromise

    const cacheMs = 60 * 1000
    if (!force && lastCheckedAt.value && Date.now() - lastCheckedAt.value < cacheMs) {
      return isMaintenanceMode.value
    }

    checkPromise = (async () => {
      if (isChecking.value) return isMaintenanceMode.value

      isChecking.value = true
      try {
        const { data, error } = await supabase
          .from('system_configs')
          .select('value')
          .eq('key', 'maintenance_mode')
          .maybeSingle()

        lastCheckedAt.value = Date.now()

        if (error) {
          console.error('检查维护模式失败:', error)
          isMaintenanceMode.value = false
          return false
        }

        isMaintenanceMode.value = data?.value === 'true' || data?.value === true
        return isMaintenanceMode.value
      } catch (error) {
        console.error('检查维护模式出错:', error)
        isMaintenanceMode.value = false
        lastCheckedAt.value = Date.now()
        return false
      } finally {
        isChecking.value = false
        checkPromise = null
      }
    })()

    return checkPromise
  }
  
  async function canAccessDuringMaintenance() {
    // 检查是否是管理员
    const adminStore = useAdminStore()
    const isAdmin = await adminStore.checkAdminStatus()
    return isAdmin
  }
  
  return {
    isMaintenanceMode,
    checkMaintenanceMode,
    canAccessDuringMaintenance
  }
}
