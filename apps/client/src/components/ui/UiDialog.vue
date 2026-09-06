<script setup lang="ts">
import { DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from "reka-ui";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  contentClass?: string;
  testId?: string;
}

defineProps<Props>();
const emit = defineEmits<{
  "update:open": [open: boolean];
}>();
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="inset-0 bg-black/50 fixed z-50 backdrop-blur-[4px]" />
      <DialogContent
        :data-testid="testId"
        :class="['top-1/2 left-1/2 fixed z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2', contentClass]">
        <DialogTitle as-child>
          <slot name="title">
            <h2 class="text-lg font-bold text">{{ title }}</h2>
          </slot>
        </DialogTitle>
        <DialogDescription v-if="description" as-child>
          <slot name="description">
            <p class="mt-2 text-sub">{{ description }}</p>
          </slot>
        </DialogDescription>
        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
