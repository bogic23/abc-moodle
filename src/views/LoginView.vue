<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

function enter(role) {
  auth.switchRole(role)
  router.push(role === 'teacher' ? '/teacher' : '/student')
}
</script>

<template>
  <div class="flex min-h-[76vh] items-center justify-center py-6">
    <div class="w-full max-w-2xl">
      <div class="mb-9 text-center">
        <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-xl shadow-brand-500/25 sm:h-20 sm:w-20 sm:rounded-3xl">
          <span class="text-2xl font-bold text-white sm:text-3xl">A</span>
        </div>
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Learn with confidence</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Welcome to ABC Scores</h1>
        <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">A focused space to teach, learn, and see your progress grow. Choose how you’d like to continue.</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <button
          @click="enter('teacher')"
          class="surface-card interactive-card group relative overflow-hidden p-6 text-left sm:p-7"
        >
          <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition duration-300 group-hover:rotate-3 group-hover:bg-brand-100">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-slate-900">Teacher</h2>
          <p class="mt-1 text-sm text-slate-500">Manage lessons, create tests, and track student progress.</p>
          <span class="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">Continue as teacher <span class="transition-transform group-hover:translate-x-1">→</span></span>
        </button>

        <button
          @click="enter('student')"
          class="surface-card interactive-card group relative overflow-hidden p-6 text-left hover:border-emerald-200 sm:p-7"
        >
          <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition duration-300 group-hover:-rotate-3 group-hover:bg-emerald-100">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-slate-900">Student</h2>
          <p class="mt-1 text-sm text-slate-500">Access lessons, complete tests, and view your scores.</p>
          <span class="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Continue as student <span class="transition-transform group-hover:translate-x-1">→</span></span>
        </button>
      </div>
    </div>
  </div>
</template>