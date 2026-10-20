<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../stores/course'

const route = useRoute()
const router = useRouter()
const store = useCourseStore()

const isEdit = computed(() => !!route.params.id)
const makeQuestion = () => ({
  type: 'multiple-choice',
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  correctAnswer: '',
  pairs: [{ left: '', right: '' }],
  explanation: '',
  promptImageUrl: '',
  promptAudioUrl: '',
})
const form = ref({
  sectionId: store.sections[0]?.id ?? null,
  title: '',
  description: '',
  duration: '10 min',
  timeLimit: 10,
  passScore: 70,
  maxAttempts: 3,
  questions: [makeQuestion()],
})
const formError = ref('')

onMounted(() => {
  if (!isEdit.value) return
  const test = store.tests.find(item => String(item.id) === String(route.params.id))
  if (!test) return
  const copy = JSON.parse(JSON.stringify(test))
  form.value = {
    ...copy,
    timeLimit: copy.timeLimit ?? Number.parseInt(copy.duration, 10) ?? 10,
    passScore: copy.passScore ?? 70,
    maxAttempts: copy.maxAttempts ?? 3,
    questions: copy.questions.map(question => ({ ...makeQuestion(), ...question })),
  }
})

function addQuestion() {
  form.value.questions.push(makeQuestion())
}

function removeQuestion(index) {
  if (form.value.questions.length > 1) form.value.questions.splice(index, 1)
}

function addPair(question) {
  question.pairs.push({ left: '', right: '' })
}

function removePair(question, index) {
  if (question.pairs.length > 1) question.pairs.splice(index, 1)
}

async function save() {
  if (!form.value.title.trim() || !form.value.questions.length) {
    formError.value = 'Enter an assessment title and add at least one question.'
    return
  }
  formError.value = ''
  const payload = {
    sectionId: form.value.sectionId ? String(form.value.sectionId) : null,
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    duration: `${form.value.timeLimit} min`,
    timeLimit: Number(form.value.timeLimit),
    passScore: Number(form.value.passScore),
    maxAttempts: Number(form.value.maxAttempts),
    questions: form.value.questions.map((question, index) => ({
      ...question,
      id: index + 1,
      options: question.type === 'multiple-choice' ? question.options : [],
      pairs: question.type === 'matching' ? question.pairs : [],
    })),
  }
  if (isEdit.value) store.updateTest(route.params.id, payload)
  else store.addTest(payload)
  if (!await store.flushPersistence()) return
  router.push('/teacher')
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <h1 class="mb-2 text-2xl font-bold tracking-tight text-slate-900">{{ isEdit ? 'Edit assessment' : 'Create assessment' }}</h1>
    <p class="mb-6 text-sm text-slate-500">Choose question formats, set assessment rules, and add answer explanations.</p>

    <form @submit.prevent="save" class="space-y-6">
      <p v-if="formError" role="alert" class="text-sm text-red-700">{{ formError }}</p>
      <div class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Assessment title</label>
          <input v-model="form.title" required type="text" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
          <input v-model="form.description" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Section / module</label>
          <select v-model="form.sectionId" class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
            <option :value="null">Course-wide assessment</option>
            <option v-for="section in store.sections" :key="section.id" :value="section.id">{{ section.title }}</option>
          </select>
        </div>
        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Time limit (minutes)</label>
            <input v-model.number="form.timeLimit" required type="number" min="1" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Passing score (%)</label>
            <input v-model.number="form.passScore" required type="number" min="0" max="100" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Allowed attempts</label>
            <input v-model.number="form.maxAttempts" required type="number" min="1" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
        </div>
      </div>

      <article v-for="(question, qi) in form.questions" :key="qi" class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-900">Question {{ qi + 1 }}</h2>
          <button v-if="form.questions.length > 1" type="button" @click="removeQuestion(qi)" class="text-sm text-red-600 hover:text-red-700">Remove</button>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Question type</label>
          <select v-model="question.type" class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
            <option value="multiple-choice">Multiple choice</option>
            <option value="true-false">True or false</option>
            <option value="fill-blank">Fill in the blank</option>
            <option value="matching">Matching</option>
          </select>
        </div>
        <input v-model="question.text" required type="text" placeholder="Question text" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />

        <div v-if="question.type === 'multiple-choice'" class="space-y-2">
          <div v-for="(option, oi) in question.options" :key="oi" class="flex items-center gap-3">
            <input v-model.number="question.correctIndex" type="radio" :name="`correct-${qi}`" :value="oi" class="h-4 w-4 text-brand-600 focus:ring-brand-500" />
            <input v-model="question.options[oi]" required type="text" :placeholder="`Option ${oi + 1}`" class="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
          <p class="text-xs text-slate-400">Select the radio button beside the correct answer.</p>
        </div>

        <div v-else-if="question.type === 'true-false'">
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Correct answer</label>
          <select v-model="question.correctAnswer" required class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
            <option value="" disabled>Select the correct answer</option>
            <option :value="true">True</option><option :value="false">False</option>
          </select>
        </div>

        <div v-else-if="question.type === 'fill-blank'">
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Accepted answer</label>
          <input v-model="question.correctAnswer" required type="text" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Answer (case-insensitive)" />
        </div>

        <div v-else class="space-y-3">
          <p class="text-sm text-slate-600">Add a left-side prompt and its matching right-side answer.</p>
          <div v-for="(pair, pi) in question.pairs" :key="pi" class="flex flex-col gap-2 sm:flex-row">
            <input v-model="pair.left" required type="text" placeholder="Prompt" class="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            <input v-model="pair.right" required type="text" placeholder="Matching answer" class="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            <button v-if="question.pairs.length > 1" type="button" @click="removePair(question, pi)" class="px-2 text-sm text-red-600">Remove</button>
          </div>
          <button type="button" @click="addPair(question)" class="text-sm font-medium text-brand-700">+ Add matching pair</button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Image prompt URL (optional)</label>
            <input v-model="question.promptImageUrl" type="url" class="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Audio prompt URL (optional)</label>
            <input v-model="question.promptAudioUrl" type="url" class="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Answer explanation</label>
          <textarea v-model="question.explanation" rows="2" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Shown during result review"></textarea>
        </div>
      </article>

      <button type="button" @click="addQuestion" class="rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-600">+ Add question</button>

      <div class="flex gap-3">
        <button type="submit" class="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700">{{ isEdit ? 'Update assessment' : 'Create assessment' }}</button>
        <RouterLink to="/teacher" class="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</RouterLink>
      </div>
    </form>
  </div>
</template>
