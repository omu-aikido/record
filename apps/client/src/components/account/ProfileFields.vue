<script setup lang="ts">
import { grade as gradeOptions, year as yearOptions } from "share";

import Input from "@/components/ui/UiInput.vue";
import UiSelect from "@/components/ui/UiSelect.vue";

interface Props {
  grade: number | null;
  year: string;
  joinedAt: number | null;
  getGradeAt: string;
  birthday: string;
  disabled?: boolean;
  required?: boolean;
  joinedAtLabel?: string;
  joinedAtMin?: number;
  joinedAtMax?: number;
  getGradeAtLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  joinedAtLabel: "入部年",
  joinedAtMin: 2020,
  joinedAtMax: 9999,
  getGradeAtLabel: "取得日",
});

const emit = defineEmits<{
  "update:grade": [value: number | null];
  "update:year": [value: string];
  "update:joinedAt": [value: number | null];
  "update:getGradeAt": [value: string];
  "update:birthday": [value: string];
}>();

const gradeSelectOptions = gradeOptions.map((option) => ({ label: option.name, value: option.grade }));
const yearSelectOptions = yearOptions.map((option) => ({ label: option.name, value: option.year }));

type InputValue = string | number | null;

const updateGrade = (value: string | number) => {
  emit("update:grade", Number(value));
};

const updateYear = (value: string | number) => {
  emit("update:year", String(value));
};

const updateJoinedAt = (value: InputValue) => {
  emit("update:joinedAt", value === null || value === "" ? null : Number(value));
};

const updateGetGradeAt = (value: InputValue) => {
  emit("update:getGradeAt", value === null ? "" : String(value));
};

const updateBirthday = (value: InputValue) => {
  emit("update:birthday", value === null ? "" : String(value));
};
</script>

<template>
  <UiSelect
    id="grade"
    :model-value="props.grade"
    label="級段位"
    :options="gradeSelectOptions"
    :disabled="props.disabled"
    :required="props.required"
    @update:model-value="updateGrade" />

  <UiSelect
    id="year"
    :model-value="props.year"
    label="学年"
    :options="yearSelectOptions"
    :disabled="props.disabled"
    :required="props.required"
    @update:model-value="updateYear" />

  <Input
    id="joinedAt"
    :model-value="props.joinedAt"
    type="number"
    :label="props.joinedAtLabel"
    :min="props.joinedAtMin"
    :max="props.joinedAtMax"
    :disabled="props.disabled"
    @update:model-value="updateJoinedAt" />

  <Input
    id="getGradeAt"
    :model-value="props.getGradeAt"
    type="date"
    :label="props.getGradeAtLabel"
    :disabled="props.disabled"
    @update:model-value="updateGetGradeAt" />

  <Input
    id="birthday"
    :model-value="props.birthday"
    type="date"
    label="誕生日"
    :disabled="props.disabled"
    @update:model-value="updateBirthday" />
</template>
