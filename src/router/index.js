import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '../stores/auth'
import { useCourseStore } from '../stores/course'

function homeRoute(role) {
  if (role === 'admin') return { name: 'admin-users' }
  if (role === 'teacher') return { name: 'teacher-dashboard' }
  return { name: 'student-dashboard' }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'login', component: LoginView },
    {
      path: '/admin/users',
      name: 'admin-users',
      meta: { requiresAuth: true, role: 'admin' },
      component: () => import('../views/AdminUsersView.vue'),
    },
    {
      path: '/teacher',
      name: 'teacher-dashboard',
      meta: { requiresAuth: true, role: 'teacher' },
      component: () => import('../views/TeacherDashboard.vue'),
    },
    {
      path: '/teacher/course/new',
      name: 'course-create',
      meta: { requiresAuth: true, role: 'teacher', requiresApprovedTeacher: true },
      component: () => import('../views/CourseFormView.vue'),
    },
    {
      path: '/teacher/course',
      name: 'course-edit',
      meta: { requiresAuth: true, role: 'teacher', requiresApprovedTeacher: true },
      component: () => import('../views/CourseFormView.vue'),
    },
    {
      path: '/teacher/lesson/new',
      name: 'lesson-create',
      meta: { requiresAuth: true, role: 'teacher', requiresApprovedTeacher: true },
      component: () => import('../views/LessonFormView.vue'),
    },
    {
      path: '/teacher/lesson/:id/edit',
      name: 'lesson-edit',
      meta: { requiresAuth: true, role: 'teacher', requiresApprovedTeacher: true },
      component: () => import('../views/LessonFormView.vue'),
    },
    {
      path: '/teacher/test/new',
      name: 'test-create',
      meta: { requiresAuth: true, role: 'teacher', requiresApprovedTeacher: true },
      component: () => import('../views/TestFormView.vue'),
    },
    {
      path: '/teacher/test/:id/edit',
      name: 'test-edit',
      meta: { requiresAuth: true, role: 'teacher', requiresApprovedTeacher: true },
      component: () => import('../views/TestFormView.vue'),
    },
    {
      path: '/student',
      name: 'student-dashboard',
      meta: { requiresAuth: true, role: 'student' },
      component: () => import('../views/StudentDashboard.vue'),
    },
    {
      path: '/student/lesson/:id',
      name: 'lesson-learn',
      meta: { requiresAuth: true, role: 'student' },
      component: () => import('../views/LessonLearnView.vue'),
    },
    {
      path: '/student/test/:id',
      name: 'test-take',
      meta: { requiresAuth: true, role: 'student' },
      component: () => import('../views/TestTakeView.vue'),
    },
  ],
})

router.beforeEach(async to => {
  const auth = useAuthStore()
  await auth.initialize()

  if (to.meta.requiresAuth && !auth.currentUser) {
    return { name: 'login' }
  }

  if (to.meta.role && auth.role !== to.meta.role) {
    return homeRoute(auth.role)
  }

  if (to.meta.requiresApprovedTeacher && auth.teacherApproval !== 'approved') {
    return { name: 'teacher-dashboard' }
  }

  if (to.meta.requiresAuth && auth.currentUser && ['teacher', 'student'].includes(auth.role)) {
    await useCourseStore().initialize(auth.currentUser.uid, auth.role, auth.teacherApproval)
  }

  if (to.name === 'login' && auth.currentUser) {
    return homeRoute(auth.role)
  }
})

export default router