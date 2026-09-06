<script setup lang="ts">
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "reka-ui";

type SelectValueType = string | number;

interface Option {
  label: string;
  value: SelectValueType;
}

interface Props {
  modelValue?: SelectValueType | null;
  options: Option[];
  placeholder?: string;
}

defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: SelectValueType];
}>();
</script>

<template>
  <SelectRoot
    :model-value="modelValue ?? undefined"
    @update:model-value="emit('update:modelValue', $event as SelectValueType)">
    <SelectTrigger
      class="rounded-md bg-surface0 border-overlay0 px-3 py-2 pr-10 text text focus:ring-blue-500 relative w-full cursor-default border text-left focus:ring-2 focus:outline-none">
      <SelectValue :placeholder="placeholder" />
      <SelectIcon class="inset-y-0 right-0 pr-2 pointer-events-none absolute flex items-center">
        <span class="i-lucide:chevrons-up-down w-4 h-4 text-subtext" aria-hidden="true" />
      </SelectIcon>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        position="popper"
        :side-offset="4"
        class="max-h-60 rounded-md bg-surface0 p-1 shadow-md border-overlay0 z-60 overflow-hidden border"
        :style="{ width: 'var(--reka-select-trigger-width)' }">
        <SelectViewport>
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="py-2 px-4 pr-10 text data-[highlighted]:bg-overlay data-[state=checked]:text-blue-500 relative flex cursor-default items-center select-none outline-none">
            <SelectItemText>{{ option.label }}</SelectItemText>
            <SelectItemIndicator class="right-0 pr-4 absolute">
              <span class="i-lucide:check h-4 w-4 text-blue-500" aria-hidden="true" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
