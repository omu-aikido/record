<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";
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
  label?: string;
  id?: string;
  name?: string;
  error?: string | undefined;
  disabled?: boolean;
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: "",
  disabled: false,
  required: false,
});
const emit = defineEmits<{
  "update:modelValue": [value: SelectValueType];
}>();

const attrs = useAttrs();
const generatedId = useId();
const selectId = computed(() => props.id || generatedId);
const errorId = computed(() => `${selectId.value}-error`);
const describedBy = computed(() => {
  const ids = typeof attrs["aria-describedby"] === "string" ? attrs["aria-describedby"].split(/\s+/u) : [];
  if (props.error) ids.push(errorId.value);
  return ids.filter(Boolean).join(" ") || undefined;
});

defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <div class="gap-1.5 flex w-full flex-col">
    <label v-if="props.label" :for="selectId" class="form-label">
      {{ props.label }}
      <span v-if="props.required" class="text-red-500 ml-0.5">*</span>
    </label>

    <SelectRoot
      :model-value="props.modelValue ?? undefined"
      :name="props.name"
      :required="props.required"
      :disabled="props.disabled"
      @update:model-value="emit('update:modelValue', $event as SelectValueType)">
      <SelectTrigger
        v-bind="$attrs"
        :id="selectId"
        :aria-invalid="props.error ? 'true' : undefined"
        :aria-describedby="describedBy"
        :class="[
          'rounded-md bg-surface0 border-overlay0 px-3 py-2 pr-10 text text focus:ring-blue-500 relative w-full cursor-default border text-left focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-overlay1',
          props.error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : '',
        ]">
        <SelectValue :placeholder="props.placeholder" />
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
              v-for="option in props.options"
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

    <p v-if="props.error" :id="errorId" class="text-sm text-red-500" role="alert">{{ props.error }}</p>
  </div>
</template>
