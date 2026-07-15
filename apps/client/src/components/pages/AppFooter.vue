<script setup lang="ts">
import { onMounted, ref } from "vue";

import { loadVersion, type VersionDisplay } from "@/lib/version";

const version = ref<VersionDisplay>();

onMounted(async () => {
  try {
    version.value = await loadVersion();
  } catch {
    return;
  }
});
</script>

<template>
  <footer data-testid="footer-container" class="m-8 flex flex-col items-center justify-center">
    <p class="text-sub text-center" data-testid="footer-info">
      © OMU Aikido Club All Rights Reserved.
      <br />
      〒599-8531 大阪府堺市中区学園町1番1号 大阪公立大学合氣道部
    </p>

    <div data-testid="footer-links" class="pt-2">
      <a href="https://omu-aikido.com/privacy-policy" class="link" data-testid="footer-link-privacy">
        プライバシーポリシー
      </a>
      &nbsp;
      <a href="https://omu-aikido.com/terms-of-service" class="link" data-testid="footer-link-terms"> 利用規約 </a>
    </div>

    <p v-if="version" class="text-sub mt-2 text-xs" data-testid="footer-version">
      <RouterLink
        :to="{ name: 'releases' }"
        :title="version.detail"
        class="hover:underline"
        data-testid="footer-link-releases">
        Version: {{ version.label }}
      </RouterLink>
    </p>
  </footer>
</template>

<style scoped>
.link {
  --at-apply: "text-blue hover:underline";
}
</style>
