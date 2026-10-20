<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../stores/course'

const route = useRoute()
const router = useRouter()
const store = useCourseStore()

const isEdit = computed(() => !!route.params.id)
const form = ref({
  sectionId: store.sections[0]?.id ?? null,
  title: '',
  description: '',
  content: '',
  duration: '15 min',
  objectives: [],
  examples: '',
  exercises: [],
  imageUrl: '',
  audioUrl: '',
  videoUrl: '',
})
const objectivesText = ref('')
const exercisesText = ref('')
const formError = ref('')

onMounted(() => {
  if (isEdit.value) {
    const lesson = store.lessons.find(l => String(l.id) === String(route.params.id))
    if (lesson) {
      form.value = { ...lesson }
      objectivesText.value = (lesson.objectives || []).join('\n')
      exercisesText.value = (lesson.exercises || []).join('\n')
    }
  }
})

async function save() {
  if (!form.value.title.trim()) {
    formError.value = 'Enter a lesson title.'
    return
  }
  formError.value = ''
  const payload = {
    ...form.value,
    sectionId: String(form.value.sectionId),
    objectives: objectivesText.value.split('\n').map(item => item.trim()).filter(Boolean),
    exercises: exercisesText.value.split('\n').map(item => item.trim()).filter(Boolean),
  }
  if (isEdit.value) {
    store.updateLesson(route.params.id, payload)
  } else {
    store.addLesson(payload)
  }
  if (!await store.flushPersistence()) return
  router.push('/teacher')
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">
        {{ isEdit ? 'Edit Lesson' : 'Create Lesson' }}
      </h1>
      <p class="mt-1 text-sm text-slate-500">Add the teaching content, learning goals, and supporting media.</p>
    </div>

    <form @submit.prevent="save" class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p v-if="formError" role="alert" class="text-sm text-red-700">{{ formError }}</p>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700" for="lesson-section">Section / module</label>
        <select
          id="lesson-section"
          v-model="form.sectionId"
          required
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option v-for="section in store.sections" :key="section.id" :value="section.id">{{ section.title }}</option>
        </select>
        <p v-if="!store.sections.length" class="mt-2 text-sm text-amber-700">Create a course section before adding a lesson.</p>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
        <input
          v-model="form.title"
          type="text"
          required
          class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="e.g. Introduction to Algebra"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
        <input
          v-model="form.description"
          type="text"
          class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Brief summary for the lesson card"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700">Written explanation</label>
        <textarea
          v-model="form.content"
          rows="7"
          class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Full lesson content..."
        ></textarea>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700">Learning objectives</label>
        <textarea v-model="objectivesText" rows="3" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="One objective per line"></textarea>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700">Examples and demonstrations</label>
        <textarea v-model="form.examples" rows="3" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Worked examples, demonstrations, or notes"></textarea>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700">Interactive exercises</label>
        <textarea v-model="exercisesText" rows="3" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="One exercise per line"></textarea>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Image or diagram URL</label>
          <input v-model="form.imageUrl" type="url" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="https://example.com/diagram.png" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Audio URL</label>
          <input v-model="form.audioUrl" type="url" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="https://example.com/audio.mp3" />
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Video URL</label>
          <input v-model="form.videoUrl" type="url" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="https://example.com/video.mp4" />
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700">Duration</label>
        <input
          v-model="form.duration"
          type="text"
          class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="e.g. 15 min"
        />
      </div>

      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          :disabled="!store.sections.length"
          class="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand-500/25 transition-colors hover:bg-brand-700"
        >
          {{ isEdit ? 'Update Lesson' : 'Create Lesson' }}
        </button>
        <RouterLink
          to="/teacher"
          class="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancel
        </RouterLink>
      </div>
    </form>
  </div>
</template>