<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../stores/course'

const route = useRoute()
const router = useRouter()
const store = useCourseStore()

const lesson = computed(() => store.lessons.find(l => l.id === Number(route.params.id)))

onMounted(() => {
  if (!lesson.value) router.push('/student')
})

function complete() {
  store.markLessonComplete(lesson.value.id)
  router.push('/student')
}
</script>

<template>
  <div v-if="lesson" class="mx-auto max-w-3xl">
    <RouterLink to="/student" class="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      Back to Dashboard
    </RouterLink>

    <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div class="mb-6 flex items-center gap-3">
        <span class="rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700">{{ lesson.duration }}</span>
        <span v-if="lesson.completed" class="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">Completed</span>
      </div>

      <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ lesson.title }}</h1>
      <p class="mt-2 text-slate-500">{{ lesson.description }}</p>

      <hr class="my-6 border-slate-200" />

      <div class="prose prose-slate max-w-none">
        <p class="leading-relaxed text-slate-700">{{ lesson.content }}</p>
      </div>

      <div v-if="!lesson.completed" class="mt-8">
        <button
          @click="complete"
          class="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-500/25 transition-colors hover:bg-emerald-700"
        >
          Mark as Complete
        </button>
      </div>
    </div>
  </div>
</template>