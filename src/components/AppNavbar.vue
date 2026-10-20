<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function switchRole(role) {
  auth.switchRole(role)
  router.push(role === 'teacher' ? '/teacher' : '/student')
}
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-white/70 bg-white/75 backdrop-blur-xl">
    <div class="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
      <RouterLink
        :to="auth.role === 'teacher' ? '/teacher' : '/student'"
        class="group flex min-w-0 items-center gap-3 rounded-lg"
        aria-label="ABC Scores home"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/25 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
          <span class="text-sm font-bold text-white">A</span>
        </div>
        <span class="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">ABC Scores</span>
      </RouterLink>

      <div class="flex shrink-0 items-center gap-0.5 rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 sm:gap-1">
        <button
          @click="switchRole('teacher')"
          :aria-pressed="auth.role === 'teacher'"
          :class="[
            'rounded-lg px-2.5 py-2 text-xs font-semibold transition-all duration-200 sm:px-4 sm:text-sm',
            auth.role === 'teacher'
              ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200/70'
              : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          Teacher
        </button>
        <button
          @click="switchRole('student')"
          :aria-pressed="auth.role === 'student'"
          :class="[
            'rounded-lg px-2.5 py-2 text-xs font-semibold transition-all duration-200 sm:px-4 sm:text-sm',
            auth.role === 'student'
              ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200/70'
              : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          Student
        </button>
      </div>

      <div class="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <div class="hidden min-w-0 text-right sm:block">
          <p class="text-sm font-medium text-slate-900">{{ auth.userName }}</p>
          <p class="text-xs capitalize text-slate-500">{{ auth.role }} workspace</p>
        </div>
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-sm font-bold text-brand-700 ring-2 ring-white shadow-sm sm:h-10 sm:w-10">
          {{ auth.userName.charAt(0) }}
        </div>
      </div>
    </div>
  </nav>
</template>