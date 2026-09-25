<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>

<template>
  <div class="p-4 flex w-full justify-center">
    <div v-bind="$attrs" class="flex flex-col gap-6">
      <header class="gap-2 flex flex-col">
        <slot name="heading" />
        <slot name="context" />
      </header>

      <div class="gap-4 flex flex-col">
        <slot />
      </div>

      <div v-if="$slots.alternative">
        <slot name="alternative" />
      </div>

      <footer v-if="$slots.continuation" class="gap-4 flex flex-col">
        <hr class="m-0" />
        <slot name="continuation" />
      </footer>
    </div>
  </div>
</template>
