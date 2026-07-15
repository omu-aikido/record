<script setup lang="ts">
import { releases } from "@/lib/releases";
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="text mb-8 text-3xl font-bold">リリースノート</h1>

    <div class="space-y-2">
      <article v-for="release in releases" :key="release.date" class="bg-base rounded-lg p-6 shadow-sm">
        <time :datetime="release.date" class="text-sub text-sm">{{ release.date }}</time>
        <h2 class="text mb-2 text-xl font-semibold">{{ release.title }}</h2>
        <ul class="text-sub list-disc space-y-2 pl-5">
          <li v-for="change in release.changes" :key="change">{{ change }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>
