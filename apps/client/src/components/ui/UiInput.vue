<script setup lang="ts">
import { computed, useAttrs, useId } from "vue";

interface Props {
  modelValue?: string | number | null | undefined;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  id?: string;
  error?: string | undefined;
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  type: "text",
  placeholder: "",
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void;
}>();

const attrs = useAttrs();
const generatedId = useId();
const inputId = computed(() => props.id || generatedId);
const errorId = computed(() => `${inputId.value}-error`);
const describedBy = computed(() => {
  const ids = typeof attrs["aria-describedby"] === "string" ? attrs["aria-describedby"].split(/\s+/u) : [];
  if (props.error) ids.push(errorId.value);
  return ids.filter(Boolean).join(" ") || undefined;
});

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  if (props.type === "number") {
    emit("update:modelValue", value === "" ? null : Number(value));
    return;
  }
  emit("update:modelValue", value);
};

defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <div class="gap-1.5 flex w-full flex-col">
    <label v-if="props.label" :for="inputId" class="form-label">
      {{ props.label }}
      <span v-if="props.required" class="text-red-500 ml-0.5">*</span>
    </label>

    <div class="relative flex items-center">
      <input
        v-bind="$attrs"
        :id="inputId"
        :type="props.type"
        :value="props.modelValue"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :required="props.required"
        :aria-invalid="props.error ? 'true' : undefined"
        :aria-describedby="describedBy"
        :class="['input-base', props.error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : '']"
        uno-placeholder="text-overlay1"
        @input="handleInput" />
      <div v-if="$slots.suffix" class="right-3 text-subtext pointer-events-none absolute flex items-center">
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="props.error" :id="errorId" class="text-sm text-red-500" role="alert">{{ props.error }}</p>
  </div>
</template>
