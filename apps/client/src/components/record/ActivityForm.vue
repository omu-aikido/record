<script setup lang="ts">
import { createActivitySchema } from "share";
import { format } from "date-fns";
import Input from "../../components/ui/UiInput.vue";
import { useForm } from "@tanstack/vue-form";
import { watch } from "vue";

interface Props {
  loading?: boolean;
  initialDate?: string;
  error?: string;
  resetKey?: number;
}

interface Emits {
  (e: "submit", date: string, period: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: undefined,
  resetKey: 0,
});
const emit = defineEmits<Emits>();

const getToday = () => format(new Date(), "yyyy-MM-dd");
const getDefaultValues = () => ({
  date: props.initialDate || getToday(),
  period: 1.5,
});

const getErrorMessage = (errors: readonly unknown[]): string | undefined => {
  const error = errors[0];
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return undefined;
};

const form = useForm({
  defaultValues: getDefaultValues(),
  validators: {
    onChange: createActivitySchema,
  },
  onSubmit: ({ value }) => {
    emit("submit", value.date, value.period);
  },
});

watch(
  () => props.initialDate,
  (value) => {
    if (value) form.setFieldValue("date", value);
  }
);

watch(
  () => props.resetKey,
  (value, previousValue) => {
    if (value !== previousValue) form.reset(getDefaultValues());
  }
);
</script>

<template>
  <div class="p-2">
    <form class="stack" data-testid="activity-form" @submit.prevent.stop="form.handleSubmit">
      <form.Field name="date">
        <template #default="{ field, state }">
          <Input
            id="date"
            :model-value="field.state.value"
            label="日付"
            type="date"
            required
            :disabled="props.loading"
            :error="state.meta.isTouched ? getErrorMessage(state.meta.errors) : undefined"
            data-testid="date-input"
            @blur="field.handleBlur"
            @update:model-value="(value) => field.handleChange(String(value ?? ''))" />
        </template>
      </form.Field>

      <form.Field name="period">
        <template #default="{ field, state }">
          <Input
            id="period"
            :model-value="field.state.value"
            label="時間 (時間)"
            type="number"
            step="0.5"
            min="0.5"
            max="8"
            required
            :disabled="props.loading"
            :error="state.meta.isTouched ? getErrorMessage(state.meta.errors) : undefined"
            data-testid="period-input"
            @blur="field.handleBlur"
            @update:model-value="(value) => field.handleChange(typeof value === 'number' ? value : 0)" />
        </template>
      </form.Field>

      <p v-if="props.error" class="alert-error" role="alert">{{ props.error }}</p>

      <form.Subscribe>
        <template #default="{ canSubmit }">
          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="props.loading || !canSubmit"
            :aria-busy="props.loading"
            data-testid="submit-btn">
            {{ props.loading ? "保存中..." : "記録を追加" }}
          </button>
        </template>
      </form.Subscribe>
    </form>
  </div>
</template>
