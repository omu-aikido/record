<script setup lang="ts">
import type { Activity } from "share";
import { computed } from "vue";
import { ja } from "date-fns/locale";
import * as dateFns from "date-fns";

interface Props {
  date: Date;
  activities: readonly Activity[];
}

interface Emits {
  (e: "selectDate", date: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const totalPeriod = computed(() => props.activities.reduce((sum, activity) => sum + activity.period, 0));

const handleDateClick = () => {
  emit("selectDate", dateFns.format(props.date, "yyyy-MM-dd"));
};

const formatDate = (date: Date) => {
  return dateFns.format(date, "yyyy年M月d日", { locale: ja });
};

const getDay = (date: Date) => {
  return dateFns.format(date, "d");
};

const getWeekday = (date: Date) => {
  return dateFns.format(date, "E", { locale: ja });
};

const isSunday = (date: Date) => {
  return date.getDay() === 0;
};

const isSaturday = (date: Date) => {
  return date.getDay() === 6;
};

const isToday = (date: Date) => {
  return dateFns.isSameDay(date, new Date());
};
</script>

<template>
  <div
    :class="[
      'min-h-16 border-overlay0 relative flex cursor-pointer items-stretch border-b transition-colors',
      isToday(date) ? 'bg-blue-50/10' : 'hover:bg-surface0',
    ]"
    role="button"
    tabindex="0"
    :aria-label="`${formatDate(date)}を選択`"
    data-testid="day-item"
    @click="handleDateClick"
    @keydown.enter.prevent="handleDateClick"
    @keydown.space.prevent="handleDateClick">
    <div class="stack w-12 p-2 flex-shrink-0 items-center justify-center transition-colors">
      <span
        :class="[
          'text-lg font-bold text leading-none',
          isSunday(date) ? 'text-red-500' : isSaturday(date) ? 'text-blue-500' : '',
        ]">
        {{ getDay(date) }}
      </span>
      <span
        :class="[
          'text-xs font-medium mt-1 text-subtext leading-none',
          isSunday(date) ? 'text-red-500' : isSaturday(date) ? 'text-blue-500' : '',
        ]">
        {{ getWeekday(date) }}
      </span>
    </div>

    <div class="p-2 flex flex-1 flex-col justify-center">
      <div v-if="activities.length > 0" class="flex-between">
        <div class="gap-2 flex items-baseline">
          <span class="text-sub">合計</span>
          <span class="text-xl font-bold text">
            {{ totalPeriod }}
          </span>
          <span class="text-sub">時間</span>
        </div>
        <span class="text-sm text-subtext"> {{ activities.length }}件の記録 </span>
      </div>

      <div v-else class="flex h-full items-center opacity-0 hover:opacity-100">
        <span class="gap-1 text-overlay0 day-row:hover:opacity-100 inline-flex items-center transition-opacity">
          <div class="i-lucide:plus" />
          記録を追加
        </span>
      </div>
    </div>
  </div>
</template>
