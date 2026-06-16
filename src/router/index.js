import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import StudentLayout from '../layouts/StudentLayout.vue'
import TutorLayout from '../layouts/TutorLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },

  // ── 学员端 ──────────────────────────────────
  {
    path: '/student',
    component: StudentLayout,
    meta: { requiresAuth: true, role: 'student' },
    children: [
      { path: '', redirect: '/student/training' },
      {
        path: 'training',
        name: 'StudentTraining',
        component: () => import('../views/student/MyTraining.vue')
      },
      {
        path: 'resources',
        name: 'StudentResources',
        component: () => import('../views/student/ResourceCenter.vue')
      },
      {
        path: 'feedback',
        name: 'StudentFeedback',
        component: () => import('../views/student/TutorFeedback.vue')
      },
      {
        path: 'profile',
        name: 'StudentProfile',
        component: () => import('../views/ProfileCenter.vue')
      }
    ]
  },

  // ── 导师端 ──────────────────────────────────
  {
    path: '/tutor',
    component: TutorLayout,
    meta: { requiresAuth: true, role: 'tutor' },
    children: [
      { path: '', redirect: '/tutor/checkin' },
      {
        path: 'checkin',
        name: 'TutorCheckin',
        component: () => import('../views/tutor/CourseCheckin.vue')
      },
      {
        path: 'summary',
        name: 'TutorSummary',
        component: () => import('../views/tutor/StudentSummary.vue')
      },
      {
        path: 'courseware',
        name: 'TutorCourseware',
        component: () => import('../views/tutor/CoursewareUpload.vue')
      },
      {
        path: 'profile',
        name: 'TutorProfile',
        component: () => import('../views/ProfileCenter.vue')
      }
    ]
  },

  // ── 管理后台 ─────────────────────────────────
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: '/admin/personnel' },
      {
        path: 'personnel',
        name: 'AdminPersonnel',
        component: () => import('../views/admin/PersonnelManage.vue')
      },
      {
        path: 'schedule',
        name: 'AdminSchedule',
        component: () => import('../views/admin/SchedulePlan.vue')
      },
      {
        path: 'course-log',
        name: 'AdminCourseLog',
        component: () => import('../views/admin/CourseLog.vue')
      },
      {
        path: 'exam-archive',
        name: 'AdminExamArchive',
        component: () => import('../views/admin/ExamArchive.vue')
      },
      {
        path: 'resources',
        name: 'AdminResources',
        component: () => import('../views/admin/ResourceLibrary.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 原型阶段暂时禁用认证，方便查看所有页面
router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')
  if (!token) {
    localStorage.setItem('token', 'mock-token-demo')
    localStorage.setItem('userInfo', JSON.stringify({ id: 1, name: '演示用户', role: 'admin' }))
  }
  return true
})

export default router
