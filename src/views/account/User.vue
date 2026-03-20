<template>
  <div class="max-w-7xl p-4 stack gap-6 mx-auto">
    <div class="bg-surface0 rounded-xl shadow-sm border-overlay0 p-6 border">
      <UserHeader :user="user" @updated="fetchUser" />

      <hr class="my-6 border-overlay0 border-t border-none" />

      <ProfileCard />

      <div v-if="errorMessage" class="alert-error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert-success">{{ successMessage }}</div>
      <div class="mt-4 pt-4 border-overlay0 border-t">
        <p class="text-sub">
          メールアドレス・パスワード変更などは
          <a
            class="text-blue-500 font-medium inline-flex items-center break-all no-underline hover:underline"
            href="https://accounts.omu-aikido.com/user"
            target="_blank"
            rel="noopener noreferrer"
            >こちら
            <div class="i-lucide:square-arrow-out-up-right sq-3 ml-0.5 inline-block" /> </a
          >&MediumSpace;から。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import hc from '@/src/lib/honoClient';
import ProfileCard from '@/src/components/account/ProfileCard.vue';
import { queryKeys } from '@/src/lib/queryKeys';
import { useQuery } from '@tanstack/vue-query';
import UserHeader from '@/src/components/account/UserHeader.vue';

// Queries
const {
  data: userData,
  error: queryError,
  refetch,
} = useQuery({
  queryKey: queryKeys.user.clerk.account(),
  queryFn: async () => {
    const res = await hc.user.clerk.account.$get();
    if (!res.ok) throw new Error('Failed to fetch user');
    return await res.json();
  },
});

const user = computed(() => userData.value ?? null);
const errorMessage = computed(() => (queryError.value ? 'ユーザーデータの読み込みに失敗しました' : ''));
const successMessage = computed(() => '');

const fetchUser = () => refetch();
</script>
