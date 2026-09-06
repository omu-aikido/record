<script setup lang="ts">
type Status = "loading" | "error" | "empty";

interface Props {
  status: Status;
  message?: string;
}

defineProps<Props>();
</script>

<template>
  <div v-if="status === 'loading'" class="loading-container" role="status" aria-live="polite" aria-busy="true">
    <div class="loading-spinner" aria-hidden="true" />
    <p class="text-sub">{{ message ?? "Loading..." }}</p>
  </div>

  <div v-else-if="status === 'error'" class="alert-error" role="alert" aria-live="assertive">
    <slot>{{ message }}</slot>
  </div>

  <div v-else class="text-subtext text-center" role="status" aria-live="polite">
    <slot>{{ message }}</slot>
  </div>
</template>
