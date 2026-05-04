<script setup lang="ts">
import type { RankingResponse } from 'share';

interface Props {
  currentRanking: RankingResponse | null;
  lastMonthRanking: RankingResponse | null;
  loading?: boolean;
  currentError?: string | null;
  lastMonthError?: string | null;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  currentError: null,
  lastMonthError: null,
});

const getRankClass = (rank: number) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-slate-400';
  if (rank === 3) return 'text-orange-400';
  return '';
};
</script>

<template>
  <div class="w-full" data-testid="ranking-card">
    <!-- Loading State -->
    <div v-if="loading" class="card skeleton" data-testid="loading-state">
      <div class="flex flex-col gap-4">
        <!-- Current Month Skeleton -->
        <div>
          <div class="text-xs font-medium text-subtext mb-1 bg-overlay1 rounded-md text-transparent">
            月間ランキング (&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;月)
          </div>
          <div class="flex-between">
            <div class="gap-1.5 flex items-baseline">
              <span class="text-4xl font-bold tracking-tight text bg-overlay1 rounded-md text-transparent">&nbsp;</span>
              <span class="form-label bg-overlay1 rounded-md text-transparent">/ &nbsp;&nbsp;&nbsp;&nbsp;</span>
            </div>
            <div class="flex gap-4">
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
        <!-- Divider -->
        <div class="border-t border-overlay0 opacity-60"></div>
        <!-- Last Month Skeleton -->
        <div>
          <div class="text-xs font-medium text-subtext mb-1 bg-overlay1 rounded-md text-transparent opacity-75">
            先月の振り返り (&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;月)
          </div>
          <div class="flex-between">
            <div class="gap-1.5 flex items-baseline">
              <span class="text-4xl font-bold tracking-tight text bg-overlay1 rounded-md text-transparent opacity-75"
                >&nbsp;</span
              >
              <span class="form-label bg-overlay1 rounded-md text-transparent opacity-75"
                >/ &nbsp;&nbsp;&nbsp;&nbsp;</span
              >
            </div>
            <div class="flex gap-4">
              <div class="text-sm text gap-0.5 flex">
                <span class="text-lg font-bold bg-overlay1 rounded-md text-transparent opacity-75">&nbsp;</span>
                <span class="text-sub bg-overlay1 rounded-md text-transparent opacity-75">&nbsp;&nbsp;</span>
              </div>
              <div class="text-sm text gap-0.5 flex">
                <span class="text-lg font-bold bg-overlay1 rounded-md text-transparent opacity-75"
                  >&nbsp;&nbsp;&nbsp;&nbsp;</span
                >
                <span class="text-sub bg-overlay1 rounded-md text-transparent opacity-75">&nbsp;&nbsp;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="currentError || lastMonthError" class="card py-8 text-center">
      <div v-if="currentError" class="text-sm text-red-500 mb-2">エラー: {{ currentError }}</div>
      <div v-if="lastMonthError" class="text-sm text-red-500">エラー: {{ lastMonthError }}</div>
    </div>

    <!-- Main Content -->
    <div v-else class="card">
      <div class="flex flex-col gap-4">
        <!-- Current Month Ranking -->
        <div v-if="currentRanking?.currentUserRanking">
          <div class="text-xs font-medium text-subtext mb-1">月間ランキング ({{ currentRanking.period }})</div>
          <div class="flex-between">
            <div class="gap-1.5 flex items-baseline" data-testid="current-rank-display">
              <span
                :class="[
                  'text-4xl font-bold tracking-tight text',
                  getRankClass(currentRanking.currentUserRanking.rank),
                ]">
                {{ currentRanking.currentUserRanking.rank }}
              </span>
              <span class="form-label">/ {{ currentRanking.totalUsers }}</span>
            </div>
            <div class="flex gap-4" data-testid="current-stats-display">
              <div class="text-sm text gap-0.5 flex items-baseline">
                <span class="text-lg font-bold">{{ currentRanking.currentUserRanking.practiceCount }}</span>
                <span class="text-sub">回</span>
              </div>
              <div class="text-sm text gap-0.5 flex items-baseline">
                <span class="heading-2">{{ currentRanking.currentUserRanking.totalPeriod }}</span>
                <span class="text-sub">時間</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="currentRanking" class="py-4 text-center">
          <div class="text-sub">今月の稽古記録がありません</div>
        </div>

        <!-- Divider -->
        <div class="border-t border-overlay0 opacity-60"></div>

        <!-- Last Month Ranking -->
        <div v-if="lastMonthRanking?.currentUserRanking" class="opacity-75">
          <div class="text-xs font-medium text-subtext mb-1">先月の振り返り ({{ lastMonthRanking.period }})</div>
          <div class="flex-between">
            <div class="gap-1.5 flex items-baseline" data-testid="last-month-rank-display">
              <span
                :class="[
                  'text-4xl font-bold tracking-tight text',
                  getRankClass(lastMonthRanking.currentUserRanking.rank),
                ]">
                {{ lastMonthRanking.currentUserRanking.rank }}
              </span>
              <span class="form-label">/ {{ lastMonthRanking.totalUsers }}</span>
            </div>
            <div class="flex gap-4" data-testid="last-month-stats-display">
              <div class="text-sm text gap-0.5 flex items-baseline">
                <span class="text-lg font-bold">{{ lastMonthRanking.currentUserRanking.practiceCount }}</span>
                <span class="text-sub">回</span>
              </div>
              <div class="text-sm text gap-0.5 flex items-baseline">
                <span class="heading-2">{{ lastMonthRanking.currentUserRanking.totalPeriod }}</span>
                <span class="text-sub">時間</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="lastMonthRanking" class="py-4 text-center opacity-75">
          <div class="text-sub">先月の稽古記録がありません</div>
        </div>
      </div>
    </div>
  </div>
</template>
