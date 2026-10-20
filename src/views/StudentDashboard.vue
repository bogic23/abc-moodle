<script setup>
import { useCourseStore } from '../stores/course'
import { useAuthStore } from '../stores/auth'

const store = useCourseStore()
const auth = useAuthStore()

function lessonsForSection(sectionId) {
  return store.sections.find(section => section.id === sectionId)?.lessonIds
    .map(id => store.lessons.find(lesson => lesson.id === id))
    .filter(Boolean) || []
}

function assessmentForSection(section) {
  return store.tests.find(test => test.id === section.testId)
}

function assessmentRequired(section) {
  return section.requireAssessment || store.course.completionRule === 'lessons-and-assessments'
}

function sectionComplete(section) {
  const sectionLessons = lessonsForSection(section.id)
  const assessment = assessmentForSection(section)
  return sectionLessons.length > 0 &&
    sectionLessons.every(lesson => lesson.completed) &&
    (!assessmentRequired(section) || !assessment || assessment.attempts.some(attempt => attempt.passed))
}

function selectCourse(courseId) {
  store.setActiveCourse(courseId)
}
</script>

<template>
  <div>
    <p v-if="!store.hasCourses" class="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
      No courses are available yet. Check back after an instructor creates a course.
    </p>
    <section v-if="store.courses.length > 1" class="mb-6">
      <h2 class="mb-3 text-sm font-semibold text-slate-700">Your courses</h2>
      <div class="flex gap-3 overflow-x-auto pb-2">
        <button v-for="course in store.courses" :key="course.id" type="button" @click="selectCourse(course.id)" class="min-w-56 rounded-xl border bg-white p-4 text-left transition-colors" :class="course.id === store.activeCourseId ? 'border-brand-300 bg-brand-50 ring-2 ring-brand-100' : 'border-slate-200 hover:border-brand-200'">
          <span class="text-xs font-bold uppercase tracking-wide" :class="course.id === store.activeCourseId ? 'text-brand-700' : 'text-slate-400'">{{ course.id === store.activeCourseId ? 'Selected course' : 'Switch to course' }}</span>
          <span class="mt-1 block font-semibold text-slate-900">{{ course.title }}</span>
          <span class="mt-1 block text-xs text-slate-500">{{ course.progress }}% complete · {{ course.lessonCount }} lessons</span>
        </button>
      </div>
    </section>

    <section v-if="store.hasCourses" class="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-brand-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 sm:px-9 sm:py-10">
      <div class="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/5"></div>
      <div class="pointer-events-none absolute -bottom-32 right-28 h-64 w-64 rounded-full border border-white/10"></div>
      <div class="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <img v-if="store.course.thumbnail" :src="store.course.thumbnail" :alt="`${store.course.title} thumbnail`" class="h-32 w-full rounded-2xl object-cover sm:w-48" />
        <div class="max-w-2xl">
        <span class="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-sky-100">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          {{ store.course.difficulty }} COURSE
        </span>
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ store.course.title }}</h1>
        <p class="mt-2 text-sm leading-6 text-slate-300 sm:text-base">{{ store.course.description }}</p>
        <p class="mt-2 text-sm text-slate-300">Instructor: {{ store.course.instructor }} · Welcome, {{ auth.userName }}</p>
        <div class="mt-5">
          <div class="mb-1.5 flex justify-between text-xs font-semibold text-slate-200">
            <span>Course progress</span><span>{{ store.courseProgress }}%</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-white/20">
            <div class="h-full rounded-full bg-emerald-400 transition-all" :style="{ width: `${store.courseProgress}%` }"></div>
          </div>
          <p v-if="store.certificateEligible" class="mt-2 text-xs font-semibold text-emerald-200">Certificate eligible</p>
          <p v-else-if="store.courseCompleted" class="mt-2 text-xs text-slate-300">Course complete · finish required assessments to qualify for a certificate.</p>
        </div>
        </div>
      </div>
    </section>

    <section v-if="store.hasCourses" class="surface-card mb-8 grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
      <div>
        <h2 class="font-semibold text-slate-900">Learning objectives</h2>
        <ul class="mt-3 space-y-2 text-sm text-slate-600">
          <li v-for="objective in store.course.objectives" :key="objective" class="flex gap-2"><span class="text-brand-600">✓</span>{{ objective }}</li>
        </ul>
      </div>
      <div>
        <h2 class="font-semibold text-slate-900">Prerequisites & completion</h2>
        <p class="mt-3 text-sm text-slate-600">{{ store.course.prerequisites.length ? store.course.prerequisites.join(', ') : 'No prerequisites' }}</p>
        <p class="mt-2 text-sm text-slate-600">{{ store.course.completionRule === 'lessons-and-assessments' ? 'Complete every lesson and every assigned assessment.' : 'Complete every lesson and any assessment marked as required.' }}</p>
      </div>
    </section>

    <div v-if="store.hasCourses" class="mb-8 grid gap-4 sm:grid-cols-3">
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

    <div v-if="store.hasCourses" class="mb-8">
      <div class="mb-4 flex items-end justify-between gap-3">
        <div v-if="store.hasCourses">
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Course curriculum</p>
          <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-900">Sections & lessons</h2>
        </div>
        <span class="pb-0.5 text-sm text-slate-500">{{ store.lessonCount }} lessons</span>
      </div>
      <div class="space-y-5">
        <section v-for="(section, sectionIndex) in store.sections" :key="section.id" class="surface-card p-5 sm:p-6">
          <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Module {{ sectionIndex + 1 }}</p>
              <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ section.title }}</h3>
              <p v-if="section.introduction" class="mt-1 text-sm leading-6 text-slate-500">{{ section.introduction }}</p>
            </div>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {{ lessonsForSection(section.id).filter(lesson => lesson.completed).length }} / {{ lessonsForSection(section.id).length }} lessons
            </span>
          </div>
          <ul v-if="section.activities.length" class="mb-4 flex flex-wrap gap-2">
            <li v-for="activity in section.activities" :key="activity" class="rounded-lg bg-violet-50 px-3 py-1.5 text-xs text-violet-800">{{ activity }}</li>
          </ul>
          <div v-if="assessmentForSection(section)" class="mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
            <RouterLink :to="`/student/test/${assessmentForSection(section).id}`" class="text-sm font-semibold text-brand-700 hover:text-brand-900">
              {{ assessmentRequired(section) ? 'Required assessment' : 'Section assessment' }}: {{ assessmentForSection(section).title }} →
            </RouterLink>
            <span v-if="assessmentRequired(section)" class="text-xs font-medium" :class="sectionComplete(section) ? 'text-emerald-700' : 'text-amber-700'">
              {{ sectionComplete(section) ? 'Requirement complete' : 'Required for course completion' }}
            </span>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <RouterLink v-for="lesson in lessonsForSection(section.id)" :key="lesson.id" :to="`/student/lesson/${lesson.id}`" class="group rounded-xl border border-slate-200 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40">
              <div class="mb-2 flex items-center justify-between gap-2">
                <span class="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{{ lesson.duration }}</span>
                <span v-if="lesson.completed" class="text-xs font-semibold text-emerald-700">Completed</span>
              </div>
              <h4 class="font-semibold text-slate-900 group-hover:text-brand-700">{{ lesson.title }}</h4>
              <p class="mt-1 line-clamp-2 text-sm text-slate-500">{{ lesson.description }}</p>
              <span class="mt-3 inline-block text-sm font-semibold text-brand-700">Open lesson →</span>
            </RouterLink>
          </div>
          <p v-if="!lessonsForSection(section.id).length" class="text-sm text-slate-400">No lessons have been added to this module yet.</p>
        </section>
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
              test.score >= test.passScore ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            ]">
              {{ test.score >= test.passScore ? 'Passed · ' : 'Not passed · ' }}{{ test.score }}%
            </span>
          </div>
          <h3 class="font-semibold leading-6 text-slate-900 transition-colors group-hover:text-brand-700">{{ test.title }}</h3>
          <p class="mt-1.5 line-clamp-2 flex-1 text-sm leading-5 text-slate-500">{{ test.description }}</p>
          <span class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">{{ test.completed ? (test.attempts.length < test.maxAttempts ? 'Review / retake' : 'Review result') : 'Start assessment' }} <span class="transition-transform group-hover:translate-x-1">→</span></span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>