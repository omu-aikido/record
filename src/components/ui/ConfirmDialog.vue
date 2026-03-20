<script setup lang="ts">
import { Dialog, DialogDescription, DialogPanel, DialogTitle } from '@headlessui/vue';

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}
interface Emits {
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}
withDefaults(defineProps<Props>(), {
  confirmText: '削除する',
  cancelText: 'キャンセル',
});
const emit = defineEmits<Emits>();
</script>

<template>
  <Dialog :open="open" class="relative z-50" data-testid="confirm-dialog" @close="$emit('cancel')">
    <div class="inset-0 bg-black/50 backdrop-blur-sm fixed" aria-hidden="true" />

    <div class="inset-0 p-4 fixed flex items-center justify-center">
      <DialogPanel class="max-w-96 rounded-2xl bg-surface0 p-6 shadow-xl border-border w-full border">
        <div class="flex-1">
          <DialogTitle class="text-lg font-bold text gap-2 flex-inline items-center" data-testid="confirm-title">
            <div class="i-lucide:triangle-alert sq-6" />
            {{ title }}
          </DialogTitle>
          <DialogDescription class="mt-2 text-sub">
            {{ description }}
          </DialogDescription>
        </div>

        <div class="mt-6 gap-3 flex justify-end">
          <button class="btn-secondary" data-testid="cancel-btn" @click="$emit('cancel')">
            {{ cancelText }}
          </button>
          <button class="btn-danger" data-testid="confirm-btn" @click="$emit('confirm')">
            {{ confirmText }}
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
