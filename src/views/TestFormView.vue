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
  duration: '10 min',
  questions: [
    { text: '', options: ['', '', '', ''], correctIndex: 0 },
  ],
})

onMounted(() => {
  if (isEdit.value) {
    const test = store.tests.find(t => t.id === Number(route.params.id))
    if (test) form.value = JSON.parse(JSON.stringify(test))
  }
})

function addQuestion() {
  form.value.questions.push({ text: '', options: ['', '', '', ''], correctIndex: 0 })
}

function removeQuestion(index) {
  if (form.value.questions.length > 1) form.value.questions.splice(index, 1)
}

function save() {
  if (!form.value.title.trim()) return
  const payload = {
    title: form.value.title,
    description: form.value.description,
    duration: form.value.duration,
    questions: form.value.questions.map((q, i) => ({ ...q, id: i + 1 })),
  }
  if (isEdit.value) {
    store.updateTest(Number(route.params.id), payload)
  } else {
    store.addTest(payload)
  }
  router.push('/teacher')
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <h1 class="mb-6 text-2xl font-bold tracking-tight text-slate-900">
      {{ isEdit ? 'Edit Test' : 'Create Test' }}
    </h1>

    <form @submit.prevent="save" class="space-y-6">
      <div class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Test Title</label>
          <input v-model="form.title" type="text" required class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
          <input v-model="form.description" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Duration</label>
          <input v-model="form.duration" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        </div>
      </div>

      <div v-for="(q, qi) in form.questions" :key="qi" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-900">Question {{ qi + 1 }}</h3>
          <button type="button" @click="removeQuestion(qi)" class="text-sm text-red-500 hover:text-red-700" v-if="form.questions.length > 1">Remove</button>
        </div>
        <input v-model="q.text" type="text" placeholder="Question text" class="mb-3 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
        <div class="space-y-2">
          <div v-for="(opt, oi) in q.options" :key="oi" class="flex items-center gap-3">
            <input type="radio" :name="`correct-${qi}`" :value="oi" v-model="q.correctIndex" class="h-4 w-4 text-brand-600 focus:ring-brand-500" />
            <input v-model="q.options[oi]" type="text" :placeholder="`Option ${oi + 1}`" class="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
        </div>
        <p class="mt-2 text-xs text-slate-400">Select the radio button next to the correct answer.</p>
      </div>

      <button type="button" @click="addQuestion" class="rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-600">
        + Add Question
      </button>

      <div class="flex gap-3">
        <button type="submit" class="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand-500/25 transition-colors hover:bg-brand-700">
          {{ isEdit ? 'Update Test' : 'Create Test' }}
        </button>
        <RouterLink to="/teacher" class="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">Cancel</RouterLink>
      </div>
    </form>
  </div>
</template>