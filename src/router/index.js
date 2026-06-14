import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import StudentLayout from '../layouts/StudentLayout.vue'
import TutorLayout from '../layouts/TutorLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

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
  // 学员端路由
  {
    path: '/student',
    component: StudentLayout,
    meta: { requiresAuth: true, role: 'student' },
    children: [
      {
        path: '',
        redirect: '/student/training'
      },
      {
        path: 'training',
        name: 'StudentTraining',
        component: () => import('../views/student/MyTraining.vue')
      },
      {
        path: 'knowledge',
        name: 'StudentKnowledge',
        component: () => import('../views/student/KnowledgeLibrary.vue')
      },
      {
        path: 'profile',
        name: 'StudentProfile',
        component: () => import('../views/ProfileCenter.vue')
      },
      {
        path: 'courseware/:id',
        name: 'CoursewareDetail',
        component: () => import('../views/student/CoursewareDetail.vue')
      },
      {
        path: 'assessment/:id',
        name: 'AssessmentResult',
        component: () => import('../views/student/AssessmentResult.vue')
      },
      {
        path: 'evaluate/:id',
        name: 'EvaluateTutor',
        component: () => import('../views/student/EvaluateTutor.vue')
      }
    ]
  },
  // 导师端路由
  {
    path: '/tutor',
    component: TutorLayout,
    meta: { requiresAuth: true, role: 'tutor' },
    children: [
      {
        path: '',
        redirect: '/tutor/courseware'
      },
      {
        path: 'courseware',
        name: 'TutorCourseware',
        component: () => import('../views/tutor/CoursewareManage.vue')
      },
      {
        path: 'students',
        name: 'TutorStudents',
        component: () => import('../views/tutor/StudentEvaluate.vue')
      },
      {
        path: 'feedback',
        name: 'TutorFeedback',
        component: () => import('../views/tutor/FeedbackView.vue')
      },
      {
        path: 'profile',
        name: 'TutorProfile',
        component: () => import('../views/ProfileCenter.vue')
      }
    ]
  },
  // 运营后台路由
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        redirect: '/admin/ledger'
      },
      {
        path: 'ledger',
        name: 'AdminLedger',
        component: () => import('../views/admin/LedgerWorkspace.vue')
      },
      {
        path: 'training-plan',
        name: 'AdminTrainingPlan',
        component: () => import('../views/admin/TrainingPlan.vue')
      },
      {
        path: 'execution',
        name: 'AdminExecution',
        component: () => import('../views/admin/PhotoUpload.vue')
      },
      {
        path: 'assessment',
        name: 'AdminAssessment',
        redirect: '/admin/ledger?tab=assessment'
      },
      {
        path: 'evaluations',
        name: 'AdminEvaluations',
        component: () => import('../views/admin/EvaluationSummary.vue')
      },
      {
        path: 'personnel',
        name: 'AdminPersonnel',
        component: () => import('../views/admin/PersonnelManage.vue')
      },
      {
        path: 'import',
        name: 'AdminImport',
        component: () => import('../views/admin/DataImport.vue')
      },
      {
        path: 'photos',
        name: 'AdminPhotos',
        component: () => import('../views/admin/PhotoUpload.vue')
      },
      {
        path: 'export',
        name: 'AdminExport',
        component: () => import('../views/admin/DataExport.vue')
      }
    ]
  },
  // 管理者看板路由
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'manager' },
    children: [
      {
        path: '',
        redirect: '/dashboard/overview'
      },
      {
        path: 'overview',
        name: 'DashboardOverview',
        component: () => import('../views/dashboard/Overview.vue')
      },
      {
        path: 'comparison',
        name: 'DashboardComparison',
        component: () => import('../views/dashboard/Comparison.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 原型阶段暂时禁用认证，方便查看所有页面
router.beforeEach((to, from, next) => {
  // 如果没有token，自动设置一个模拟token
  const token = localStorage.getItem('token')
  if (!token) {
    localStorage.setItem('token', 'mock-token-demo')
    localStorage.setItem('userInfo', JSON.stringify({ id: 1, name: '演示用户', role: 'student' }))
  }
  next()
})

export default router
