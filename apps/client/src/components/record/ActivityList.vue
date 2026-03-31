<script setup lang="ts">
import type { Activity } from 'share';
import { computed } from 'vue';
import { ja } from 'date-fns/locale';
import * as dateFns from 'date-fns';

interface Props {
  activities: readonly Activity[];
  loading?: boolean;
  currentMonth?: Date;
}

interface Emits {
  (e: 'changeMonth', date: Date): void;
  (e: 'selectDate', date: string): void;
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

const getActivitiesForDay = (date: Date) => {
  return props.activities.filter((a) => dateFns.isSameDay(dateFns.parseISO(a.date), date));
};

const handlePrevMonth = () => {
  emit('changeMonth', dateFns.subMonths(props.currentMonth, 1));
};

const handleNextMonth = () => {
  emit('changeMonth', dateFns.addMonths(props.currentMonth, 1));
};

const handleDateClick = (date: Date) => {
  emit('selectDate', dateFns.format(date, 'yyyy-MM-dd'));
};

const formatHeader = (date: Date) => {
  return dateFns.format(date, 'yyyy年 M月', { locale: ja });
};

const getDay = (date: Date) => {
  return dateFns.format(date, 'd');
};

const getWeekday = (date: Date) => {
  return dateFns.format(date, 'E', { locale: ja });
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
  <div class="top-0 flex-between p-3 px-4 bg-base sticky z-20">
    <button
      class="p-1 text-subtext hover:bg-overlay11-active cursor-pointer rounded-full border-none bg-transparent transition-colors"
      data-testid="prev-month-btn"
      @click="handlePrevMonth">
      <div class="i-lucide:chevron-left" />
    </button>

    <h2 class="text-lg font-bold text" data-testid="month-header">
      {{ formatHeader(currentMonth) }}
    </h2>

    <button
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
      <div
        v-for="day in daysInMonth"
        :key="day.toISOString()"
        :class="[
          'min-h-16 border-overlay0 relative flex cursor-pointer items-stretch border-b transition-colors',
          isToday(day) ? 'bg-blue-50/10' : 'hover:bg-surface0',
        ]"
        data-testid="day-item"
        @click="handleDateClick(day)">
        <div class="stack w-12 p-2 flex-shrink-0 items-center justify-center transition-colors">
          <span
            :class="[
              'text-lg font-bold text leading-none',
              isSunday(day) ? 'text-red-500' : isSaturday(day) ? 'text-blue-500' : '',
            ]">
            {{ getDay(day) }}
          </span>
          <span
            :class="[
              'text-xs font-medium mt-1 text-subtext leading-none',
              isSunday(day) ? 'text-red-500' : isSaturday(day) ? 'text-blue-500' : '',
            ]">
            {{ getWeekday(day) }}
          </span>
        </div>

        <div class="p-2 flex flex-1 flex-col justify-center">
          <div v-if="getActivitiesForDay(day).length > 0" class="flex-between">
            <div class="gap-2 flex items-baseline">
              <span class="text-sub">合計</span>
              <span class="text-xl font-bold text">
                {{ getActivitiesForDay(day).reduce((sum, a) => sum + a.period, 0) }}
              </span>
              <span class="text-sub">時間</span>
            </div>
            <span class="text-sm text-subtext"> {{ getActivitiesForDay(day).length }}件の記録 </span>
          </div>

          <div v-else class="flex h-full items-center opacity-0 hover:opacity-100">
            <span class="gap-1 text-overlay0 day-row:hover:opacity-100 inline-flex items-center transition-opacity">
              <div class="i-lucide:plus" />
              記録を追加
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
