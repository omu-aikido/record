<script setup lang="ts">
import { computed, ref } from "vue";

import UiInput from "./UiInput.vue";

interface Props {
  modelValue?: string | number | null | undefined;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  id?: string;
  error?: string | undefined;
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "",
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void;
}>();

const isPasswordVisible = ref(false);
const inputType = computed(() => (isPasswordVisible.value ? "text" : "password"));
const toggleLabel = computed(() => (isPasswordVisible.value ? "パスワードを隠す" : "パスワードを表示"));

defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <UiInput
    v-bind="$attrs"
    :id="props.id"
    :label="props.label"
    :error="props.error"
    :required="props.required"
    :disabled="props.disabled"
    :model-value="props.modelValue"
    :placeholder="props.placeholder"
    :type="inputType"
    @update:model-value="emit('update:modelValue', $event)">
    <template #suffix>
      <button
        type="button"
        :disabled="props.disabled"
        :aria-label="toggleLabel"
        :aria-pressed="isPasswordVisible"
        class="text-subtext p-0 hover:text pointer-events-auto flex cursor-pointer items-center justify-center border-none bg-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        @click="isPasswordVisible = !isPasswordVisible">
        <span v-if="!isPasswordVisible" class="i-lucide:eye sq-5" aria-hidden="true" />
        <span v-else class="i-lucide:eye-off sq-5" aria-hidden="true" />
      </button>
    </template>
  </UiInput>
</template>
