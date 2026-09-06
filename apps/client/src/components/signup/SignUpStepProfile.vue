<template>
  <div class="stack">
    <div class="gap-4 grid grid-cols-2">
      <UiSelect
        id="year"
        name="year"
        label="学年"
        :model-value="formValues.year"
        :options="yearSelectOptions"
        :disabled="isSignUpCreated"
        :error="formErrors.year"
        required
        @update:model-value="onUpdate('year', $event)" />
      <UiSelect
        id="grade"
        name="grade"
        label="級段位"
        :model-value="formValues.grade"
        :options="gradeSelectOptions"
        :disabled="isSignUpCreated"
        :error="formErrors.grade"
        required
        @update:model-value="onUpdate('grade', Number($event))" />
    </div>

    <Input
      id="joinedAt"
      :model-value="formValues.joinedAt"
      type="number"
      label="入部年度"
      required
      :disabled="isSignUpCreated"
      :error="formErrors.joinedAt"
      @update:model-value="onUpdate('joinedAt', toNumberOrNull($event))" />

    <Input
      id="getGradeAt"
      :model-value="formValues.getGradeAt"
      type="date"
      label="取得年月日 (任意)"
      :disabled="isSignUpCreated"
      :error="formErrors.getGradeAt"
      @update:model-value="onUpdate('getGradeAt', $event ?? null)" />

    <Input
      id="birthday"
      :model-value="formValues.birthday"
      type="date"
      label="誕生日"
      required
      :disabled="isSignUpCreated"
      :error="formErrors.birthday"
      @update:model-value="onUpdate('birthday', $event ?? '')" />

    <div class="gap-2 flex items-center">
      <input
        id="legalAccepted"
        type="checkbox"
        :checked="formValues.legalAccepted"
        :disabled="isSignUpCreated"
        class="w-4 h-4 rounded-sm border-overlay1 accent-blue-500 border"
        @change="onUpdate('legalAccepted', ($event.target as HTMLInputElement).checked)" />
      <label for="legalAccepted" class="text-sub"> 利用規約とプライバシーポリシーに同意します。 </label>
    </div>
    <p v-if="formErrors.legalAccepted" class="text-sm text-red-500">
      {{ formErrors.legalAccepted }}
    </p>

    <div id="clerk-captcha" />

    <div class="pt-2 flex justify-between">
      <button type="button" class="btn-secondary" :disabled="isSignUpCreated" @click="prevStep">戻る</button>
      <button type="submit" class="btn-primary" :disabled="!canSubmit">
        {{ isSignUpCreated ? "登録中..." : "登録" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { grade as gradeOptions, year as yearOptions } from "share";

import Input from "@/components/ui/UiInput.vue";
import UiSelect from "@/components/ui/UiSelect.vue";
import type { FormErrors, SignUpFormData } from "@/composable/useSignUpForm";

defineProps<{
  formValues: Partial<SignUpFormData>;
  formErrors: Partial<FormErrors>;
  isSignUpCreated: boolean;
  canSubmit: boolean;
  prevStep: () => void;
}>();

const emit = defineEmits<{
  (e: "update:formValue", key: keyof SignUpFormData, value: string | number | boolean | null): void;
}>();

const onUpdate = (key: keyof SignUpFormData, value: string | number | boolean | null) => {
  emit("update:formValue", key, value);
};
const toNumberOrNull = (value: string | number | null) => (value === null || value === "" ? null : Number(value));
const yearSelectOptions = yearOptions.map((option) => ({ label: option.name, value: option.year }));
const gradeSelectOptions = gradeOptions.map((option) => ({ label: option.name, value: option.grade }));
</script>
