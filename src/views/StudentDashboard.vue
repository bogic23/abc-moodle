<script setup>
import { useCourseStore } from '../stores/course'
import { useAuthStore } from '../stores/auth'

const store = useCourseStore()
const auth = useAuthStore()
</script>

<template>
  <div>
    <section class="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-brand-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 sm:px-9 sm:py-10">
      <div class="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/5"></div>
      <div class="pointer-events-none absolute -bottom-32 right-28 h-64 w-64 rounded-full border border-white/10"></div>
      <div class="relative max-w-2xl">
        <span class="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-sky-100">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          YOUR LEARNING SPACE
        </span>
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Welcome back, {{ auth.userName }}<span class="text-brand-200">.</span></h1>
        <p class="mt-2 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">Keep building momentum. Pick up where you left off and make today count.</p>
      </div>
    </section>

    <div class="mb-8 grid gap-4 sm:grid-cols-3">
      <div class="surface-card dashboard-stat interactive-card">
        <div class="relative z-10 flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-slate-500">Lessons completed</p>
            <p class="mt-2 text-3xl font-bold tracking-tight text-slate-900">{{ store.completedLessons }}<span class="text-base font-medium text-slate-400"> / {{ store.lessonCount }}</span></p>
          </div>
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75v10.5m5.25-5.25H6.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          </span>
        </div>
      </div>
      <div class="surface-card dashboard-stat interactive-card">
        <div class="relative z-10 flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-slate-500">Tests completed</p>
            <p class="mt-2 text-3xl font-bold tracking-tight text-slate-900">{{ store.tests.filter(t => t.completed).length }}<span class="text-base font-medium text-slate-400"> / {{ store.testCount }}</span></p>
          </div>
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M6.75 3.75h10.5A2.25 2.25 0 0 1 19.5 6v12a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 18V6a2.25 2.25 0 0 1 2.25-2.25Z" /></svg>
          </span>
        </div>
      </div>
      <div class="surface-card dashboard-stat interactive-card">
        <div class="relative z-10 flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-slate-500">Average score</p>
            <p class="mt-2 text-3xl font-bold tracking-tight text-emerald-600">{{ store.averageScore }}<span class="text-xl">%</span></p>
          </div>
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 18.75V12m5.25 6.75V5.25m5.25 13.5v-9m5.25 9V8.25" /></svg>
          </span>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <div class="mb-4 flex items-end justify-between gap-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Keep learning</p>
          <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-900">Your lessons</h2>
        </div>
        <span class="pb-0.5 text-sm text-slate-500">{{ store.lessonCount }} lessons</span>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="lesson in store.lessons"
          :key="lesson.id"
          :to="`/student/lesson/${lesson.id}`"
          class="surface-card interactive-card group flex min-h-44 flex-col p-5"
        >
          <div class="mb-4 flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9" /><path stroke-linecap="round" d="M12 7v5l3 2" /></svg>
              {{ lesson.duration }}
            </span>
            <span v-if="lesson.completed" class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
              <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
              Done
            </span>
          </div>
          <h3 class="font-semibold leading-6 text-slate-900 transition-colors group-hover:text-brand-700">{{ lesson.title }}</h3>
          <p class="mt-1.5 line-clamp-2 flex-1 text-sm leading-5 text-slate-500">{{ lesson.description }}</p>
          <span class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">Open lesson <span class="transition-transform group-hover:translate-x-1">→</span></span>
        </RouterLink>
      </div>
    </div>

    <div>
      <div class="mb-4 flex items-end justify-between gap-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Check your progress</p>
          <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-900">Your tests</h2>
        </div>
        <span class="pb-0.5 text-sm text-slate-500">{{ store.testCount }} tests</span>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="test in store.tests"
          :key="test.id"
          :to="`/student/test/${test.id}`"
          class="surface-card interactive-card group flex min-h-44 flex-col p-5"
        >
          <div class="mb-4 flex items-center justify-between gap-2">
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{{ test.questions.length }} questions</span>
            <span v-if="test.completed" :class="[
              'rounded-full px-2.5 py-1 text-xs font-bold',
              test.score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            ]">
              {{ test.score }}%
            </span>
          </div>
          <h3 class="font-semibold leading-6 text-slate-900 transition-colors group-hover:text-brand-700">{{ test.title }}</h3>
          <p class="mt-1.5 line-clamp-2 flex-1 text-sm leading-5 text-slate-500">{{ test.description }}</p>
          <span class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">{{ test.completed ? 'Review result' : 'Start test' }} <span class="transition-transform group-hover:translate-x-1">→</span></span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>