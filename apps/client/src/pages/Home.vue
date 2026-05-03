<script setup lang="ts">
import ActivityForm from '@/components/record/ActivityForm.vue';
import hc from '@/lib/honoClient';
import type { InferResponseType } from 'hono/client';
import LastMonthReview from '@/components/home/LastMonthReview.vue';
import PracticeCountGraph from '@/components/home/PracticeCountGraph.vue';
import PracticeRanking from '@/components/home/PracticeRanking.vue';
import { queryKeys } from '@/lib/queryKeys';
import { Show } from '@clerk/vue';
import { useAddActivity } from '@/composable/useActivity';
import { computed, ref } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';

// Types
type ProfileResponse = InferResponseType<typeof hc.user.clerk.profile.$get, 200>;
type PracticeCountResponse = InferResponseType<typeof hc.user.record.count.$get, 200>;
type RankingResponse = InferResponseType<typeof hc.user.record.ranking.$get, 200>;
type MenuResponse = InferResponseType<typeof hc.user.clerk.menu.$get, 200>;
const { mutateAsync: addActivity } = useAddActivity();
const queryClient = useQueryClient();
// State
const activityLoading = ref(false);
const iconMap = {
  'clipboard-list': 'i-lucide:clipboard-list',
  user: 'i-lucide:user',
  settings: 'i-lucide:settings',
  calendar: 'i-lucide:calendar',
};
// Queries
const { data: profileData } = useQuery({
  queryKey: queryKeys.user.clerk.profile(),
  queryFn: async () => {
    const res = await hc.user.clerk.profile.$get();
    if (!res.ok) throw new Error('Failed to fetch profile');
    const data = await res.json();
    return data as ProfileResponse;
  },
});
const {
  data: practiceDataRaw,
  isLoading: countLoading,
  error: validationError,
} = useQuery({
  queryKey: queryKeys.user.record.count(),
  queryFn: async () => {
    const res = await hc.user.record.count.$get();
    if (!res.ok) throw new Error('Failed to fetch practice count');
    return res.json() as Promise<PracticeCountResponse>;
  },
});
const practiceData = computed(() => practiceDataRaw.value ?? null);
const error = computed(() => (validationError.value ? '稽古データの取得に失敗しました' : null));
const currentGrade = computed(() => {
  if (!profileData.value || !('profile' in profileData.value)) return 0;
  return profileData.value.profile.grade ?? 0;
});
const { data: rankingDataRaw, isLoading: rankingLoading } = useQuery({
  queryKey: queryKeys.user.record.ranking(),
  queryFn: async () => {
    const res = await hc.user.record.ranking.$get({ query: {} });
    if (!res.ok) throw new Error('Failed to fetch ranking');
    return res.json() as Promise<RankingResponse>;
  },
});
const rankingData = computed(() => rankingDataRaw.value ?? null);

// Calculate last month in JST (UTC+9)
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const jstNow = new Date(Date.now() + JST_OFFSET_MS);
const jstYear = jstNow.getUTCFullYear();
const jstMonth = jstNow.getUTCMonth() + 1;
const lastMonthYear = jstMonth === 1 ? jstYear - 1 : jstYear;
const lastMonthMonth = jstMonth === 1 ? 12 : jstMonth - 1;

const {
  data: lastMonthRankingDataRaw,
  isLoading: lastMonthRankingLoading,
  error: lastMonthRankingErrorRaw,
} = useQuery({
  queryKey: [...queryKeys.user.record.ranking(), lastMonthYear, lastMonthMonth],
  queryFn: async () => {
    const res = await hc.user.record.ranking.$get({ query: { year: Number(lastMonthYear), month: Number(lastMonthMonth) } });
    if (!res.ok) throw new Error('Failed to fetch last month ranking');
    return res.json() as Promise<RankingResponse>;
  },
});
const lastMonthRankingData = computed(() => lastMonthRankingDataRaw.value ?? null);
const lastMonthRankingError = computed(() => (lastMonthRankingErrorRaw.value ? '先月のデータの取得に失敗しました' : null));
const { data: menuData } = useQuery({
  queryKey: queryKeys.user.clerk.menu(),
  queryFn: async () => {
    const res = await hc.user.clerk.menu.$get();
    if (!res.ok) throw new Error('Failed to fetch menu');
    return res.json() as Promise<MenuResponse>;
  },
});
const menuItems = computed(() => menuData.value?.menu ?? []);
const handleAddActivity = async (date: string, period: number) => {
  activityLoading.value = true;
  try {
    await addActivity({ date, period });
    queryClient.invalidateQueries({ queryKey: queryKeys.user.clerk.profile() });
    queryClient.invalidateQueries({ queryKey: queryKeys.user.record.count() });
    queryClient.invalidateQueries({ queryKey: queryKeys.user.record.ranking() });
  } finally {
    activityLoading.value = false;
  }
};
const getNavItemClass = (theme: string) => {
  if (theme === 'blue') return 'hover:border-blue-500';
  if (theme === 'indigo') return 'hover:border-indigo-500';
  if (theme === 'green') return 'hover:border-teal-400';
  return '';
};
const getNavIconClass = (theme: string) => {
  if (theme === 'blue') return 'bg-blue-500/10 text-blue-500 stroke-blue-500';
  if (theme === 'indigo') return 'bg-indigo-500/10 text-indigo-500 stroke-indigo-500';
  if (theme === 'green') return 'bg-green-500/10 text-teal-400 stroke-teal-400';
  return 'bg-surface1 text-subtext';
};
const getNavLabelClass = (theme: string) => {
  if (theme === 'blue') return 'group-hover:text-blue-500';
  if (theme === 'indigo') return 'group-hover:text-indigo-500';
  if (theme === 'green') return 'group-hover:text-teal-400';
  return 'group-hover:text';
};
</script>

<template>
  <div class="max-w-7xl px-4 mx-auto">
    <Show when="signed-in">
      <div class="max-w-3xl gap-6 mx-auto flex flex-col">
        <div v-if="error" class="bg-red-50 text-red-500 p-4 rounded-lg text-sm dark:bg-red-900/10 text-center">
          {{ error }}
        </div>

        <PracticeCountGraph
          :practice-data="practiceData"
          :current-grade="currentGrade"
          :loading="countLoading"
          :error="error" />

        <div class="flex flex-col sm:flex-row gap-4">
          <div class="w-full sm:w-1/2">
            <PracticeRanking :ranking-data="rankingData" :loading="rankingLoading" />
          </div>
          <div class="w-full sm:w-1/2">
            <LastMonthReview
              :ranking-data="lastMonthRankingData"
              :loading="lastMonthRankingLoading"
              :error="lastMonthRankingError" />
          </div>
        </div>

        <ActivityForm :loading="activityLoading" @submit="handleAddActivity" />

        <hr class="pb-2 border-overlay0 opacity-60" />

        <div class="gap-4 sm:grid-cols-2 grid grid-cols-1">
          <component
            :is="item.href.startsWith('http') ? 'a' : 'RouterLink'"
            v-for="item in menuItems"
            :key="item.id"
            :to="item.href.startsWith('http') ? undefined : item.href"
            :href="item.href.startsWith('http') ? item.href : undefined"
            :target="item.href.startsWith('http') ? '_blank' : undefined"
            :class="[
              'group gap-3 card text hover:shadow-md flex cursor-pointer flex-col items-center justify-center no-underline transition-colors transition-shadow',
              getNavItemClass(item.theme),
            ]">
            <div
              :class="[
                'h-12 w-12 p-3 rounded-full transition-transform group-hover:scale-110',
                getNavIconClass(item.theme),
              ]">
              <div :class="iconMap[item.icon as keyof typeof iconMap]" class="sq-6" />
            </div>
            <span :class="['font-bold text-subtext transition-colors', getNavLabelClass(item.theme)]">{{
              item.title
            }}</span>
          </component>
        </div>
      </div>
    </Show>
  </div>
</template>
