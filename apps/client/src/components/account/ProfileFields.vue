<script setup lang="ts">
import { grade as gradeOptions, year as yearOptions } from "share";

import { computed } from "vue";
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
  order?: "profile" | "admin";
  joinedAtLabel?: string;
  joinedAtMin?: number;
  joinedAtMax?: number;
  getGradeAtLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  order: "admin",
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
type FieldName = "grade" | "year" | "joinedAt" | "getGradeAt" | "birthday";

const fieldComponents = {
  grade: UiSelect,
  year: UiSelect,
  joinedAt: Input,
  getGradeAt: Input,
  birthday: Input,
};

const fieldOrders: Record<"profile" | "admin", readonly FieldName[]> = {
  profile: ["grade", "getGradeAt", "birthday", "joinedAt", "year"],
  admin: ["grade", "year", "joinedAt", "getGradeAt", "birthday"],
};

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

const fieldOrder = computed(() => fieldOrders[props.order]);
const fieldProps = computed(() => ({
  grade: {
    id: "grade",
    modelValue: props.grade,
    label: "級段位",
    options: gradeSelectOptions,
    disabled: props.disabled,
    required: props.required,
    "onUpdate:modelValue": updateGrade,
  },
  year: {
    id: "year",
    modelValue: props.year,
    label: "学年",
    options: yearSelectOptions,
    disabled: props.disabled,
    required: props.required,
    "onUpdate:modelValue": updateYear,
  },
  joinedAt: {
    id: "joinedAt",
    modelValue: props.joinedAt,
    type: "number",
    label: props.joinedAtLabel,
    min: props.joinedAtMin,
    max: props.joinedAtMax,
    disabled: props.disabled,
    required: props.required,
    "onUpdate:modelValue": updateJoinedAt,
  },
  getGradeAt: {
    id: "getGradeAt",
    modelValue: props.getGradeAt,
    type: "date",
    label: props.getGradeAtLabel,
    disabled: props.disabled,
    "onUpdate:modelValue": updateGetGradeAt,
  },
  birthday: {
    id: "birthday",
    modelValue: props.birthday,
    type: "date",
    label: "誕生日",
    disabled: props.disabled,
    required: props.required,
    "onUpdate:modelValue": updateBirthday,
  },
}));
</script>

<template>
  <component v-for="field in fieldOrder" :key="field" :is="fieldComponents[field]" v-bind="fieldProps[field]" />
</template>
