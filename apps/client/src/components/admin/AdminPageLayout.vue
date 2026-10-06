<script setup lang="ts">
import AdminMenu from "@/components/admin/AdminMenu.vue";
</script>

<template>
  <div class="gap-6 px-3 py-4 md:px-6 flex flex-col">
    <AdminMenu />
    <slot />
  </div>
</template>
