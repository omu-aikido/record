<script setup lang="ts">
import { format } from "date-fns";
import Input from "../../components/ui/UiInput.vue";
import { ref, watch } from "vue";

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
const newDate = ref(props.initialDate || getToday());
const newPeriod = ref<number | null>(1.5);

watch(
  () => props.initialDate,
  (val) => {
    if (val) newDate.value = val;
  }
);

const resetForm = () => {
  newDate.value = props.initialDate || getToday();
  newPeriod.value = 1.5;
};

watch(
  () => props.resetKey,
  (value, previousValue) => {
    if (value !== previousValue) resetForm();
  }
);

const handleSubmit = () => {
  if (!newDate.value || newPeriod.value === null) return;
  emit("submit", newDate.value, newPeriod.value);
};
</script>

<template>
  <div class="p-2">
    <form class="stack" data-testid="activity-form" @submit.prevent="handleSubmit">
      <Input
        id="date"
        v-model="newDate"
        label="日付"
        type="date"
        required
        :disabled="props.loading"
        data-testid="date-input" />

      <Input
        id="period"
        v-model="newPeriod"
        label="時間 (時間)"
        type="number"
        step="0.5"
        min="0.5"
        max="8"
        required
        :disabled="props.loading"
        data-testid="period-input" />

      <p v-if="props.error" class="alert-error" role="alert">{{ props.error }}</p>

      <button
        type="submit"
        class="btn-primary w-full"
        :disabled="props.loading"
        :aria-busy="props.loading"
        data-testid="submit-btn">
        {{ props.loading ? "保存中..." : "記録を追加" }}
      </button>
    </form>
  </div>
</template>
