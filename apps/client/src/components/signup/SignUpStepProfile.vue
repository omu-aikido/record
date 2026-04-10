<template>
  <div class="stack">
    <div class="gap-4 grid grid-cols-2">
      <div class="gap-2 flex flex-col">
        <label for="year" class="text-base font-medium text-subtext">学年</label>
        <select
          id="year"
          :value="formValues.year"
          :disabled="isSignUpCreated"
          class="rounded-md border-overlay1 bg-base px-3 py-2 text-base text focus:ring-blue-500 h-fit w-full border transition-shadow duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
          @change="onUpdate('year', ($event.target as HTMLSelectElement).value)">
          <option v-for="y in yearOptions" :key="y.year" :value="y.year">
            {{ y.name }}
          </option>
        </select>
        <p v-if="formErrors.year" class="text-sm text-red-500">
          {{ formErrors.year }}
        </p>
      </div>
      <div class="gap-2 flex flex-col">
        <label for="grade" class="text-base font-medium text-subtext">級段位</label>
        <select
          id="grade"
          :value="formValues.grade"
          :disabled="isSignUpCreated"
          class="rounded-md border-overlay1 bg-base px-3 py-2 text-base text focus:ring-blue-500 h-fit w-full border transition-shadow duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
          @change="onUpdate('grade', Number(($event.target as HTMLSelectElement).value))">
          <option v-for="g in gradeOptions" :key="g.grade" :value="g.grade">
            {{ g.name }}
          </option>
        </select>
        <p v-if="formErrors.grade" class="text-sm text-red-500">
          {{ formErrors.grade }}
        </p>
      </div>
    </div>

    <Input
      id="joinedAt"
      :model-value="formValues.joinedAt"
      type="number"
      label="入部年度"
      :disabled="isSignUpCreated"
      :error="formErrors.joinedAt"
      @update:model-value="onUpdate('joinedAt', Number($event))" />

    <Input
      id="getGradeAt"
      :model-value="formValues.getGradeAt"
      type="date"
      label="取得年月日 (任意)"
      :disabled="isSignUpCreated"
      :error="formErrors.getGradeAt"
      @update:model-value="onUpdate('getGradeAt', $event)" />

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
        {{ isSignUpCreated ? '登録中...' : '登録' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { grade as gradeOptions, year as yearOptions } from 'share';

import Input from '@/components/ui/UiInput.vue';
import type { FormErrors, SignUpFormData } from '@/composable/useSignUpForm';

defineProps<{
  formValues: Partial<SignUpFormData>;
  formErrors: Partial<FormErrors>;
  isSignUpCreated: boolean;
  canSubmit: boolean;
  prevStep: () => void;
}>();

const emit = defineEmits<{
  (e: 'update:formValue', key: keyof SignUpFormData, value: string | number | boolean): void;
}>();

const onUpdate = (key: keyof SignUpFormData, value: string | number | boolean) => {
  emit('update:formValue', key, value);
};
</script>
