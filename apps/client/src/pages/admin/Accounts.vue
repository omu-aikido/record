<template>
  <div class="gap-6 px-3 py-4 md:px-6 flex flex-col">
    <AdminMenu />
    <div class="stack sm:flex-row sm:items-center sm:justify-between items-start">
      <div class="gap-2 sm:w-auto sm:ml-auto flex w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="名前・メアドで検索..."
          class="min-w-0 px-3 py-2 bg-base border-overlay0 rounded-md text text-base sm:w-64 focus:ring-blue-500 flex-1 border transition-shadow focus:ring-2 focus:outline-none"
          @keyup.enter="handleSearch" />
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded-md text-base hover:bg-blue-600 focus:ring-blue-500 cursor-pointer border-none transition-colors focus:ring-2 focus:outline-none"
          @click="handleSearch">
          検索
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner" />
      <p class="text-sub">Loading...</p>
    </div>

    <div v-else-if="error" class="p-4 bg-red-500/10 text-red-500 rounded-md border-red-500/20 border">
      {{ error }}
    </div>

    <div v-else class="w-full">
      <div class="overflow-x-auto">
        <table class="table-base">
          <thead class="border-overlay0 border-b">
            <tr>
              <th
                class="th-base hover:bg-overlay0 md:px-6 cursor-pointer transition-colors select-none"
                @click="toggleSort('name')">
                名前
                <span v-if="sortBy === 'name'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th
                class="th-base hover:bg-overlay0 md:px-6 cursor-pointer transition-colors select-none"
                @click="toggleSort('role')">
                役職
                <span v-if="sortBy === 'role'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th
                class="th-base hover:bg-overlay0 md:px-6 cursor-pointer transition-colors select-none"
                @click="toggleSort('grade')">
                級段位
                <span v-if="sortBy === 'grade'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th
                class="th-base hover:bg-overlay0 md:px-6 cursor-pointer transition-colors select-none"
                @click="toggleSort('year')">
                学年
                <span v-if="sortBy === 'year'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in sortedUsers"
              :key="user.id"
              class="border-overlay0 hover:bg-overlay0 cursor-pointer border-b transition-colors last:border-b-0"
              @click="$router.push(`/admin/users/${user.id}`)">
              <td class="td-base md:px-6">
                <div class="gap-2 flex items-center">
                  <img :src="user.imageUrl" alt="" class="avatar-sm ml-1" />
                  <div class="flex flex-col">
                    <span class="font-medium text"> {{ user.lastName }} {{ user.firstName }} </span>
                    <small class="text-sub">{{ user.emailAddress }}</small>
                  </div>
                </div>
              </td>
              <td class="td-base md:px-6 text-center">
                <span class="text">{{ user.profile.roleLabel }}</span>
              </td>
              <td class="td-base md:px-6 text-center">
                <span class="text">{{ user.profile.gradeLabel }}</span>
              </td>
              <td class="td-base md:px-6 text-center">
                <span class="text">{{ user.profile.yearLabel }}</span>
              </td>
            </tr>
            <tr v-if="sortedUsers.length === 0">
              <td colspan="4" class="p-12 text-subtext text-center">ユーザーが見つかりませんでした</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminMenu from '@/components/admin/AdminMenu.vue';
import hc from '@/lib/honoClient';
import { queryKeys } from '@/lib/queryKeys';
import { useQuery } from '@tanstack/vue-query';
import { type AdminUserType, Role } from 'share';
import { computed, ref } from 'vue';

const searchQuery = ref('');
const sortBy = ref<string>('role');
const sortOrder = ref<'asc' | 'desc'>('asc');
const {
  data,
  isLoading: loading,
  error: queryError,
} = useQuery({
  queryKey: computed(() => queryKeys.admin.accounts({ query: { query: searchQuery.value, limit: 50 } })),
  queryFn: async () => {
    const res = await hc.admin.accounts.$get({
      query: { query: searchQuery.value, limit: 50 },
    });
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return res.json();
  },
});
const users = computed(() => (data.value?.users ?? []) as AdminUserType[]);
const error = computed(() => (queryError.value ? 'データの取得に失敗しました' : ''));
const handleSearch = () => {
  // Triggered by v-model update or enter key, causing query key change
};
const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
};
const sortedUsers = computed(() => {
  if (!users.value) return [];

  // oxlint-disable-next-line unicorn/no-array-sort
  return [...users.value].sort((a, b) => {
    switch (sortBy.value) {
      case 'role': {
        // Use the Role.compare method for proper role sorting
        const roleComparison = Role.compare(a.profile.role || 'member', b.profile.role || 'member');
        return sortOrder.value === 'asc' ? roleComparison : -roleComparison;
      }
      case 'grade': {
        // Sort by grade number (lower grades first)
        const gradeA = a.profile.grade ?? 99;
        const gradeB = b.profile.grade ?? 99;
        const gradeComparison = gradeA - gradeB;
        return sortOrder.value === 'asc' ? gradeComparison : -gradeComparison;
      }
      case 'year': {
        // Sort by year string
        const yearA = a.profile.year || '';
        const yearB = b.profile.year || '';
        const yearComparison = yearA.localeCompare(yearB);
        return sortOrder.value === 'asc' ? yearComparison : -yearComparison;
      }
      case 'name': {
        // Sort by full name
        const nameA = `${a.lastName} ${a.firstName}`;
        const nameB = `${b.lastName} ${b.firstName}`;
        const nameComparison = nameA.localeCompare(nameB, 'ja');
        return sortOrder.value === 'asc' ? nameComparison : -nameComparison;
      }
      default: {
        return 0;
      }
    }
  });
});
</script>
