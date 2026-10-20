<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../stores/course'

const route = useRoute()
const router = useRouter()
const store = useCourseStore()
const test = computed(() => store.tests.find(item => String(item.id) === String(route.params.id)))
const answers = ref({})
const matchingOptions = ref({})
const submitted = ref(false)
const remainingSeconds = ref(0)
let timerId

const latestAttempt = computed(() => test.value?.attempts.at(-1) || null)
const canRetake = computed(() => !!test.value && test.value.attempts.length < test.value.maxAttempts)
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60).toString().padStart(2, '0')
  const seconds = (remainingSeconds.value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
})

function clearTimer() {
  if (timerId) {
    window.clearInterval(timerId)
    timerId = undefined
  }
}

function startTimer() {
  clearTimer()
  remainingSeconds.value = Math.max(1, Number(test.value.timeLimit) || 10) * 60
  timerId = window.setInterval(() => {
    if (remainingSeconds.value <= 1) {
      remainingSeconds.value = 0
      submit(true)
    } else {
      remainingSeconds.value--
    }
  }, 1000)
}

function startAttempt() {
  answers.value = {}
  matchingOptions.value = {}
  test.value.questions.forEach((question, index) => {
    if (question.type === 'matching') {
      answers.value[index] = question.pairs.map(() => '')
      matchingOptions.value[index] = [...question.pairs.map(pair => pair.right)]
      for (let optionIndex = matchingOptions.value[index].length - 1; optionIndex > 0; optionIndex--) {
        const swapIndex = Math.floor(Math.random() * (optionIndex + 1))
        const currentOption = matchingOptions.value[index][optionIndex]
        matchingOptions.value[index][optionIndex] = matchingOptions.value[index][swapIndex]
        matchingOptions.value[index][swapIndex] = currentOption
      }
    } else {
      answers.value[index] = undefined
    }
  })
  submitted.value = false
  startTimer()
}

onMounted(() => {
  if (!test.value) {
    router.push({ name: 'student-dashboard', query: route.query })
    return
  }
  if (test.value.completed) submitted.value = true
  else startAttempt()
})

onUnmounted(clearTimer)

function submit(force = false) {
  if (!test.value || submitted.value) return
  const missingAnswer = test.value.questions.some((question, index) => {
    const answer = answers.value[index]
    return answer === undefined || answer === '' || (Array.isArray(answer) && answer.some(item => item === ''))
  })
  if (missingAnswer && !force) {
    alert('Please answer all questions before submitting.')
    return
  }
  const attempt = store.submitTest(test.value.id, test.value.questions.map((_, index) => answers.value[index]), force)
  if (!attempt) {
    alert('No attempts remain for this assessment.')
    return
  }
  submitted.value = true
  clearTimer()
}

function retake() {
  if (store.retakeTest(test.value.id)) startAttempt()
}

function answerLabel(question, answer) {
  if (answer === undefined || answer === '') return 'No answer'
  if (question.type === 'multiple-choice') return question.options[answer] ?? 'No answer'
  if (question.type === 'true-false') return answer ? 'True' : 'False'
  if (question.type === 'fill-blank') return answer
  if (question.type === 'matching') {
    return question.pairs.map((pair, index) => `${pair.left} → ${answer[index] || 'No answer'}`).join('; ')
  }
  return 'No answer'
}

function correctAnswerLabel(question) {
  if (question.type === 'multiple-choice') return question.options[question.correctIndex]
  if (question.type === 'true-false') return question.correctAnswer ? 'True' : 'False'
  if (question.type === 'fill-blank') return question.correctAnswer
  return question.pairs.map(pair => `${pair.left} → ${pair.right}`).join('; ')
}
</script>

<template>
  <div v-if="test" class="mx-auto max-w-3xl">
    <RouterLink :to="{ name: 'student-dashboard', query: route.query }" class="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      Back to course
    </RouterLink>

    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ test.title }}</h1>
          <p class="mt-2 text-slate-500">{{ test.description }}</p>
        </div>
        <span v-if="!submitted" class="rounded-lg bg-amber-50 px-3 py-1.5 font-mono text-sm font-semibold text-amber-800" role="timer" aria-live="polite">
          {{ formattedTime }} left
        </span>
      </div>
      <p class="mt-3 text-xs text-slate-500">Passing score: {{ test.passScore }}% · Attempt {{ Math.min(test.attempts.length + (submitted ? 0 : 1), test.maxAttempts) }} of {{ test.maxAttempts }}</p>

      <section v-if="submitted && latestAttempt" class="mt-8">
        <div class="rounded-xl p-6 text-center" :class="latestAttempt.passed ? 'bg-emerald-50' : 'bg-amber-50'">
          <p class="text-sm font-medium text-slate-600">Attempt {{ latestAttempt.number }} result</p>
          <p class="mt-2 text-5xl font-bold" :class="latestAttempt.passed ? 'text-emerald-700' : 'text-amber-700'">{{ latestAttempt.score }}%</p>
          <p class="mt-2 font-semibold" :class="latestAttempt.passed ? 'text-emerald-800' : 'text-amber-800'">{{ latestAttempt.passed ? 'Passed' : 'Not passed' }}</p>
          <p class="mt-1 text-sm text-slate-600">{{ latestAttempt.correct }} of {{ latestAttempt.questions.length }} correct<span v-if="latestAttempt.timedOut"> · Time expired</span></p>
        </div>

        <div v-if="test.attempts.length > 1" class="mt-4 flex flex-wrap gap-2">
          <span v-for="attempt in test.attempts" :key="attempt.number" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Attempt {{ attempt.number }}: {{ attempt.score }}%
          </span>
        </div>

        <h2 class="mb-3 mt-8 text-lg font-semibold text-slate-900">Answer review</h2>
        <article v-for="(question, qi) in latestAttempt.questions" :key="question.id" class="mb-3 rounded-xl border p-5" :class="latestAttempt.answers[qi].correct ? 'border-emerald-200 bg-emerald-50/40' : 'border-red-200 bg-red-50/40'">
          <div class="flex items-start justify-between gap-3">
            <p class="font-medium text-slate-900">{{ qi + 1 }}. {{ question.text }}</p>
            <span class="shrink-0 text-sm font-semibold" :class="latestAttempt.answers[qi].correct ? 'text-emerald-700' : 'text-red-700'">
              {{ latestAttempt.answers[qi].correct ? 'Correct' : 'Incorrect' }}
            </span>
          </div>
          <p class="mt-3 text-sm text-slate-600">Your answer: {{ answerLabel(question, latestAttempt.answers[qi].answer) }}</p>
          <p v-if="!latestAttempt.answers[qi].correct" class="mt-1 text-sm text-slate-700">Correct answer: {{ correctAnswerLabel(question) }}</p>
          <p v-if="question.explanation" class="mt-3 border-t border-slate-200 pt-3 text-sm leading-6 text-slate-600">{{ question.explanation }}</p>
        </article>

        <button v-if="canRetake" type="button" @click="retake" class="mt-3 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700">Retake assessment</button>
        <p v-else class="mt-4 text-sm text-slate-500">You have used all {{ test.maxAttempts }} allowed attempts.</p>
      </section>

      <form v-else @submit.prevent="submit()" class="mt-8 space-y-6">
        <article v-for="(question, qi) in test.questions" :key="question.id" class="rounded-xl border border-slate-200 p-5">
          <p class="mb-4 font-medium text-slate-900">{{ qi + 1 }}. {{ question.text }}</p>
          <img v-if="question.promptImageUrl" :src="question.promptImageUrl" :alt="`Question ${qi + 1} image prompt`" class="mb-4 max-h-72 rounded-lg object-contain" />
          <audio v-if="question.promptAudioUrl" controls :src="question.promptAudioUrl" class="mb-4 w-full">Your browser does not support audio playback.</audio>

          <div v-if="question.type === 'multiple-choice'" class="space-y-2">
            <label v-for="(option, oi) in question.options" :key="oi" class="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50">
              <input v-model="answers[qi]" type="radio" :name="`q-${qi}`" :value="oi" class="h-4 w-4 text-brand-600 focus:ring-brand-500" />
              <span class="text-sm text-slate-700">{{ option }}</span>
            </label>
          </div>
          <div v-else-if="question.type === 'true-false'" class="flex gap-3">
            <label v-for="choice in [true, false]" :key="String(choice)" class="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50">
              <input v-model="answers[qi]" type="radio" :name="`q-${qi}`" :value="choice" class="h-4 w-4 text-brand-600 focus:ring-brand-500" />
              <span class="text-sm text-slate-700">{{ choice ? 'True' : 'False' }}</span>
            </label>
          </div>
          <input v-else-if="question.type === 'fill-blank'" v-model="answers[qi]" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Type your answer" />
          <div v-else class="space-y-3">
            <label v-for="(pair, pi) in question.pairs" :key="pi" class="grid items-center gap-2 text-sm sm:grid-cols-2">
              <span class="font-medium text-slate-700">{{ pair.left }}</span>
              <select v-model="answers[qi][pi]" class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <option value="">Choose a match</option>
                <option v-for="(option, oi) in matchingOptions[qi]" :key="oi" :value="option" :disabled="answers[qi].some((answer, answerIndex) => answer === option && answerIndex !== pi)">{{ option }}</option>
              </select>
            </label>
          </div>
        </article>

        <button type="submit" class="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700">Submit assessment</button>
      </form>
    </div>
  </div>
</template>
