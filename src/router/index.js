import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/config/supabase'
import { useAdminStore } from '@/stores/admin'
import { useUserStore } from '@/stores/user'
import { useMaintenance } from '@/composables/useMaintenance'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: false, title: '首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/views/MaintenanceView.vue'),
    meta: { requiresAuth: false, title: '系统维护' }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/TermsView.vue'),
    meta: { requiresAuth: false, title: '服务条款' }
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/PrivacyView.vue'),
    meta: { requiresAuth: false, title: '隐私政策' }
  },
  {
    path: '/app',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'today',
        name: 'Today',
        component: () => import('@/views/TodayView.vue'),
        meta: { title: '今日任务' }
      },
      {
        path: 'goals',
        name: 'Goals',
        component: () => import('@/views/goals/GoalsView.vue'),
        meta: { title: '目标管理' }
      },
      {
        path: 'goals/create',
        name: 'CreateGoal',
        component: () => import('@/views/goals/CreateGoalView.vue'),
        meta: { title: '创建目标' }
      },
      {
        path: 'goals/:id',
        name: 'GoalDetail',
        component: () => import('@/views/goals/GoalDetailView.vue'),
        meta: { title: '目标详情' }
      },
      {
        path: 'ideas',
        name: 'Ideas',
        component: () => import('@/views/IdeasView.vue'),
        meta: { title: '想法收集箱' }
      },
      {
        path: 'countdowns',
        name: 'Countdowns',
        component: () => import('@/views/CountdownsView.vue'),
        meta: { title: '倒数日' }
      },
      // {
      //   path: 'statistics',
      //   name: 'Statistics',
      //   component: () => import('@/views/StatisticsView.vue'),
      //   meta: { title: '数据统计' }
      // },
      {
        path: 'checkin/:goalId',
        name: 'CheckIn',
        component: () => import('@/views/CheckInView.vue'),
        meta: { title: '打卡' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: { title: '设置' }
      }
    ]
  },
  // 管理员路由
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: '管理员总览' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UsersView.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'goals',
        name: 'AdminGoals',
        component: () => import('@/views/admin/GoalsView.vue'),
        meta: { title: '目标管理' }
      },
      {
        path: 'checkins',
        name: 'AdminCheckIns',
        component: () => import('@/views/admin/CheckInsView.vue'),
        meta: { title: '打卡监控' }
      },
      {
        path: 'announcements',
        name: 'AdminAnnouncements',
        component: () => import('@/views/admin/AnnouncementsView.vue'),
        meta: { title: '公告管理' }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/SystemSettingsView.vue'),
        meta: { title: '系统设置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin === true)
  
  // 如果是维护页面，直接放行
  if (to.path === '/maintenance') {
    next()
    return
  }

  const userStore = useUserStore()
  let user = userStore.user
  if (!user) {
    user = await auth.getCurrentUser()
    userStore.user = user
  }

  // 首页允许所有人访问（已登录和未登录用户都可以查看介绍页）
  if (to.path === '/') {
    next()
    return
  }

  // 登录页特殊处理：已登录则重定向到今日任务
  if (to.path === '/login') {
    if (user) {
      next('/app/today')
    } else {
      next()
    }
    return
  }
  
  // 检查登录状态（必须先检查登录）
  if (requiresAuth && !user) {
    next('/login')
    return
  }
  
  // 检查管理员权限
  const adminStore = useAdminStore()
  let isAdmin = false
  if (requiresAdmin) {
    isAdmin = await adminStore.checkAdminStatus()
    if (!isAdmin) {
      alert('您没有管理员权限！')
      next('/')
      return
    }
  }
  
  // 检查维护模式（登录后才检查，管理员后台除外）
  if (user && !to.path.startsWith('/admin')) {
    const { checkMaintenanceMode } = useMaintenance()
    const inMaintenance = await checkMaintenanceMode()
    
    if (inMaintenance) {
      if (!isAdmin) {
        isAdmin = await adminStore.checkAdminStatus()
      }
      if (!isAdmin) {
        next('/maintenance')
        return
      }
    }
  }
  
  next()
})

export default router
