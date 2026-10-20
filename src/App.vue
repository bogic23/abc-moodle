<script setup>
import AppNavbar from './components/AppNavbar.vue'
import { useAuthStore } from './stores/auth'
import { useCourseStore } from './stores/course'

const auth = useAuthStore()
const courseStore = useCourseStore()
</script>

<template>
  <div class="app-shell min-h-screen">
    <AppNavbar v-if="auth.currentUser && auth.profile" />
    <main class="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <div v-if="courseStore.persistenceError" role="alert" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Course data could not be synchronized with Firestore: {{ courseStore.persistenceError }}
      </div>
      <p v-else-if="courseStore.persistenceLoading" role="status" class="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        Loading course data…
      </p>
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>