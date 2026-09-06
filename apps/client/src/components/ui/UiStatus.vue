<script setup lang="ts">
import { useAttrs } from "vue";

type Status = "loading" | "error" | "empty";

interface Props {
  status: Status;
  message?: string;
}

defineOptions({ inheritAttrs: false });

defineProps<Props>();
const attrs = useAttrs();
</script>

<template>
  <div
    v-if="status === 'loading'"
    v-bind="attrs"
    class="loading-container"
    role="status"
    aria-live="polite"
    aria-busy="true">
    <div class="loading-spinner" aria-hidden="true" />
    <p class="text-sub">{{ message ?? "Loading..." }}</p>
  </div>

  <div v-else-if="status === 'error'" v-bind="attrs" class="alert-error" role="alert" aria-live="assertive">
    <slot>{{ message }}</slot>
  </div>

  <div v-else v-bind="attrs" class="text-subtext text-center" role="status" aria-live="polite">
    <slot>{{ message }}</slot>
  </div>
</template>
