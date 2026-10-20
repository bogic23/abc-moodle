<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../stores/course'

const route = useRoute()
const router = useRouter()
const store = useCourseStore()

const test = computed(() => store.tests.find(t => t.id === Number(route.params.id)))
const answers = ref({})
const submitted = ref(false)

onMounted(() => {
  if (!test.value) router.push('/student')
  if (test.value?.completed) submitted.value = true
})

function submit() {
  const arr = test.value.questions.map((_, i) => answers.value[i])
  if (arr.includes(undefined)) {
    alert('Please answer all questions before submitting.')
    return
  }
  store.submitTest(test.value.id, arr)
  submitted.value = true
}
</script>

<template>
  <div v-if="test" class="mx-auto max-w-3xl">
    <RouterLink to="/student" class="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      Back to Dashboard
    </RouterLink>

    <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ test.title }}</h1>
      <p class="mt-2 text-slate-500">{{ test.description }}</p>

      <!-- Result view -->
      <div v-if="submitted" class="mt-8 rounded-xl bg-slate-50 p-6 text-center">
        <p class="text-sm font-medium text-slate-500">Your Score</p>
        <p class="mt-2 text-5xl font-bold" :class="test.score >= 70 ? 'text-emerald-600' : 'text-amber-600'">{{ test.score }}%</p>
        <p class="mt-2 text-sm text-slate-500">{{ test.questions.filter((q, i) => answers[i] === q.correctIndex).length }} of {{ test.questions.length }} correct</p>
      </div>

      <!-- Quiz form -->
      <form v-else @submit.prevent="submit" class="mt-8 space-y-6">
        <div v-for="(q, qi) in test.questions" :key="qi" class="rounded-xl border border-slate-200 p-5">
          <p class="mb-4 font-medium text-slate-900">{{ qi + 1 }}. {{ q.text }}</p>
          <div class="space-y-2">
            <label
              v-for="(opt, oi) in q.options"
              :key="oi"
              class="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50"
            >
              <input type="radio" :name="`q-${qi}`" :value="oi" v-model="answers[qi]" class="h-4 w-4 text-brand-600 focus:ring-brand-500" />
              <span class="text-sm text-slate-700">{{ opt }}</span>
            </label>
          </div>
        </div>

        <button type="submit" class="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand-500/25 transition-colors hover:bg-brand-700">
          Submit Test
        </button>
      </form>
    </div>
  </div>
</template>