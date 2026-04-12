<template>
  <div class="h-50dvh w-full flex flex-col items-center justify-center">
    <div class="i-lucide:loader-circle animate-spin text-2xl" aria-hidden />
  </div>
  <p class="text-sub text-center">
    画面が切り替わらない場合は
    <RouterLink :to="redirectUrl" class="text-blue-500 hover:text-blue-600 underline underline-offset-4">
      こちら
    </RouterLink>
  </p>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

const props = defineProps({
  redirectUrl: {
    type: String,
    default: '/',
  },
});
</script>
