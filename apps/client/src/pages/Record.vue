<script setup lang="ts">
import ActivityForm from "@/components/record/ActivityForm.vue";
import ActivityList from "@/components/record/ActivityList.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import { Show } from "@clerk/vue";
import UiDialog from "@/components/ui/UiDialog.vue";
import { computed, ref } from "vue";
import { endOfMonth, format, isSameDay, parseISO, startOfMonth } from "date-fns";
import { useActivities, useAddActivity, useDeleteActivity } from "@/composable/useActivity";

// Mutations
const { mutateAsync: addActivity, isPending: isAddingActivity } = useAddActivity();
const { mutateAsync: deleteActivity, isPending: isDeletingActivity } = useDeleteActivity();
// State
const currentMonth = ref(new Date());
const isModalOpen = ref(false);
const selectedDate = ref(format(new Date(), "yyyy-MM-dd"));
const activityError = ref<string | null>(null);
const activityFormResetKey = ref(0);
const confirmDialogOpen = ref(false);
const deleteError = ref<string | null>(null);
const activityToDelete = ref<string | null>(null);
// Query
const filters = computed(() => ({
  startDate: format(startOfMonth(currentMonth.value), "yyyy-MM-dd"),
  endDate: format(endOfMonth(currentMonth.value), "yyyy-MM-dd"),
}));
const { data: activitiesRaw, isLoading: loading, error: queryError } = useActivities(filters);
const activities = computed(() => activitiesRaw.value ?? []);
const error = computed(() => (queryError.value ? "活動記録の取得に失敗しました" : null));
const handleDelete = (id: string) => {
  activityToDelete.value = id;
  deleteError.value = null;
  confirmDialogOpen.value = true;
};
const handleConfirmDelete = async () => {
  if (!activityToDelete.value) return;

  deleteError.value = null;
  try {
    await deleteActivity([activityToDelete.value]);
    confirmDialogOpen.value = false;
    activityToDelete.value = null;
  } catch {
    deleteError.value = "記録の削除に失敗しました。時間をおいて再試行してください";
  }
};
const handleCancelDelete = () => {
  confirmDialogOpen.value = false;
  deleteError.value = null;
  activityToDelete.value = null;
};
const handleChangeMonth = (date: Date) => {
  currentMonth.value = date;
};
const handleSelectDate = (date: string) => {
  selectedDate.value = date;
  activityError.value = null;
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
  activityError.value = null;
};
const handleModalOpenChange = (open: boolean) => {
  if (open) {
    isModalOpen.value = true;
    return;
  }
  closeModal();
};
const handleSubmit = async (date: string, period: number) => {
  activityError.value = null;
  try {
    await addActivity({ date, period });
    activityFormResetKey.value += 1;
    closeModal();
  } catch {
    activityError.value = "記録の追加に失敗しました。時間をおいて再試行してください";
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

      <UiDialog
        :open="isModalOpen"
        title="記録を追加・削除"
        content-class="max-w-md bg-surface0 rounded-xl shadow-md p-6 border-overlay0 max-h-[90vh] overflow-y-auto border"
        @update:open="handleModalOpenChange">
        <template #title>
          <div class="flex-between mb-4">
            <h2 class="text-lg font-bold text">記録を追加・削除</h2>
            <button
              type="button"
              aria-label="閉じる"
              class="p-1 text-subtext bg-overlay1 cursor-pointer rounded-full border-none bg-transparent transition-colors"
              @click="closeModal">
              <div class="i-lucide:x" />
            </button>
          </div>
        </template>

        <ActivityForm
          :loading="isAddingActivity"
          :initial-date="selectedDate"
          :error="activityError ?? undefined"
          :reset-key="activityFormResetKey"
          @submit="handleSubmit" />

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
      </UiDialog>

      <ConfirmDialog
        :open="confirmDialogOpen"
        title="記録の削除"
        description="この記録を削除してもよろしいですか？この操作は取り消せません。"
        confirm-text="削除する"
        cancel-text="キャンセル"
        :error="deleteError ?? undefined"
        :loading="isDeletingActivity"
        @confirm="handleConfirmDelete"
        @cancel="handleCancelDelete" />
    </Show>
  </div>
</template>
