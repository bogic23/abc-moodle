<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCourseStore } from '../stores/course'

const route = useRoute()
const auth = useAuthStore()
const store = useCourseStore()
const managedCourses = computed(() => store.courses.filter(course => course.ownerUid === store.currentUserId))
const activeSectionId = ref(null)
const activeSection = computed(() => store.sections.find(section => String(section.id) === String(activeSectionId.value)))
const activeLessons = computed(() => activeSection.value
  ? activeSection.value.lessonIds
    .map(id => store.lessons.find(lesson => String(lesson.id) === String(id)))
    .filter(Boolean)
  : [])
const activeTest = computed(() => store.tests.find(test => String(test.id) === String(activeSection.value?.testId)))

function syncActiveSection() {
  const requestedId = route.query.section
  const matchingSection = store.sections.find(section => String(section.id) === String(requestedId))
  activeSectionId.value = matchingSection?.id ?? store.sections[0]?.id ?? null
}

watch(() => [
  store.activeCourseId,
  store.sections.map(section => String(section.id)).join(','),
  route.query.section,
], syncActiveSection, { immediate: true })

function deleteLesson(id) {
  if (confirm('Delete this lesson?')) store.deleteLesson(id)
}

function deleteTest(id) {
  if (confirm('Delete this test?')) store.deleteTest(id)
}

function lessonPosition(lesson) {
  return activeSection.value?.lessonIds.findIndex(id => String(id) === String(lesson.id)) ?? -1
}

function moveLesson(lesson, direction) {
  store.moveLesson(lesson.id, direction)
}

function selectCourse(courseId) {
  store.setActiveCourse(courseId)
  activeSectionId.value = null
}

function selectSection(sectionId) {
  activeSectionId.value = sectionId
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
      <RouterLink v-if="store.isTeacherApproved" to="/teacher/course" class="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700">
        Manage course & modules
      </RouterLink>
    </div>

    <section v-if="!store.isTeacherApproved" class="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
      <p class="font-semibold text-amber-900">{{ auth.teacherApproval === 'rejected' ? 'Teacher request not approved' : 'Teacher account pending approval' }}</p>
      <p class="mt-1 text-sm leading-6 text-amber-800">{{ auth.teacherApproval === 'rejected' ? 'An admin declined your teacher request. Please contact an administrator if you think this is a mistake.' : 'An admin must approve your teacher account before you can create courses or manage course content. You can continue once your approval status is updated.' }}</p>
    </section>

    <section class="mb-8">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Your catalog</p>
          <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-900">Courses</h2>
          <p v-if="store.persistenceStatus === 'saving'" class="mt-1 text-xs text-slate-500">Saving changes to Firestore…</p>
          <p v-else-if="store.persistenceStatus === 'saved'" class="mt-1 text-xs text-emerald-700">Changes saved to Firestore</p>
        </div>
        <RouterLink v-if="store.persistenceReady && store.isTeacherApproved" to="/teacher/course/new" class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-colors hover:bg-brand-700">
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

    <template v-if="store.canManageActiveCourse">
      <div class="mb-8 grid gap-4 sm:grid-cols-4">
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

      <section class="surface-card mb-6 p-5 sm:p-6">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Curriculum outline</p>
            <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-900">Choose a module to manage its content</h2>
          </div>
          <RouterLink to="/teacher/course" class="shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-900">Edit structure →</RouterLink>
        </div>
        <div v-if="store.sections.length" class="flex gap-3 overflow-x-auto pb-2">
          <button
            v-for="(section, index) in store.sections"
            :key="section.id"
            type="button"
            :aria-pressed="String(activeSectionId) === String(section.id)"
            @click="selectSection(section.id)"
            class="min-w-56 flex-1 rounded-xl border p-4 text-left transition-colors"
            :class="String(activeSectionId) === String(section.id) ? 'border-brand-300 bg-brand-50 ring-2 ring-brand-100' : 'border-slate-200 hover:border-brand-200 hover:bg-slate-50'"
          >
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Module {{ index + 1 }}</p>
            <h3 class="mt-1 font-semibold text-slate-900">{{ section.title }}</h3>
            <p class="mt-1 text-sm text-slate-500">{{ section.lessonIds.length }} lessons · {{ section.activities.length }} practice activities</p>
            <p class="mt-1 text-xs text-slate-400">{{ section.testId ? 'Assessment assigned' : 'No assessment assigned' }}</p>
          </button>
        </div>
        <p v-else class="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">Add modules in the course structure to organize lessons and assessments.</p>
      </section>

      <section v-if="activeSection" class="surface-card space-y-8 p-5 sm:p-6">
        <div class="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Selected module</p>
            <h2 class="mt-1 text-xl font-bold tracking-tight text-slate-900">{{ activeSection.title }}</h2>
            <p v-if="activeSection.introduction" class="mt-1 text-sm text-slate-500">{{ activeSection.introduction }}</p>
          </div>
          <RouterLink to="/teacher/course" class="shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-900">Edit module structure →</RouterLink>
        </div>

        <div>
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Module {{ store.sections.findIndex(section => String(section.id) === String(activeSection.id)) + 1 }}</p>
              <h3 class="mt-1 text-lg font-semibold text-slate-900">Lessons <span class="text-sm font-medium text-slate-400">({{ activeLessons.length }})</span></h3>
            </div>
            <RouterLink
              :to="{ name: 'lesson-create', query: { section: activeSection.id } }"
              class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-colors hover:bg-brand-700"
            >
              <span class="text-lg leading-none">+</span><span>Add lesson</span>
            </RouterLink>
          </div>
          <div v-if="activeLessons.length" class="space-y-3">
            <article v-for="lesson in activeLessons" :key="lesson.id" class="surface-card flex flex-col gap-4 p-4 transition duration-200 hover:border-brand-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div class="min-w-0 flex-1">
                <h4 class="font-medium text-slate-900">{{ lesson.title }}</h4>
                <p class="mt-0.5 truncate text-sm text-slate-500">{{ lesson.description }}</p>
                <span class="mt-1 inline-block text-xs text-slate-400">{{ lesson.duration }}</span>
              </div>
              <div class="flex shrink-0 items-center gap-2 sm:ml-4">
                <div class="flex flex-col">
                  <button type="button" :disabled="lessonPosition(lesson) <= 0" :aria-label="`Move ${lesson.title} up`" @click="moveLesson(lesson, -1)" class="rounded px-2 text-xs text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30">▲</button>
                  <button type="button" :disabled="lessonPosition(lesson) < 0 || lessonPosition(lesson) >= activeSection.lessonIds.length - 1" :aria-label="`Move ${lesson.title} down`" @click="moveLesson(lesson, 1)" class="rounded px-2 text-xs text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30">▼</button>
                </div>
                <RouterLink :to="{ name: 'lesson-edit', params: { id: lesson.id }, query: { section: activeSection.id } }" class="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700">Edit</RouterLink>
                <button type="button" @click="deleteLesson(lesson.id)" class="rounded-lg border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">Delete</button>
              </div>
            </article>
          </div>
          <p v-else class="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">No lessons in this module yet. Add the first lesson to get started.</p>
        </div>

        <div>
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Knowledge check</p>
              <h3 class="mt-1 text-lg font-semibold text-slate-900">Assessment</h3>
            </div>
            <RouterLink v-if="!activeTest" :to="{ name: 'test-create', query: { section: activeSection.id } }" class="inline-flex shrink-0 items-center gap-2 rounded-xl border border-violet-200 px-3.5 py-2.5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50">
              <span class="text-lg leading-none">+</span><span>Add assessment</span>
            </RouterLink>
          </div>
          <article v-if="activeTest" class="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div class="min-w-0 flex-1">
              <h4 class="font-medium text-slate-900">{{ activeTest.title }}</h4>
              <p class="mt-0.5 truncate text-sm text-slate-500">{{ activeTest.description }}</p>
              <span class="mt-1 inline-block text-xs text-slate-400">{{ activeTest.questions.length }} questions · {{ activeTest.duration }} · {{ activeTest.passScore }}% to pass · {{ activeTest.attempts.length }}/{{ activeTest.maxAttempts }} attempts used</span>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <RouterLink :to="{ name: 'test-edit', params: { id: activeTest.id }, query: { section: activeSection.id } }" class="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700">Edit</RouterLink>
              <button type="button" @click="deleteTest(activeTest.id)" class="rounded-lg border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">Delete</button>
            </div>
          </article>
          <p v-else class="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">No assessment assigned to this module.</p>
        </div>
      </section>
    </template>
  </div>
</template>
