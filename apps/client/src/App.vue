<script setup lang="ts">
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import AppFooter from "./components/pages/AppFooter.vue";
import AppHeader from "./components/pages/AppHeader.vue";
import ErrorBoundary from "./components/common/ErrorBoundary.vue";

const isDev = import.meta.env.DEV;
</script>

<template>
  <ErrorBoundary>
    <AppHeader />
    <main class="max-w-7xl px-2 md:px-4 md:py-8 mx-auto min-h-[calc(100dvh-150px)] w-full flex-grow">
      <RouterView />
    </main>
    <AppFooter />
    <VueQueryDevtools v-if="isDev" />
  </ErrorBoundary>
</template>
