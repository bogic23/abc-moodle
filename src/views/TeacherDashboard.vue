<script setup>
import { useCourseStore } from '../stores/course'

const store = useCourseStore()

function deleteLesson(id) {
  if (confirm('Delete this lesson?')) store.deleteLesson(id)
}

function deleteTest(id) {
  if (confirm('Delete this test?')) store.deleteTest(id)
}
</script>

<template>
  <div>
    <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Your teaching space</p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Teacher dashboard</h1>
        <p class="mt-1 text-sm text-slate-500">Create, organize, and track your learning content.</p>
      </div>
      <span class="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        Workspace active
      </span>
    </div>

    <div class="mb-8 grid gap-4 sm:grid-cols-3">
      <div class="surface-card dashboard-stat interactive-card">
        <p class="text-sm font-medium text-slate-500">Total Lessons</p>
        <p class="relative z-10 mt-2 text-3xl font-bold tracking-tight text-slate-900">{{ store.lessonCount }}</p>
      </div>
      <div class="surface-card dashboard-stat interactive-card">
        <p class="text-sm font-medium text-slate-500">Total Tests</p>
        <p class="relative z-10 mt-2 text-3xl font-bold tracking-tight text-slate-900">{{ store.testCount }}</p>
      </div>
      <div class="surface-card dashboard-stat interactive-card">
        <p class="text-sm font-medium text-slate-500">Student Completion</p>
        <p class="relative z-10 mt-2 text-3xl font-bold tracking-tight text-slate-900">{{ store.completedLessons }}<span class="text-base font-medium text-slate-400"> / {{ store.lessonCount }}</span></p>
      </div>
    </div>

    <div class="mb-8">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Course content</p>
          <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-900">Lessons</h2>
        </div>
        <RouterLink
          to="/teacher/lesson/new"
          class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:-translate-y-0.5 hover:bg-brand-700 sm:px-4"
        >
          <span class="text-lg leading-none">+</span><span>Add lesson</span>
        </RouterLink>
      </div>
      <div class="space-y-3">
        <div
          v-for="lesson in store.lessons"
          :key="lesson.id"
          class="surface-card flex flex-col gap-4 p-4 transition duration-200 hover:border-brand-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div class="min-w-0 flex-1">
            <h3 class="font-medium text-slate-900">{{ lesson.title }}</h3>
            <p class="mt-0.5 truncate text-sm text-slate-500">{{ lesson.description }}</p>
            <span class="mt-1 inline-block text-xs text-slate-400">{{ lesson.duration }}</span>
          </div>
          <div class="flex shrink-0 items-center gap-2 sm:ml-4">
            <RouterLink
              :to="`/teacher/lesson/${lesson.id}/edit`"
              class="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              Edit
            </RouterLink>
            <button
              @click="deleteLesson(lesson.id)"
              class="rounded-lg border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="mb-4 flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Knowledge checks</p>
          <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-900">Tests</h2>
        </div>
        <RouterLink
          to="/teacher/test/new"
          class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:-translate-y-0.5 hover:bg-brand-700 sm:px-4"
        >
          <span class="text-lg leading-none">+</span><span>Add test</span>
        </RouterLink>
      </div>
      <div class="space-y-3">
        <div
          v-for="test in store.tests"
          :key="test.id"
          class="surface-card flex flex-col gap-4 p-4 transition duration-200 hover:border-brand-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div class="min-w-0 flex-1">
            <h3 class="font-medium text-slate-900">{{ test.title }}</h3>
            <p class="mt-0.5 truncate text-sm text-slate-500">{{ test.description }}</p>
            <span class="mt-1 inline-block text-xs text-slate-400">{{ test.questions.length }} questions · {{ test.duration }}</span>
          </div>
          <div class="flex shrink-0 items-center gap-2 sm:ml-4">
            <RouterLink
              :to="`/teacher/test/${test.id}/edit`"
              class="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              Edit
            </RouterLink>
            <button
              @click="deleteTest(test.id)"
              class="rounded-lg border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>