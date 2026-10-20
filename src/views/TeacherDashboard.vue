<script setup>
import { computed } from 'vue'
import { useCourseStore } from '../stores/course'

const store = useCourseStore()
const managedCourses = computed(() => store.courses.filter(course => course.ownerUid === store.currentUserId))

function deleteLesson(id) {
  if (confirm('Delete this lesson?')) store.deleteLesson(id)
}

function deleteTest(id) {
  if (confirm('Delete this test?')) store.deleteTest(id)
}

function lessonPosition(lesson) {
  const section = store.sections.find(item => item.id === lesson.sectionId)
  return section ? section.lessonIds.indexOf(lesson.id) : -1
}

function moveLesson(lesson, direction) {
  store.moveLesson(lesson.id, direction)
}

function selectCourse(courseId) {
  store.setActiveCourse(courseId)
}
</script>

<template>
  <div>
    <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Your teaching space</p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{{ store.course.title || 'Teacher dashboard' }}</h1>
        <p class="mt-1 text-sm text-slate-500">{{ store.course.description || 'Create and manage your courses.' }}</p>
      </div>
      <RouterLink to="/teacher/course" class="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700">
        Manage course & modules
      </RouterLink>
    </div>

    <section class="mb-8">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Your catalog</p>
          <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-900">Courses</h2>
          <p v-if="store.persistenceStatus === 'saving'" class="mt-1 text-xs text-slate-500">Saving changes to Firestore…</p>
          <p v-else-if="store.persistenceStatus === 'saved'" class="mt-1 text-xs text-emerald-700">Changes saved to Firestore</p>
        </div>
        <RouterLink v-if="store.persistenceReady" to="/teacher/course/new" class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-colors hover:bg-brand-700">
          <span class="text-lg leading-none">+</span> Add course
        </RouterLink>
      </div>
      <div v-if="managedCourses.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="course in managedCourses" :key="course.id" class="surface-card flex flex-col p-4" :class="course.id === store.activeCourseId ? 'border-brand-300 ring-2 ring-brand-100' : ''">
          <div class="flex-1">
            <span v-if="course.id === store.activeCourseId" class="text-xs font-bold uppercase tracking-wide text-brand-700">Currently managing</span>
            <h3 class="mt-1 font-semibold text-slate-900">{{ course.title }}</h3>
            <p class="mt-1 line-clamp-2 text-sm text-slate-500">{{ course.description || 'No course description yet.' }}</p>
            <p class="mt-3 text-xs text-slate-500">{{ course.sectionCount }} modules · {{ course.lessonCount }} lessons · {{ course.progress }}% complete</p>
          </div>
          <button v-if="course.id !== store.activeCourseId" type="button" @click="selectCourse(course.id)" class="mt-4 self-start rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700">
            Manage this course
          </button>
        </article>
      </div>
      <p v-else class="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">You don’t have any courses yet. Add a course to get started.</p>
    </section>

    <div v-if="store.canManageActiveCourse" class="mb-8 grid gap-4 sm:grid-cols-4">
      <div class="surface-card dashboard-stat interactive-card">
        <p class="text-sm font-medium text-slate-500">Total Lessons</p>
        <p class="relative z-10 mt-2 text-3xl font-bold tracking-tight text-slate-900">{{ store.lessonCount }}</p>
      </div>
      <div class="surface-card dashboard-stat interactive-card">
        <p class="text-sm font-medium text-slate-500">Total Tests</p>
        <p class="relative z-10 mt-2 text-3xl font-bold tracking-tight text-slate-900">{{ store.testCount }}</p>
      </div>
      <div class="surface-card dashboard-stat interactive-card">
        <p class="text-sm font-medium text-slate-500">Lessons completed</p>
        <p class="relative z-10 mt-2 text-3xl font-bold tracking-tight text-slate-900">{{ store.completedLessons }}<span class="text-base font-medium text-slate-400"> / {{ store.lessonCount }}</span></p>
      </div>
      <div class="surface-card dashboard-stat interactive-card">
        <p class="text-sm font-medium text-slate-500">Course progress</p>
        <p class="relative z-10 mt-2 text-3xl font-bold tracking-tight text-slate-900">{{ store.courseProgress }}%</p>
      </div>
    </div>

    <section v-if="store.canManageActiveCourse" class="surface-card mb-8 p-5 sm:p-6">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Curriculum outline</p>
          <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-900">Sections / modules</h2>
        </div>
        <RouterLink to="/teacher/course" class="text-sm font-semibold text-brand-700 hover:text-brand-900">Edit structure →</RouterLink>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <div v-for="(section, index) in store.sections" :key="section.id" class="rounded-xl border border-slate-200 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Module {{ index + 1 }}</p>
          <h3 class="mt-1 font-semibold text-slate-900">{{ section.title }}</h3>
          <p class="mt-1 text-sm text-slate-500">{{ section.lessonIds.length }} lessons · {{ section.activities.length }} practice activities</p>
          <p class="mt-1 text-xs text-slate-400">{{ section.requireAssessment ? 'Assessment required for course completion' : section.testId ? 'Assessment optional' : 'No assessment assigned' }}</p>
        </div>
      </div>
    </section>

    <div v-if="store.canManageActiveCourse" class="mb-8">
      <div class="mb-4 flex items-center justify-between">
        <div v-if="store.canManageActiveCourse">
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
            <span class="mt-1 inline-block text-xs text-slate-400">{{ store.sections.find(section => section.id === lesson.sectionId)?.title || 'No section' }} · {{ lesson.duration }}</span>
          </div>
          <div class="flex shrink-0 items-center gap-2 sm:ml-4">
            <div class="flex flex-col">
              <button type="button" :disabled="lessonPosition(lesson) <= 0" :aria-label="`Move ${lesson.title} up`" @click="moveLesson(lesson, -1)" class="rounded px-2 text-xs text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30">▲</button>
              <button type="button" :disabled="lessonPosition(lesson) < 0 || lessonPosition(lesson) >= (store.sections.find(section => section.id === lesson.sectionId)?.lessonIds.length || 0) - 1" :aria-label="`Move ${lesson.title} down`" @click="moveLesson(lesson, 1)" class="rounded px-2 text-xs text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30">▼</button>
            </div>
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
            <span class="mt-1 inline-block text-xs text-slate-400">{{ test.questions.length }} questions · {{ test.duration }} · {{ test.passScore }}% to pass · {{ test.attempts.length }}/{{ test.maxAttempts }} attempts used</span>
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