<script setup lang="ts">
import ActivityForm from '@/src/components/record/ActivityForm.vue';
import ActivityList from '@/src/components/record/ActivityList.vue';
import ConfirmDialog from '@/src/components/ui/ConfirmDialog.vue';
import { Show } from '@clerk/vue';
import { computed, ref } from 'vue';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { endOfMonth, format, isSameDay, parseISO, startOfMonth } from 'date-fns';
import { useActivities, useAddActivity, useDeleteActivity } from '@/src/composable/useActivity';

// Mutations
const { mutateAsync: addActivity } = useAddActivity();
const { mutateAsync: deleteActivity } = useDeleteActivity();
// State
const currentMonth = ref(new Date());
const isModalOpen = ref(false);
const selectedDate = ref(format(new Date(), 'yyyy-MM-dd'));
const confirmDialogOpen = ref(false);
const activityToDelete = ref<string | null>(null);
// Query
const filters = computed(() => ({
  startDate: format(startOfMonth(currentMonth.value), 'yyyy-MM-dd'),
  endDate: format(endOfMonth(currentMonth.value), 'yyyy-MM-dd'),
}));
const { data: activitiesRaw, isLoading: loading, error: queryError } = useActivities(filters);
const activities = computed(() => activitiesRaw.value ?? []);
const error = computed(() => (queryError.value ? '活動記録の取得に失敗しました' : null));
const handleDelete = (id: string) => {
  activityToDelete.value = id;
  confirmDialogOpen.value = true;
};
const handleConfirmDelete = async () => {
  if (activityToDelete.value) {
    try {
      await deleteActivity([activityToDelete.value]);
      confirmDialogOpen.value = false;
      activityToDelete.value = null;
    } catch (e) {
      console.error('Failed to delete activity:', e);
      alert('記録の削除に失敗しました。');
    }
  }
};
const handleChangeMonth = (date: Date) => {
  currentMonth.value = date;
};
const handleSelectDate = (date: string) => {
  selectedDate.value = date;
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
};
const handleSubmit = async (date: string, period: number) => {
  try {
    await addActivity({ date, period });
    closeModal();
  } catch (e) {
    console.error('Failed to add activity:', e);
    alert('記録の追加に失敗しました。');
  }
};
const selectedDateActivities = computed(() => {
  return activities.value.filter((a) => isSameDay(parseISO(a.date), parseISO(selectedDate.value)));
});
</script>

<template>
  <div class="max-w-7xl px-4 mx-auto flex min-h-[calc(100vh-4rem)] flex-col">
    <Show when="signed-in">
      <div class="max-w-2xl gap-4 mx-auto flex w-full flex-1 flex-col">
        <h1 class="heading-1 shrink-0">活動記録</h1>

        <div v-if="error" class="bg-red-500/10 text-red-500 p-4 rounded-lg shrink-0">
          {{ error }}
        </div>

        <div class="min-h-0 flex-1">
          <ActivityList
            :activities="activities"
            :loading="loading"
            :current-month="currentMonth"
            @change-month="handleChangeMonth"
            @select-date="handleSelectDate" />
        </div>
      </div>

      <Dialog :open="isModalOpen" class="relative z-50" @close="closeModal">
        <div class="inset-0 bg-black/50 fixed backdrop-blur-[4px]" aria-hidden="true" />
        <div class="inset-0 p-4 fixed flex w-screen items-center justify-center">
          <DialogPanel
            class="max-w-md bg-surface0 rounded-xl shadow-md p-6 border-overlay0 max-h-[90vh] w-full overflow-y-auto border">
            <div class="flex-between mb-4">
              <DialogTitle class="text-lg font-bold text"> 記録を追加・編集 </DialogTitle>
              <button
                class="p-1 text-subtext bg-overlay1 cursor-pointer rounded-full border-none bg-transparent transition-colors"
                @click="closeModal">
                <div class="i-lucide:x" />
              </button>
            </div>

            <ActivityForm :loading="loading" :initial-date="selectedDate" @submit="handleSubmit" />

            <div v-if="selectedDateActivities.length > 0" class="mt-8 pt-6 border-overlay0 border-t">
              <h4 class="text-sm font-bold text-subtext mb-3">この日の記録</h4>
              <div class="gap-2 flex flex-col">
                <div
                  v-for="activity in selectedDateActivities"
                  :key="activity.id"
                  class="flex-between p-3 bg-surface0 rounded-lg">
                  <div class="gap-2 flex items-baseline">
                    <span class="text-lg font-bold text">{{ activity.period }}</span>
                    <span class="text-sub">時間</span>
                  </div>
                  <button
                    class="p-2 text-subtext hover:text-red-500 bg-overlay1 cursor-pointer rounded-full border-none bg-transparent transition-colors"
                    title="記録を削除"
                    @click="handleDelete(activity.id)">
                    <div class="i-lucide:trash-2 sq-5" />
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <ConfirmDialog
        :open="confirmDialogOpen"
        title="記録の削除"
        description="この記録を削除してもよろしいですか？この操作は取り消せません。"
        confirm-text="削除する"
        cancel-text="キャンセル"
        @confirm="handleConfirmDelete"
        @cancel="confirmDialogOpen = false" />
    </Show>
  </div>
</template>
