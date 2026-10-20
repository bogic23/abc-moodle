import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'login', component: LoginView },
    {
      path: '/teacher',
      name: 'teacher-dashboard',
      component: () => import('../views/TeacherDashboard.vue'),
    },
    {
      path: '/teacher/lesson/new',
      name: 'lesson-create',
      component: () => import('../views/LessonFormView.vue'),
    },
    {
      path: '/teacher/lesson/:id/edit',
      name: 'lesson-edit',
      component: () => import('../views/LessonFormView.vue'),
    },
    {
      path: '/teacher/test/new',
      name: 'test-create',
      component: () => import('../views/TestFormView.vue'),
    },
    {
      path: '/teacher/test/:id/edit',
      name: 'test-edit',
      component: () => import('../views/TestFormView.vue'),
    },
    {
      path: '/student',
      name: 'student-dashboard',
      component: () => import('../views/StudentDashboard.vue'),
    },
    {
      path: '/student/lesson/:id',
      name: 'lesson-learn',
      component: () => import('../views/LessonLearnView.vue'),
    },
    {
      path: '/student/test/:id',
      name: 'test-take',
      component: () => import('../views/TestTakeView.vue'),
    },
  ],
})

export default router