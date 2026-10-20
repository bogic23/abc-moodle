<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../stores/course'

const route = useRoute()
const router = useRouter()
const store = useCourseStore()
const isNewCourse = route.name === 'course-create'
const form = ref({})
const objectivesText = ref('')
const prerequisitesText = ref('')
const sectionRows = ref([])
const removedSectionIds = ref([])
const sectionError = ref('')
const createdCourseId = ref(null)

onMounted(() => {
  if (!isNewCourse && !store.canManageActiveCourse) {
    router.replace('/teacher/course/new')
    return
  }
  if (isNewCourse) {
    form.value = {
      title: '',
      description: '',
      instructor: '',
      thumbnail: '',
      objectives: [],
      prerequisites: [],
      difficulty: 'Beginner',
      completionRule: 'all-lessons',
      certificateScore: 70,
    }
    sectionRows.value = [{
      title: 'Getting started',
      introduction: '',
      activities: [],
      activitiesText: '',
      testId: null,
      requireAssessment: false,
    }]
    return
  }
  form.value = { ...store.course }
  objectivesText.value = store.course.objectives.join('\n')
  prerequisitesText.value = store.course.prerequisites.join('\n')
  sectionRows.value = store.sections.map(section => ({
    ...section,
    activitiesText: section.activities.join('\n'),
  }))
})

function addSection() {
  sectionRows.value.push({
    title: '',
    introduction: '',
    activities: [],
    activitiesText: '',
    testId: null,
    requireAssessment: false,
  })
}

function removeSection(index) {
  const section = sectionRows.value[index]
  if (section.id) {
    const hasContent = section.lessonIds?.length || section.testId
    const message = hasContent
      ? 'Deleting this section will also delete its lessons and assessment. Continue?'
      : 'Delete this section?'
    if (!confirm(message)) return
    removedSectionIds.value.push(section.id)
  }
  sectionRows.value.splice(index, 1)
}

async function save() {
  if (sectionRows.value.some(section => !section.title.trim())) {
    sectionError.value = 'Each section needs a title.'
    return
  }
  sectionError.value = ''

  const courseDetails = {
    ...form.value,
    objectives: objectivesText.value.split('\n').map(item => item.trim()).filter(Boolean),
    prerequisites: prerequisitesText.value.split('\n').map(item => item.trim()).filter(Boolean),
  }

  const savedSections = sectionRows.value.map(section => ({
      title: section.title.trim(),
      introduction: section.introduction.trim(),
      activities: section.activitiesText.split('\n').map(item => item.trim()).filter(Boolean),
      testId: section.testId ? String(section.testId) : null,
      requireAssessment: section.requireAssessment,
    }))

  if (isNewCourse && !createdCourseId.value) {
    createdCourseId.value = store.addCourse(courseDetails, savedSections)
    sectionRows.value.forEach((section, index) => {
      section.id = store.sections[index].id
    })
  } else {
    store.updateCourse(courseDetails)
    removedSectionIds.value.forEach(id => store.deleteSection(id))
    sectionRows.value.forEach((section, index) => {
      if (section.id) store.updateSection(section.id, savedSections[index])
      else store.addSection(savedSections[index])
    })
  }

  if (!await store.flushPersistence()) return
  router.push('/teacher')
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ isNewCourse ? 'Create a course' : 'Course structure' }}</h1>
      <p class="mt-1 text-sm text-slate-500">{{ isNewCourse ? 'Set up a new course and its first modules.' : 'Set course details and organize its sections and completion requirements.' }}</p>
    </div>

    <form @submit.prevent="save" class="space-y-6">
      <section class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-900">Course details</h2>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Course title</label>
          <input v-model="form.title" required type="text" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
          <textarea v-model="form.description" rows="3" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"></textarea>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Instructor</label>
            <input v-model="form.instructor" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Difficulty level</label>
            <select v-model="form.difficulty" class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Thumbnail URL</label>
          <input v-model="form.thumbnail" type="url" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="https://example.com/course.jpg" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Learning objectives</label>
          <textarea v-model="objectivesText" rows="3" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="One objective per line"></textarea>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Prerequisites</label>
          <textarea v-model="prerequisitesText" rows="2" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="One prerequisite per line"></textarea>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Course completion rule</label>
            <select v-model="form.completionRule" class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              <option value="all-lessons">Complete every lesson</option>
              <option value="lessons-and-assessments">Complete every lesson and required assessment</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Certificate passing score (%)</label>
            <input v-model.number="form.certificateScore" type="number" min="0" max="100" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Sections / modules</h2>
            <p class="mt-1 text-sm text-slate-500">Lessons are ordered by their position in each section.</p>
          </div>
          <button type="button" @click="addSection" class="shrink-0 rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">+ Add section</button>
        </div>
        <p v-if="sectionError" role="alert" class="text-sm text-red-700">{{ sectionError }}</p>

        <article v-for="(section, index) in sectionRows" :key="section.id || `new-${index}`" class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-slate-900">Module {{ index + 1 }}</h3>
            <button type="button" @click="removeSection(index)" class="text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
          </div>
          <input v-model="section.title" required type="text" placeholder="Section title" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          <textarea v-model="section.introduction" rows="2" placeholder="Section introduction" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"></textarea>
          <textarea v-model="section.activitiesText" rows="2" placeholder="Practice activities (one per line)" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"></textarea>
          <div class="grid gap-3 sm:grid-cols-2">
            <select v-if="!isNewCourse" v-model="section.testId" class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              <option :value="null">No section assessment</option>
              <option v-for="test in store.tests" :key="test.id" :value="test.id">{{ test.title }}</option>
            </select>
            <p v-else class="text-sm text-slate-500">You can assign an assessment after creating it.</p>
            <label class="flex items-center gap-2 text-sm text-slate-700">
              <input v-model="section.requireAssessment" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              Require assessment for course completion
            </label>
          </div>
        </article>
        <p v-if="!sectionRows.length" class="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Add a section to start building the course.</p>
      </section>

      <div class="flex gap-3">
        <button type="submit" :disabled="!store.persistenceReady" class="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">{{ isNewCourse ? 'Create course' : 'Save course' }}</button>
        <RouterLink to="/teacher" class="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</RouterLink>
      </div>
    </form>
  </div>
</template>
