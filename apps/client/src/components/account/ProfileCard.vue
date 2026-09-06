<template>
  <div class="py-2">
    <div v-if="!profile" class="stack animate-pulse" data-testid="skeleton">
      <div class="flex-between">
        <h3 class="text-lg font-bold text">プロフィール</h3>
        <div class="h-8 w-12 rounded-md bg-overlay-active" />
      </div>
      <div class="gap-3 flex flex-col">
        <div class="py-1 flex items-center justify-between">
          <span class="text text-subtext">級段位</span>
          <span class="text font-medium bg-overlay-active rounded-md text-transparent">五段</span>
        </div>
        <div class="py-1 flex items-center justify-between">
          <span class="text text-subtext">取得日</span>
          <span class="text font-medium bg-overlay-active rounded-md text-transparent">2024/01/01</span>
        </div>
        <div class="py-1 flex items-center justify-between">
          <span class="text text-subtext">入部年</span>
          <span class="text font-medium bg-overlay-active rounded-md text-transparent">2024</span>
        </div>
        <div class="py-1 flex items-center justify-between">
          <span class="text text-subtext">学年</span>
          <span class="text font-medium bg-overlay-active rounded-md text-transparent">学部4年</span>
        </div>
      </div>
    </div>

    <div v-else-if="!isEditing" class="stack">
      <div
        v-if="needsProfileCompletion"
        class="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
        プロフィール情報に未入力があります。誕生日を含む必要項目を登録してください。
      </div>
      <div class="flex-between">
        <h3 class="text-lg font-bold text">プロフィール</h3>
        <button type="button" class="btn-secondary px-3 py-1.5 text-sm" @click="isEditing = true">
          {{ needsProfileCompletion ? "入力する" : "編集" }}
        </button>
      </div>
      <div class="gap-3 text-subtext flex flex-col">
        <div class="py-1 flex items-center justify-between">
          <span class="text-subtext">誕生日</span>
          <span class="font-medium text">{{ formatDateSlash(profile?.birthday) }}</span>
        </div>
        <div class="py-1 flex items-center justify-between">
          <span class="text-subtext">級段位</span>
          <span class="font-medium text">{{ translateGrade(profile?.grade ?? "") || "-" }}</span>
        </div>
        <div class="py-1 flex items-center justify-between">
          <span class="text-subtext">取得日</span>
          <span class="font-medium text">
            {{ profile?.getGradeAt ? new Date(profile.getGradeAt).toLocaleDateString() : "-" }}
          </span>
        </div>
        <div class="py-1 flex items-center justify-between">
          <span class="text-subtext">入部年</span>
          <span class="font-medium text">{{ profile?.joinedAt || "-" }}</span>
        </div>
        <div class="py-1 flex items-center justify-between">
          <span class="text-subtext">学年</span>
          <span class="font-medium text">{{ translateYear(profile?.year ?? "") || "-" }}</span>
        </div>
      </div>
    </div>

    <form v-else class="stack" @submit.prevent="handleSubmit">
      <UiSelect
        id="grade"
        v-model="formData.grade"
        label="級段位"
        :options="gradeSelectOptions"
        :disabled="isSubmitting"
        required />

      <Input v-model="formData.getGradeAt" type="date" label="取得日" :disabled="isSubmitting" />

      <Input v-model="formData.birthday" type="date" label="誕生日" :disabled="isSubmitting" />

      <Input v-model="formData.joinedAt" type="number" label="入部年" min="2020" max="9999" :disabled="isSubmitting" />

      <UiSelect
        id="year"
        v-model="formData.year"
        label="学年"
        :options="yearSelectOptions"
        :disabled="isSubmitting"
        required />

      <p v-if="message" :class="['text-sm font-medium', isError ? 'text-red-500' : 'text-green-500']">
        {{ message }}
      </p>

      <div class="gap-3 pt-2 flex">
        <button type="submit" class="btn-primary w-full" :disabled="isSubmitting">
          {{ isSubmitting ? "保存中..." : "保存" }}
        </button>
        <button type="button" class="btn-secondary w-full" @click="cancelEdit">キャンセル</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ArkErrors } from "arktype";
import hc from "@/lib/honoClient";
import Input from "@/components/ui/UiInput.vue";
import { queryKeys } from "@/lib/queryKeys";
import UiSelect from "@/components/ui/UiSelect.vue";
import { AccountMetadata, formatDateSlash, isProfileComplete } from "share";
import { computed, reactive, ref, watch } from "vue";
import { grade, translateGrade } from "share";
import { translateYear, year } from "share";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

interface FormData {
  grade: number | null;
  getGradeAt: string;
  joinedAt: number | null;
  year: `b${number}` | `m${number}` | `d${number}`;
  birthday: string;
}

const queryClient = useQueryClient();

const isEditing = ref(false);
const message = ref("");
const isError = ref(false);
const gradeSelectOptions = grade.map((option) => ({ label: option.name, value: option.grade }));
const yearSelectOptions = year.map((option) => ({ label: option.name, value: option.year }));

const formData = reactive<FormData>({
  grade: 0,
  getGradeAt: "",
  joinedAt: null,
  year: "b1",
  birthday: "",
});

// Query - Returns { profile: ... } to match server response shape
const { data: profileData } = useQuery({
  queryKey: queryKeys.user.clerk.profile(),
  queryFn: async () => {
    const res = await hc.user.clerk.profile.$get();
    if (!res.ok) throw new Error("Failed to fetch profile");
    const data = await res.json();
    if (data.profile) {
      const profileParsed = AccountMetadata(data.profile);
      if (profileParsed instanceof ArkErrors) {
        if (import.meta.env.DEV) console.error("Invalid profile response");
        throw new Error("Invalid profile data");
      }
      return { profile: profileParsed, needsProfileCompletion: Boolean(data.needsProfileCompletion) };
    }
    return { profile: null, needsProfileCompletion: true };
  },
});

const profile = computed(() => profileData.value?.profile ?? null);
const needsProfileCompletion = computed(() => profileData.value?.needsProfileCompletion ?? true);

function applyProfileToForm(newProfile: typeof profile.value) {
  if (newProfile) {
    formData.grade = Number(newProfile.grade) || 0;
    formData.getGradeAt = newProfile.getGradeAt || "";
    formData.joinedAt = newProfile.joinedAt ?? new Date().getFullYear();
    formData.year = (newProfile.year || "b1") as `b${number}` | `m${number}` | `d${number}`;
    formData.birthday = newProfile.birthday || "";
    return;
  }

  formData.grade = 0;
  formData.getGradeAt = "";
  formData.joinedAt = new Date().getFullYear();
  formData.year = "b1";
  formData.birthday = "";
}

// Sync form data
watch(profile, (newProfile) => applyProfileToForm(newProfile), { immediate: true });

function updateFormData() {
  applyProfileToForm(profile.value);
}

// Mutation
const { mutateAsync: updateProfile, isPending: isSubmitting } = useMutation({
  mutationFn: async (json: {
    grade: number;
    getGradeAt: `${number}-${number}-${number}` | null;
    joinedAt: number | null;
    year: `b${number}` | `m${number}` | `d${number}`;
    birthday: `${number}-${number}-${number}` | null;
  }) => {
    const res = await hc.user.clerk.profile.$patch({ json });
    if (!res.ok) throw new Error("プロフィールの更新に失敗しました");
    return res.json();
  },
  onSuccess: (responseData) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.clerk.profile() });

    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "profile" in responseData &&
      responseData.profile
    ) {
      const validatedProfile = AccountMetadata(responseData.profile);
      if (validatedProfile instanceof ArkErrors) {
        if (import.meta.env.DEV) console.error("Invalid updated profile response");
      } else {
        // Set cache with consistent { profile: ... } shape
        queryClient.setQueryData(queryKeys.user.clerk.profile(), {
          profile: validatedProfile,
          needsProfileCompletion: !isProfileComplete(validatedProfile),
        });
      }
    }

    message.value = "プロフィールを更新しました";
    isEditing.value = false;
  },
  onError: (error) => {
    isError.value = true;
    message.value = error instanceof Error ? error.message : "プロフィールの更新に失敗しました";
  },
});

async function handleSubmit() {
  message.value = "";
  isError.value = false;
  try {
    const getGradeAtValue = (formData.getGradeAt || null) as `${number}-${number}-${number}` | null;
    const birthdayValue = (formData.birthday || null) as `${number}-${number}-${number}` | null;

    const updateData = {
      grade: formData.grade ?? 0,
      getGradeAt: getGradeAtValue,
      joinedAt: formData.joinedAt,
      year: formData.year as `b${number}` | `m${number}` | `d${number}`,
      birthday: birthdayValue,
    };

    await updateProfile(updateData);
  } catch {
    // handled in onError
  }
}

function cancelEdit() {
  updateFormData();
  isEditing.value = false;
  message.value = "";
}
</script>
