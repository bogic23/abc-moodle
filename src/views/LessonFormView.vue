<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../stores/course'

const route = useRoute()
const router = useRouter()
const store = useCourseStore()

const isEdit = computed(() => !!route.params.id)
const form = ref({
  title: '',
  description: '',
  content: '',
  duration: '15 min',
})

onMounted(() => {
  if (isEdit.value) {
    const lesson = store.lessons.find(l => l.id === Number(route.params.id))
    if (lesson) form.value = { ...lesson }
  }
})

function save() {
  if (!form.value.title.trim()) return
  if (isEdit.value) {
    store.updateLesson(Number(route.params.id), form.value)
  } else {
    store.addLesson(form.value)
  }
  router.push('/teacher')
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">
        {{ isEdit ? 'Edit Lesson' : 'Create Lesson' }}
      </h1>
    </div>

    <form @submit.prevent="save" class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
        <label class="mb-1.5 block text-sm font-medium text-slate-700">Content</label>
        <textarea
          v-model="form.content"
          rows="6"
          class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Full lesson content..."
        ></textarea>
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