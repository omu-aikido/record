<template>
  <h1 class="text-2xl font-bold mb-2 text">管理メニュー</h1>
  <UiTabs
    :model-value="selectedTab"
    :items="tabItems"
    class="border-overlay1 border-b"
    data-testid="admin-menu"
    @update:model-value="handleTabChange" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import UiTabs from "@/components/ui/UiTabs.vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const tabs = [
  { label: "トップ", path: "/admin", testId: "tab-dashboard" },
  { label: "アカウント", path: "/admin/accounts", testId: "tab-accounts" },
];
const tabItems = tabs.map((tab) => ({ label: tab.label, value: tab.path, testId: tab.testId }));
const selectedTab = computed(() => {
  if (route.path.startsWith("/admin/users/")) return "/admin/accounts";
  return tabs.some((tab) => tab.path === route.path) ? route.path : "/admin";
});
const handleTabChange = (path: string) => {
  if (tabs.some((tab) => tab.path === path)) {
    router.push(path);
  }
};
</script>
