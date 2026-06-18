<template>
  <div class="gap-3 flex flex-col">
    <div class="flex items-center justify-between">
      <div class="gap-2 flex items-center">
        <span class="text-sm font-medium text">進捗</span>
      </div>
      <span class="text-sub">{{ norm.progress }}%</span>
    </div>
    <div class="h-2 bg-overlay1 w-full overflow-hidden rounded-full">
      <div
        class="bg-blue-500 h-full rounded-full transition-[width] duration-300"
        :style="{ width: `${norm.progress}%` }" />
    </div>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div class="rounded-md bg-overlay0 px-3 py-2">
        <div class="text-sub">稽古回数</div>
        <div class="font-medium text">{{ norm.current }} 回</div>
      </div>
      <div class="rounded-md bg-overlay0 px-3 py-2">
        <div class="text-sub">必要回数</div>
        <div class="font-medium text">{{ norm.required }} 回</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminNormSummaryType } from 'share';

defineProps<{ norm: AdminNormSummaryType }>();
</script>
