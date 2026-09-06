<template>
  <div class="gap-6 px-3 py-4 pb-12 md:px-6 flex flex-col">
    <AdminMenu />

    <UiStatus v-if="loading" status="loading" />

    <UiStatus v-else-if="error" status="error" :message="error" />

    <div v-else class="gap-8 flex flex-col">
      <section class="section">
        <div class="px-3 pb-4 flex flex-col items-center justify-between">
          <h2 class="text-lg font-bold text-red-500 gap-2 flex items-center">直近3週間活動のない部員</h2>
          <span class="text-sub">{{ thresholdDate }} 以降の記録なし</span>
        </div>

        <UiStatus v-if="inactiveUsers.length === 0" status="empty" class="p-8">
          該当する部員はいません。全員活動中です！
        </UiStatus>

        <div v-else class="border-overlay0 flex flex-col overflow-y-auto border-t border-b">
          <div
            v-for="user in inactiveUsers"
            :key="user.id"
            class="gap-3 p-4 border-overlay0 hover:bg-overlay1 flex cursor-pointer items-center border-b transition-colors last:border-b-0"
            @click="$router.push(`/admin/users/${user.id}`)">
            <img :src="user.imageUrl" alt="" class="avatar-md" />
            <div class="min-w-0 flex-1">
              <div class="font-medium text truncate">{{ user.lastName }} {{ user.firstName }}</div>
              <div class="text-sub truncate">
                {{ user.profile.roleLabel }}
              </div>
            </div>
            <div class="text-sm font-medium px-2 py-1 rounded-md bg-red-500/10 text-red-500 ml-auto">注意</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminMenu from "@/components/admin/AdminMenu.vue";
import { computed } from "vue";
import hc from "@/lib/honoClient";
import { queryKeys } from "@/lib/queryKeys";
import UiStatus from "@/components/ui/UiStatus.vue";
import { useQuery } from "@tanstack/vue-query";

// Queries
const {
  data,
  isLoading: loading,
  error: queryError,
} = useQuery({
  queryKey: queryKeys.admin.dashboard(),
  queryFn: async () => {
    const res = await hc.admin.dashboard.$get();
    if (!res.ok) throw new Error("Failed to fetch dashboard data");
    return res.json();
  },
});

const inactiveUsers = computed(() => data.value?.inactiveUsers ?? []);
const thresholdDate = computed(() => data.value?.thresholdDate ?? "");
const error = computed(() => (queryError.value ? "ダッシュボード情報の取得に失敗しました" : ""));
</script>
