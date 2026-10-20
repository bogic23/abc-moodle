<script setup>
import { computed, onMounted } from 'vue'
import { useAdminStore } from '../stores/admin'

const store = useAdminStore()
const pendingTeachers = computed(() => store.users.filter(user =>
  user.role === 'teacher' && (user.teacherApproval || 'pending') === 'pending',
).length)

onMounted(() => {
  store.loadUsers().catch(error => {
    store.error = error.message
  })
})

async function updateApproval(user, status) {
  try {
    await store.setTeacherApproval(user.uid, status)
  } catch (error) {
    store.error = error.message
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Administration</p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">User management</h1>
        <p class="mt-1 text-sm text-slate-500">Review teacher requests and control who can create courses.</p>
      </div>
      <div class="surface-card px-5 py-3">
        <p class="text-xs font-medium text-slate-500">Pending teacher requests</p>
        <p class="mt-1 text-2xl font-bold text-amber-700">{{ pendingTeachers }}</p>
      </div>
    </header>

    <p v-if="store.error" role="alert" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ store.error }}</p>

    <section class="surface-card overflow-hidden">
      <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 class="font-semibold text-slate-900">Registered accounts</h2>
          <p class="mt-0.5 text-sm text-slate-500">Student access is immediate. Teacher course creation requires approval.</p>
        </div>
        <button type="button" :disabled="store.loading" @click="store.loadUsers().catch(error => { store.error = error.message })" class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          {{ store.loading ? 'Loading…' : 'Refresh' }}
        </button>
      </div>

      <div v-if="store.loading && !store.users.length" role="status" class="p-8 text-center text-sm text-slate-500">Loading users…</div>
      <div v-else-if="!store.users.length" class="p-8 text-center text-sm text-slate-500">No user profiles found.</div>
      <div v-else class="divide-y divide-slate-100">
        <article v-for="user in store.users" :key="user.uid" class="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-semibold text-slate-900">{{ user.displayName || 'Unnamed account' }}</h3>
              <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">{{ user.role }}</span>
              <span v-if="user.role === 'teacher'" class="rounded-full px-2.5 py-1 text-xs font-semibold capitalize" :class="{
                'bg-amber-100 text-amber-800': (user.teacherApproval || 'pending') === 'pending',
                'bg-emerald-100 text-emerald-800': user.teacherApproval === 'approved',
                'bg-red-100 text-red-800': user.teacherApproval === 'rejected',
              }">{{ user.teacherApproval || 'pending' }}</span>
            </div>
            <p class="mt-1 truncate text-sm text-slate-500">{{ user.email }}</p>
            <p class="mt-1 text-xs text-slate-400">Account ID: {{ user.uid }}</p>
          </div>

          <div v-if="user.role === 'teacher'" class="flex shrink-0 flex-wrap gap-2">
            <button
              v-if="user.teacherApproval !== 'approved'"
              type="button"
              :disabled="store.savingUserId === user.uid"
              @click="updateApproval(user, 'approved')"
              class="rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >Approve</button>
            <button
              v-if="user.teacherApproval !== 'rejected'"
              type="button"
              :disabled="store.savingUserId === user.uid"
              @click="updateApproval(user, 'rejected')"
              class="rounded-lg border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >Reject</button>
            <button
              v-if="user.teacherApproval && user.teacherApproval !== 'pending'"
              type="button"
              :disabled="store.savingUserId === user.uid"
              @click="updateApproval(user, 'pending')"
              class="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >Reset to pending</button>
          </div>
        </article>
      </div>
    </section>

    <p class="mt-4 text-xs leading-5 text-slate-500">This page manages teacher approval only; it does not delete Firebase Authentication accounts or change account roles.</p>
  </div>
</template>
