<script setup lang="ts">
withDefaults(defineProps<{ variant?: "full" | "compact" }>(), {
  variant: "full",
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-4">
      <slot name="fields" />
    </div>
    <div v-if="$slots.feedback" class="flex flex-col gap-4">
      <slot name="feedback" />
    </div>
    <div
      v-if="$slots.secondary || $slots.primary"
      :class="[
        'flex flex-wrap gap-3 pt-2',
        variant === 'full' ? '[&>*]:min-w-0 [&>*]:flex-1 [&>*]:basis-32' : 'justify-end',
      ]">
      <slot name="secondary" />
      <slot name="primary" />
    </div>
  </div>
</template>
