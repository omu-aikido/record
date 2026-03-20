<template>
  <a v-bind:href="'/admin/users/' + user.id" class="card stack md:p-6 cursor-pointer" data-testid="norm-card">
    <div class="gap-3 flex items-start justify-between">
      <div class="gap-3 flex items-center">
        <img :src="user.imageUrl" alt="" class="avatar-md" />
        <div>
          <div class="font-medium text">{{ user.lastName }} {{ user.firstName }}</div>
          <div class="text-sub gap-x-2 gap-y-0 flex flex-wrap">
            <span>{{ norm.gradeLabel }}</span>
            <span v-if="norm.lastPromotionDate" class="text-subtext">•</span>
            <span v-if="norm.lastPromotionDate">昇級: {{ norm.lastPromotionDate }}</span>
          </div>
        </div>
      </div>
      <div class="shrink-0">
        <span :class="progress >= 100 ? 'badge-green' : 'badge-yellow'" data-testid="norm-status">
          {{ progress >= 100 ? '達成' : '未達成' }}
        </span>
      </div>
    </div>

    <div class="gap-2 flex flex-1 flex-col justify-end">
      <div class="gap-1 flex flex-col">
        <div class="text-sub flex justify-between">
          <span>進捗率 {{ Math.min(100, Math.round(progress)) }}%</span>
          <span class="font-medium text-subtext">{{ norm.current }} / {{ norm.required }} 回</span>
        </div>
        <div class="h-1.5 bg-overlay1 w-full overflow-hidden rounded-full">
          <div
            class="bg-blue-500 ease-out h-full rounded-full transition-[width] duration-500"
            :style="{ width: `${Math.min(100, progress)}%` }"
            data-testid="norm-progress" />
        </div>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import type { AdminUserType } from '@/share/types/admin';

interface NormData {
  userId: string;
  current: number;
  required: number;
  progress: number;
  isMet: boolean;
  grade: number;
  gradeLabel: string;
  lastPromotionDate: string | null;
}

defineProps<{ user: AdminUserType; norm: NormData; progress: number }>();
</script>
