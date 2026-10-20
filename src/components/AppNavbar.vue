<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const logoutError = ref('')
const homePath = computed(() => auth.role === 'admin' ? '/admin/users' : auth.role === 'teacher' ? '/teacher' : '/student')

async function logout() {
  logoutError.value = ''
  try {
    await auth.logout()
    await router.replace({ name: 'login' })
  } catch (error) {
    logoutError.value = error.message
  }
}
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-white/70 bg-white/75 backdrop-blur-xl">
    <div class="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
      <RouterLink
        :to="homePath"
        class="group flex min-w-0 items-center gap-3 rounded-lg"
        aria-label="ABC Scores home"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/25 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
          <span class="text-sm font-bold text-white">A</span>
        </div>
        <span class="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">ABC Scores</span>
      </RouterLink>

      <div class="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <RouterLink v-if="auth.role === 'admin'" to="/admin/users" class="rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
          User management
        </RouterLink>
        <div class="hidden min-w-0 text-right sm:block">
          <p class="text-sm font-medium text-slate-900">{{ auth.userName }}</p>
          <p class="text-xs capitalize text-slate-500">{{ auth.role }} workspace</p>
        </div>
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-sm font-bold text-brand-700 ring-2 ring-white shadow-sm sm:h-10 sm:w-10">
          {{ auth.userName.charAt(0).toUpperCase() }}
        </div>
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:px-3.5 sm:text-sm"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </div>
    <p v-if="logoutError" role="alert" class="mx-auto max-w-7xl px-4 pb-2 text-right text-xs text-red-700 sm:px-6 lg:px-8">
      {{ logoutError }}
    </p>
  </nav>
</template>