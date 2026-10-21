<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../stores/course'
import { loadGoogleIdentity, uploadLessonMedia } from '../services/googleDrive'

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
const uploadError = ref('')
const uploadProgress = ref(0)
const selectedFiles = ref({ image: null, audio: null, video: null })
const uploadingField = ref('')
const googleIdentityReady = ref(false)
const fileInputs = {
  image: ref(null),
  audio: ref(null),
  video: ref(null),
}

onMounted(async () => {
  if (isEdit.value) {
    const lesson = store.lessons.find(l => String(l.id) === String(route.params.id))
    if (lesson) {
      form.value = { ...lesson }
      objectivesText.value = (lesson.objectives || []).join('\n')
      exercisesText.value = (lesson.exercises || []).join('\n')
    }
  } else if (route.query.section && store.sections.some(section => String(section.id) === String(route.query.section))) {
    form.value.sectionId = String(route.query.section)
  }

  try {
    await loadGoogleIdentity()
    googleIdentityReady.value = true
  } catch (error) {
    uploadError.value = error.message || 'Google authentication could not be loaded.'
  }
})

function selectMediaFile(field, event) {
  const file = event.target.files?.[0] || null
  selectedFiles.value[field] = file
  uploadError.value = ''
  uploadProgress.value = 0

  if (file && !file.type.startsWith(`${field}/`)) {
    selectedFiles.value[field] = null
    event.target.value = ''
    uploadError.value = `Choose a valid ${field} file.`
  }
}

async function uploadSelectedMedia(field) {
  const file = selectedFiles.value[field]
  if (!file || uploadingField.value) return

  uploadError.value = ''
  uploadProgress.value = 0
  uploadingField.value = field
  try {
    form.value[`${field}Url`] = await uploadLessonMedia(file, progress => {
      uploadProgress.value = progress
    })
    selectedFiles.value[field] = null
    fileInputs[field].value.value = ''
  } catch (error) {
    uploadError.value = error.message || 'The file could not be uploaded to Google Drive.'
  } finally {
    uploadingField.value = ''
  }
}

async function save() {
  if (!form.value.title.trim()) {
    formError.value = 'Enter a lesson title.'
    return
  }
  if (uploadingField.value) {
    formError.value = 'Wait for the media upload to finish before saving the lesson.'
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
  router.push({ name: 'teacher-dashboard', query: { section: form.value.sectionId } })
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
      <p v-if="uploadError" role="alert" class="text-sm text-red-700">{{ uploadError }}</p>
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
          <label for="lesson-image-file" class="mt-3 block text-xs font-medium text-slate-600">Or upload an image</label>
          <input id="lesson-image-file" :ref="fileInputs.image" type="file" accept="image/*" class="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200" @change="selectMediaFile('image', $event)" />
          <button type="button" :disabled="!selectedFiles.image || !googleIdentityReady || !!uploadingField" class="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50" @click="uploadSelectedMedia('image')">
            {{ uploadingField === 'image' ? `Uploading ${uploadProgress}%` : 'Upload image to Google Drive' }}
          </button>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Audio URL</label>
          <input v-model="form.audioUrl" type="url" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="https://example.com/audio.mp3" />
          <label for="lesson-audio-file" class="mt-3 block text-xs font-medium text-slate-600">Or upload an audio file</label>
          <input id="lesson-audio-file" :ref="fileInputs.audio" type="file" accept="audio/*" class="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200" @change="selectMediaFile('audio', $event)" />
          <button type="button" :disabled="!selectedFiles.audio || !googleIdentityReady || !!uploadingField" class="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50" @click="uploadSelectedMedia('audio')">
            {{ uploadingField === 'audio' ? `Uploading ${uploadProgress}%` : 'Upload audio to Google Drive' }}
          </button>
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Video URL (YouTube or direct video)</label>
          <input v-model="form.videoUrl" type="url" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="https://www.youtube.com/watch?v=..." />
          <label for="lesson-video-file" class="mt-3 block text-xs font-medium text-slate-600">Or upload a video file</label>
          <input id="lesson-video-file" :ref="fileInputs.video" type="file" accept="video/*" class="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200" @change="selectMediaFile('video', $event)" />
          <button type="button" :disabled="!selectedFiles.video || !googleIdentityReady || !!uploadingField" class="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50" @click="uploadSelectedMedia('video')">
            {{ uploadingField === 'video' ? `Uploading ${uploadProgress}%` : 'Upload video to Google Drive' }}
          </button>
        </div>
      </div>
      <p v-if="uploadingField" role="status" aria-live="polite" class="text-sm text-slate-600">
        Uploading {{ selectedFiles[uploadingField]?.name || 'file' }} to Google Drive: {{ uploadProgress }}%
      </p>
      <p class="text-xs text-slate-500">
        Files uploaded to Drive are shared with anyone who has the link. Uploaded URLs are saved to Firestore when you save this lesson.
      </p>

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
          :disabled="!store.sections.length || !!uploadingField"
          class="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand-500/25 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ isEdit ? 'Update Lesson' : 'Create Lesson' }}
        </button>
        <RouterLink
          :to="{ name: 'teacher-dashboard', query: { section: form.sectionId } }"
          class="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancel
        </RouterLink>
      </div>
    </form>
  </div>
</template>