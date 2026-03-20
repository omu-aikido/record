<template>
  <div class="my-4 flex items-center justify-center" data-testid="progress-indicator">
    <div
      :class="['text-sm p-2', step === 'basic' ? 'text-blue-500 font-semibold' : 'text-green-500']"
      data-testid="step-basic">
      基本情報
    </div>
    <div class="border-overlay1 ease-in-out flex-1 border-t-2 transition-colors duration-500" />
    <div
      :class="[
        'text-sm p-2',
        step === 'personal' ? 'text-blue-500 font-semibold' : step === 'profile' ? 'text-green-500' : 'text-subtext',
      ]"
      data-testid="step-personal">
      個人情報
    </div>
    <div class="border-overlay1 ease-in-out flex-1 border-t-2 transition-colors duration-500" />
    <div
      :class="['text-sm p-2', step === 'profile' ? 'text-blue-500 font-semibold' : 'text-subtext']"
      data-testid="step-profile">
      プロフィール
    </div>
  </div>
</template>

<script setup lang="ts">
type SignUpStep = 'basic' | 'personal' | 'profile';

defineProps<{ step: SignUpStep }>();
</script>
