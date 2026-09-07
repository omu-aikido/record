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
        <button type="button" class="btn-secondary px-3 py-1.5 text-sm" @click="startEditing">
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

    <form v-else class="stack" @submit.prevent.stop="form.handleSubmit">
      <ProfileFields
        :grade="formValues.grade"
        :year="formValues.year ?? 'b1'"
        :joined-at="formValues.joinedAt"
        :get-grade-at="formValues.getGradeAt ?? ''"
        :birthday="formValues.birthday ?? ''"
        :disabled="isSubmitting"
        order="profile"
        required
        @update:grade="(value) => form.setFieldValue('grade', value)"
        @update:year="setYear"
        @update:joined-at="(value) => form.setFieldValue('joinedAt', value)"
        @update:get-grade-at="setGetGradeAt"
        @update:birthday="setBirthday" />

      <p v-if="message" :class="['text-sm font-medium', isError ? 'text-red-500' : 'text-green-500']">
        {{ message }}
      </p>

      <form.Subscribe>
        <template #default="{ canSubmit }">
          <p v-if="!canSubmit" class="text-sm font-medium text-red-500">入力内容を確認してください</p>

          <div class="gap-3 pt-2 flex">
            <button type="submit" class="btn-primary w-full" :disabled="isSubmitting || !canSubmit">
              {{ isSubmitting ? "保存中..." : "保存" }}
            </button>
            <button type="button" class="btn-secondary w-full" @click="cancelEdit">キャンセル</button>
          </div>
        </template>
      </form.Subscribe>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ArkErrors } from "arktype";
import hc from "@/lib/honoClient";
import ProfileFields from "@/components/account/ProfileFields.vue";
import { queryKeys } from "@/lib/queryKeys";
import { useForm } from "@tanstack/vue-form";
import { AccountMetadata, formatDateSlash, isProfileComplete, translateGrade, translateYear } from "share";
import { computed, ref, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

const profileFormSchema = AccountMetadata.omit("role");
type ProfileFormData = typeof profileFormSchema.infer;

const queryClient = useQueryClient();

const isEditing = ref(false);
const message = ref("");
const isError = ref(false);

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

function getDefaultValues(newProfile: typeof profile.value): ProfileFormData {
  return {
    grade: newProfile?.grade ?? 0,
    getGradeAt: newProfile?.getGradeAt ?? "",
    joinedAt: newProfile?.joinedAt ?? new Date().getFullYear(),
    year: newProfile?.year || "b1",
    birthday: newProfile?.birthday ?? "",
  };
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

const form = useForm({
  defaultValues: getDefaultValues(null),
  validators: {
    onChange: profileFormSchema,
    onSubmit: profileFormSchema,
  },
  onSubmit: async ({ value }) => {
    message.value = "";
    isError.value = false;

    try {
      await updateProfile({
        grade: value.grade ?? 0,
        getGradeAt: (value.getGradeAt || null) as `${number}-${number}-${number}` | null,
        joinedAt: value.joinedAt,
        year: (value.year || "b1") as `b${number}` | `m${number}` | `d${number}`,
        birthday: (value.birthday || null) as `${number}-${number}-${number}` | null,
      });
    } catch {
      // handled in onError
    }
  },
});
const formValues = form.useStore((state) => state.values);
const setYear = (value: string) => form.setFieldValue("year", value as ProfileFormData["year"]);
const setGetGradeAt = (value: string) => form.setFieldValue("getGradeAt", value as ProfileFormData["getGradeAt"]);
const setBirthday = (value: string) => form.setFieldValue("birthday", value as ProfileFormData["birthday"]);

// Sync server data without replacing values the user is currently editing.
watch(
  profile,
  (newProfile) => {
    if (!isEditing.value) form.reset(getDefaultValues(newProfile));
  },
  { immediate: true }
);

function startEditing() {
  form.reset(getDefaultValues(profile.value));
  message.value = "";
  isError.value = false;
  isEditing.value = true;
}

function cancelEdit() {
  form.reset(getDefaultValues(profile.value));
  isEditing.value = false;
  message.value = "";
  isError.value = false;
}
</script>
