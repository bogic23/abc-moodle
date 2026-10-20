<script setup>
import AppNavbar from './components/AppNavbar.vue'
</script>

<template>
  <div class="app-shell min-h-screen">
    <AppNavbar />
    <main class="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>