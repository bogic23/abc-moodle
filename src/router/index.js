import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '../stores/auth'
import { useCourseStore } from '../stores/course'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'login', component: LoginView },
    {
      path: '/teacher',
      name: 'teacher-dashboard',
      meta: { requiresAuth: true, role: 'teacher' },
      component: () => import('../views/TeacherDashboard.vue'),
    },
    {
      path: '/teacher/course/new',
      name: 'course-create',
      meta: { requiresAuth: true, role: 'teacher' },
      component: () => import('../views/CourseFormView.vue'),
    },
    {
      path: '/teacher/course',
      name: 'course-edit',
      meta: { requiresAuth: true, role: 'teacher' },
      component: () => import('../views/CourseFormView.vue'),
    },
    {
      path: '/teacher/lesson/new',
      name: 'lesson-create',
      meta: { requiresAuth: true, role: 'teacher' },
      component: () => import('../views/LessonFormView.vue'),
    },
    {
      path: '/teacher/lesson/:id/edit',
      name: 'lesson-edit',
      meta: { requiresAuth: true, role: 'teacher' },
      component: () => import('../views/LessonFormView.vue'),
    },
    {
      path: '/teacher/test/new',
      name: 'test-create',
      meta: { requiresAuth: true, role: 'teacher' },
      component: () => import('../views/TestFormView.vue'),
    },
    {
      path: '/teacher/test/:id/edit',
      name: 'test-edit',
      meta: { requiresAuth: true, role: 'teacher' },
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
    return { name: auth.role === 'teacher' ? 'teacher-dashboard' : 'student-dashboard' }
  }

  if (to.meta.requiresAuth && auth.currentUser) {
    await useCourseStore().initialize(auth.currentUser.uid, auth.role)
  }

  if (to.name === 'login' && auth.currentUser) {
    return { name: auth.role === 'teacher' ? 'teacher-dashboard' : 'student-dashboard' }
  }
})

export default router