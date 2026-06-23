<template>
  <div class="gap-6 px-3 py-4 md:px-6 flex flex-col">
    <AdminMenu />

    <div class="gap-3 flex flex-col sm:flex-row">
      <div class="gap-2 sm:w-auto sm:ml-auto flex w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="名前・メアドで検索..."
          class="min-w-0 px-3 py-2 bg-base border-overlay0 rounded-md text text-base sm:w-72 focus:ring-blue-500 flex-1 border transition-shadow focus:ring-2 focus:outline-none" />
      </div>

      <div class="flex flex-row items-center gap-2">
        <div class="bg-overlay1 rounded-lg p-1 flex w-fit">
          <button
            :class="['filter-btn', { 'filter-btn-active': statusFilter === 'all' }]"
            @click="statusFilter = 'all'">
            全員
          </button>
          <button
            :class="['filter-btn', { 'filter-btn-active text-red-500': statusFilter === 'unmet' }]"
            @click="statusFilter = 'unmet'">
            未達
          </button>
          <button
            :class="['filter-btn', { 'filter-btn-active text-green-500': statusFilter === 'met' }]"
            @click="statusFilter = 'met'">
            達成済
          </button>
        </div>

        <select v-model.number="gradeFilter" class="input-base w-fit">
          <option :value="ALL_GRADES">全級段位</option>
          <option v-for="option in gradeOptions" :key="option.grade" :value="option.grade">
            {{ option.name }}
          </option>
        </select>
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
      <div class="hidden md:block overflow-x-auto">
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
              <th class="th-base md:px-6">級段位取得日</th>
              <th class="th-base md:px-6">誕生日</th>
              <th class="th-base md:px-6 text-center">稽古回数</th>
              <th class="th-base md:px-6 text-center">必要回数</th>
              <th class="th-base md:px-6 text-center">達成状態</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in sortedUsers"
              :key="user.id"
              class="border-overlay0 hover:bg-overlay0 cursor-pointer border-b transition-colors last:border-b-0"
              @click="openUser(user.id)">
              <td class="td-base md:px-6">
                <div class="gap-2 flex items-center">
                  <img :src="user.imageUrl" alt="" class="avatar-sm ml-1" />
                  <div class="flex flex-col">
                    <span class="font-medium text">{{ user.lastName }} {{ user.firstName }}</span>
                    <small class="text-sub">{{ user.emailAddress }}</small>
                  </div>
                </div>
              </td>
              <td class="td-base md:px-6 text-center">{{ user.profile.roleLabel }}</td>
              <td class="td-base md:px-6 text-center">{{ user.profile.gradeLabel }}</td>
              <td class="td-base md:px-6 text-center">{{ user.profile.yearLabel }}</td>
              <td class="td-base md:px-6 text-center">{{ formatDateSlash(user.profile.getGradeAt) }}</td>
              <td class="td-base md:px-6 text-center">{{ formatDateSlash(user.profile.birthday) }}</td>
              <td class="td-base md:px-6 text-center">{{ user.profile.norm?.current ?? '-' }}</td>
              <td class="td-base md:px-6 text-center">{{ user.profile.norm?.required ?? '-' }}</td>
              <td class="td-base md:px-6 text-center">{{ (user.profile.norm?.isMet ?? '-') ? '達成' : '未達成' }}</td>
            </tr>
            <tr v-if="sortedUsers.length === 0">
              <td colspan="9" class="p-12 text-subtext text-center">ユーザーが見つかりませんでした</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="gap-3 md:hidden flex flex-col">
        <button
          v-for="user in sortedUsers"
          :key="user.id"
          class="card flex flex-col gap-4 text-left"
          @click="openUser(user.id)">
          <div class="gap-3 flex items-center">
            <img :src="user.imageUrl" alt="" class="avatar-md" />
            <div class="min-w-0 flex-1">
              <div class="font-medium text">{{ user.lastName }} {{ user.firstName }}</div>
              <div class="truncate text-sub">{{ user.emailAddress }}</div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div class="text-sub">学年</div>
              <div class="text">{{ user.profile.yearLabel }}</div>
            </div>
            <div>
              <div class="text-sub">生年月日</div>
              <div class="text">{{ formatDateSlash(user.profile.birthday) }}</div>
            </div>
            <div>
              <div class="text-sub">役職</div>
              <div class="text">{{ user.profile.roleLabel }}</div>
            </div>
            <div>
              <div class="text-sub">級段位</div>
              <div class="text">{{ user.profile.gradeLabel }}</div>
            </div>
            <div>
              <div class="text-sub">取得日</div>
              <div class="text">{{ formatDateSlash(user.profile.getGradeAt) }}</div>
            </div>
          </div>

          <NormSummary v-if="user.profile.norm" :norm="user.profile.norm" />
          <div v-else class="rounded-md bg-overlay0 px-3 py-2 text-sm text-sub">情報なし</div>
        </button>
      </div>

      <div v-if="sortedUsers.length === 0" class="py-12 text-subtext text-center md:hidden">
        ユーザーが見つかりませんでした
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminMenu from '@/components/admin/AdminMenu.vue';
import hc from '@/lib/honoClient';
import NormSummary from '@/components/admin/NormSummary.vue';
import { queryKeys } from '@/lib/queryKeys';
import { useQuery } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { type AdminUserType, formatDateSlash, grade as gradeOptions, Role } from 'share';
import { computed, ref } from 'vue';

const ALL_GRADES = 999;

const router = useRouter();
const searchQuery = ref('');
const statusFilter = ref<'all' | 'met' | 'unmet'>('all');
const gradeFilter = ref<number>(ALL_GRADES);
const sortBy = ref<'role' | 'grade' | 'year' | 'name'>('role');
const sortOrder = ref<'asc' | 'desc'>('asc');

const {
  data,
  isLoading: loading,
  error: queryError,
} = useQuery({
  queryKey: computed(() => queryKeys.admin.accounts({ query: { query: searchQuery.value, limit: 100 } })),
  queryFn: async () => {
    const res = await hc.admin.accounts.$get({
      query: { query: searchQuery.value, limit: 100 },
    });
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return res.json();
  },
});

const users = computed(() => (data.value?.users ?? []) as AdminUserType[]);
const error = computed(() => (queryError.value ? 'データの取得に失敗しました' : ''));

const toggleSort = (field: 'role' | 'grade' | 'year' | 'name') => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    return;
  }

  sortBy.value = field;
  sortOrder.value = 'asc';
};

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    if (gradeFilter.value !== ALL_GRADES && user.profile.grade !== gradeFilter.value) {
      return false;
    }

    if (statusFilter.value === 'met' && !user.profile.norm?.isMet) {
      return false;
    }

    if (statusFilter.value === 'unmet' && (!user.profile.norm || user.profile.norm.isMet)) {
      return false;
    }

    return true;
  });
});

const sortedUsers = computed(() => {
  // oxlint-disable-next-line unicorn/no-array-sort
  return [...filteredUsers.value].sort((a, b) => {
    switch (sortBy.value) {
      case 'role': {
        const roleComparison = Role.compare(a.profile.role || 'member', b.profile.role || 'member');
        return sortOrder.value === 'asc' ? roleComparison : -roleComparison;
      }
      case 'grade': {
        const gradeA = a.profile.grade ?? 99;
        const gradeB = b.profile.grade ?? 99;
        const gradeComparison = gradeA - gradeB;
        return sortOrder.value === 'asc' ? gradeComparison : -gradeComparison;
      }
      case 'year': {
        const yearA = a.profile.year || '';
        const yearB = b.profile.year || '';
        const yearComparison = yearA.localeCompare(yearB);
        return sortOrder.value === 'asc' ? yearComparison : -yearComparison;
      }
      case 'name': {
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

const openUser = (userId: string) => {
  router.push(`/admin/users/${userId}`);
};
</script>
