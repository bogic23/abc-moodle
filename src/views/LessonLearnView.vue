<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../stores/course'

const route = useRoute()
const router = useRouter()
const store = useCourseStore()
const exerciseResponses = ref({})

const lesson = computed(() => store.lessons.find(l => String(l.id) === String(route.params.id)))
const section = computed(() => store.sections.find(item => String(item.id) === String(lesson.value?.sectionId)))
const orderedLessons = computed(() => store.sections.flatMap(item =>
  item.lessonIds.map(id => store.lessons.find(candidate => String(candidate.id) === String(id))).filter(Boolean),
))
const lessonIndex = computed(() => orderedLessons.value.findIndex(item => String(item.id) === String(lesson.value?.id)))
const previousLesson = computed(() => orderedLessons.value[lessonIndex.value - 1] || null)
const nextLesson = computed(() => orderedLessons.value[lessonIndex.value + 1] || null)

onMounted(() => {
  if (!lesson.value) router.push({ name: 'student-dashboard', query: route.query })
})

function complete() {
  store.markLessonComplete(lesson.value.id)
  if (nextLesson.value) router.push({ name: 'lesson-learn', params: { id: nextLesson.value.id }, query: route.query })
  else router.push({ name: 'student-dashboard', query: route.query })
}
</script>

<template>
  <div v-if="lesson" class="mx-auto max-w-3xl">
    <RouterLink :to="{ name: 'student-dashboard', query: route.query }" class="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      Back to Dashboard
    </RouterLink>

    <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div class="mb-6 flex items-center gap-3">
        <span class="rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700">{{ lesson.duration }}</span>
        <span v-if="lesson.completed" class="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">Completed</span>
      </div>

      <p v-if="section" class="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">{{ section.title }}</p>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ lesson.title }}</h1>
      <p class="mt-2 text-slate-500">{{ lesson.description }}</p>
      <p v-if="section?.introduction" class="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{{ section.introduction }}</p>

      <hr class="my-6 border-slate-200" />

      <section v-if="lesson.objectives?.length" class="mb-7">
        <h2 class="mb-3 text-lg font-semibold text-slate-900">Learning objectives</h2>
        <ul class="space-y-2">
          <li v-for="objective in lesson.objectives" :key="objective" class="flex gap-2 text-sm text-slate-700">
            <span class="text-emerald-600">✓</span>{{ objective }}
          </li>
        </ul>
      </section>

      <div class="prose prose-slate max-w-none">
        <p v-for="(paragraph, index) in lesson.content.split('\n').filter(Boolean)" :key="index" class="mb-4 whitespace-pre-line leading-relaxed text-slate-700">{{ paragraph }}</p>
      </div>

      <img v-if="lesson.imageUrl" :src="lesson.imageUrl" :alt="`${lesson.title} illustration`" class="mt-6 max-h-[28rem] w-full rounded-xl border border-slate-200 object-contain" />
      <audio v-if="lesson.audioUrl" controls :src="lesson.audioUrl" class="mt-6 w-full">Your browser does not support audio playback.</audio>
      <video v-if="lesson.videoUrl" controls :src="lesson.videoUrl" class="mt-6 max-h-[28rem] w-full rounded-xl bg-slate-950">Your browser does not support video playback.</video>

      <section v-if="lesson.examples" class="mt-8 rounded-xl border border-brand-100 bg-brand-50/60 p-5">
        <h2 class="mb-2 font-semibold text-slate-900">Examples and demonstrations</h2>
        <p class="whitespace-pre-line text-sm leading-6 text-slate-700">{{ lesson.examples }}</p>
      </section>

      <section v-if="lesson.exercises?.length" class="mt-8">
        <h2 class="mb-3 text-lg font-semibold text-slate-900">Practice activities</h2>
        <ol class="space-y-4">
          <li v-for="(exercise, index) in lesson.exercises" :key="exercise" class="rounded-xl border border-slate-200 p-4">
            <label :for="`exercise-${index}`" class="block text-sm font-medium leading-6 text-slate-800">{{ index + 1 }}. {{ exercise }}</label>
            <textarea :id="`exercise-${index}`" v-model="exerciseResponses[index]" rows="2" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Write your response here"></textarea>
          </li>
        </ol>
      </section>

      <div v-if="!lesson.completed" class="mt-8">
        <button
          @click="complete"
          class="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-500/25 transition-colors hover:bg-emerald-700"
        >
          Mark as Complete
        </button>
      </div>

      <nav class="mt-8 flex flex-col justify-between gap-3 border-t border-slate-200 pt-5 sm:flex-row">
        <RouterLink v-if="previousLesson" :to="{ name: 'lesson-learn', params: { id: previousLesson.id }, query: route.query }" class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
          ← {{ previousLesson.title }}
        </RouterLink>
        <span v-else></span>
        <RouterLink v-if="nextLesson" :to="{ name: 'lesson-learn', params: { id: nextLesson.id }, query: route.query }" class="rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-brand-700">
          Next: {{ nextLesson.title }} →
        </RouterLink>
        <RouterLink v-else :to="{ name: 'student-dashboard', query: route.query }" class="rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-brand-700">
          Back to course →
        </RouterLink>
      </nav>
    </div>
  </div>
</template>