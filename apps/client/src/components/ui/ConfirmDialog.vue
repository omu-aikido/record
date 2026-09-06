<script setup lang="ts">
import UiDialog from "./UiDialog.vue";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}
interface Emits {
  (e: "confirm"): void;
  (e: "cancel"): void;
}
withDefaults(defineProps<Props>(), {
  confirmText: "削除する",
  cancelText: "キャンセル",
});
const emit = defineEmits<Emits>();
</script>

<template>
  <UiDialog
    :open="open"
    :title="title"
    :description="description"
    content-class="max-w-96 rounded-2xl bg-surface0 p-6 shadow-xl border-border border"
    test-id="confirm-dialog"
    @update:open="!$event && emit('cancel')">
    <template #title>
      <h2 class="text-lg font-bold text gap-2 flex-inline items-center" data-testid="confirm-title">
        <span class="i-lucide:triangle-alert sq-6" />
        {{ title }}
      </h2>
    </template>
    <template #description>
      <p class="mt-2 text-sub">{{ description }}</p>
    </template>

    <div class="mt-6 gap-3 flex justify-end">
      <button class="btn-secondary" data-testid="cancel-btn" @click="emit('cancel')">
        {{ cancelText }}
      </button>
      <button class="btn-danger" data-testid="confirm-btn" @click="emit('confirm')">
        {{ confirmText }}
      </button>
    </div>
  </UiDialog>
</template>
