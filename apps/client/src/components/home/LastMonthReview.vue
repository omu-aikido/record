<script setup lang="ts">
import type { RankingResponse } from 'share';

interface Props {
  rankingData: RankingResponse | null;
  loading?: boolean;
  error?: string | null;
}

withDefaults(defineProps<Props>(), { loading: false, error: null });

const getRankClass = (rank: number) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-slate-400';
  if (rank === 3) return 'text-orange-400';
  return '';
};
</script>

<template>
  <div class="w-full" data-testid="last-month-review">
    <div v-if="loading" class="card skeleton" data-testid="loading-state">
      <div class="flex-between">
        <div class="flex flex-col">
          <div class="text-xs font-medium text-subtext mb-1 bg-overlay1 rounded-md text-transparent">
            先月の振り返り (&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;月)
          </div>
          <div class="gap-1.5 flex items-baseline">
            <span class="text-4xl font-bold tracking-tight text bg-overlay1 rounded-md text-transparent">&nbsp;</span>
            <span class="form-label bg-overlay1 rounded-md text-transparent">/ &nbsp;&nbsp;&nbsp;&nbsp;</span>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <div class="text-sm text gap-0.5 flex">
            <span class="text-lg font-bold bg-overlay1 rounded-md text-transparent">&nbsp;</span>
            <span class="text-sub bg-overlay1 rounded-md text-transparent">&nbsp;&nbsp;</span>
          </div>
          <div class="text-sm text gap-0.5 flex">
            <span class="text-lg font-bold bg-overlay1 rounded-md text-transparent">&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span class="text-sub bg-overlay1 rounded-md text-transparent">&nbsp;&nbsp;</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="py-8 text-center">
      <div class="text-sm text-red-500">エラー: {{ error }}</div>
    </div>

    <div v-else-if="rankingData?.currentUserRanking" class="card">
      <div class="flex-between">
        <div class="flex flex-col">
          <div class="text-xs font-medium text-subtext mb-1">先月の振り返り ({{ rankingData.period }})</div>
          <div class="gap-1.5 flex items-baseline" data-testid="rank-display">
            <span
              :class="['text-4xl font-bold tracking-tight text', getRankClass(rankingData.currentUserRanking.rank)]">
              {{ rankingData.currentUserRanking.rank }}
            </span>
            <span class="form-label">/ {{ rankingData.totalUsers }}</span>
          </div>
        </div>
        <div class="flex flex-col items-end" data-testid="stats-display">
          <div class="text-sm text gap-0.5 flex items-baseline">
            <span class="text-lg font-bold">{{ rankingData.currentUserRanking.practiceCount }}</span>
            <span class="text-sub">回</span>
          </div>
          <div class="text-sm text gap-0.5 flex items-baseline">
            <span class="heading-2">{{ rankingData.currentUserRanking.totalPeriod }}</span>
            <span class="text-sub">時間</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="rankingData" class="card py-8 text-center">
      <div class="text-sub">先月の稽古記録がありません</div>
    </div>
  </div>
</template>
