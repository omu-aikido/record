<script setup lang="ts">
import AppFooter from './components/pages/AppFooter.vue';
import AppHeader from './components/pages/AppHeader.vue';
import ErrorBoundary from './components/common/ErrorBoundary.vue';
</script>

<template>
  <ErrorBoundary>
    <AppHeader />
    <main class="max-w-7xl md:px-4 md:py-8 mx-auto min-h-[calc(100dvh-150px)] w-full flex-grow">
      <RouterView />
    </main>
    <AppFooter />
  </ErrorBoundary>
</template>
