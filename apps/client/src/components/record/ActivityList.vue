<script setup lang="ts">
import type { Activity } from "share";
import ActivityDayRow from "@/components/record/ActivityDayRow.vue";
import { computed } from "vue";
import { ja } from "date-fns/locale";
import * as dateFns from "date-fns";

interface Props {
  activities: readonly Activity[];
  loading?: boolean;
  currentMonth?: Date;
}

interface Emits {
  (e: "changeMonth", date: Date): void;
  (e: "selectDate", date: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  currentMonth: () => new Date(),
});

const emit = defineEmits<Emits>();

const daysInMonth = computed(() => {
  const start = dateFns.startOfMonth(props.currentMonth);
  const end = dateFns.endOfMonth(props.currentMonth);
  return dateFns.eachDayOfInterval({ start, end });
});

const activitiesByDate = computed(() => {
  const grouped = new Map<string, Activity[]>();

  for (const activity of props.activities) {
    const parsedDate = dateFns.parseISO(activity.date);
    if (Number.isNaN(parsedDate.getTime())) continue;

    const dateKey = dateFns.format(parsedDate, "yyyy-MM-dd");
    const activitiesForDate = grouped.get(dateKey);
    if (activitiesForDate) {
      activitiesForDate.push(activity);
    } else {
      grouped.set(dateKey, [activity]);
    }
  }

  return grouped;
});

const dayRows = computed(() => {
  return daysInMonth.value.map((date) => ({
    date,
    activities: activitiesByDate.value.get(dateFns.format(date, "yyyy-MM-dd")) ?? [],
  }));
});

const handlePrevMonth = () => {
  emit("changeMonth", dateFns.subMonths(props.currentMonth, 1));
};

const handleNextMonth = () => {
  emit("changeMonth", dateFns.addMonths(props.currentMonth, 1));
};

const handleDateSelect = (date: string) => {
  emit("selectDate", date);
};

const formatHeader = (date: Date) => {
  return dateFns.format(date, "yyyy年 M月", { locale: ja });
};
</script>

<template>
  <div class="top-0 flex-between p-3 px-4 bg-base sticky z-20">
    <button
      type="button"
      aria-label="前の月"
      class="p-1 text-subtext hover:bg-overlay11-active cursor-pointer rounded-full border-none bg-transparent transition-colors"
      data-testid="prev-month-btn"
      @click="handlePrevMonth">
      <div class="i-lucide:chevron-left" />
    </button>

    <h2 class="text-lg font-bold text" data-testid="month-header">
      {{ formatHeader(currentMonth) }}
    </h2>

    <button
      type="button"
      aria-label="次の月"
      class="p-1 text-subtext hover:bg-overlay11-active cursor-pointer rounded-full border-none bg-transparent transition-colors"
      data-testid="next-month-btn"
      @click="handleNextMonth">
      <div class="i-lucide:chevron-right" />
    </button>
  </div>

  <div class="p-0 flex h-full flex-1 flex-col overflow-hidden overflow-y-auto" data-testid="activity-list">
    <div v-if="loading && activities.length === 0" class="p-4 stack">
      <div v-for="i in 28" :key="i" class="gap-4 animate-pulse flex items-center">
        <div class="w-12 h-12 rounded-lg bg-overlay1 flex-shrink-0" />
        <div class="h-4 rounded-md bg-overlay1 w-1/3" />
      </div>
    </div>

    <div v-else class="flex flex-col">
      <ActivityDayRow
        v-for="day in dayRows"
        :key="day.date.toISOString()"
        :date="day.date"
        :activities="day.activities"
        @select-date="handleDateSelect" />
    </div>
  </div>
</template>
