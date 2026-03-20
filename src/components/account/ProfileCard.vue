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
      <div class="flex-between">
        <h3 class="text-lg font-bold text">プロフィール</h3>
        <button type="button" class="btn-secondary px-3 py-1.5 text-sm" @click="isEditing = true">編集</button>
      </div>
      <div class="gap-3 text-subtext flex flex-col">
        <div class="py-1 flex items-center justify-between">
          <span class="text-subtext">級段位</span>
          <span class="font-medium text">{{ translateGrade(profile?.grade ?? '') || '-' }}</span>
        </div>
        <div class="py-1 flex items-center justify-between">
          <span class="text-subtext">取得日</span>
          <span class="font-medium text">
            {{ profile?.getGradeAt ? new Date(profile.getGradeAt).toLocaleDateString() : '-' }}
          </span>
        </div>
        <div class="py-1 flex items-center justify-between">
          <span class="text-subtext">入部年</span>
          <span class="font-medium text">{{ profile?.joinedAt || '-' }}</span>
        </div>
        <div class="py-1 flex items-center justify-between">
          <span class="text-subtext">学年</span>
          <span class="font-medium text">{{ translateYear(profile?.year ?? '') || '-' }}</span>
        </div>
      </div>
    </div>

    <form v-else class="stack" @submit.prevent="handleSubmit">
      <div class="gap-1.5 flex flex-col">
        <label class="form-label block">級段位</label>
        <Listbox v-model="formData.grade">
          <div class="mt-1 relative">
            <ListboxButton
              class="rounded-md bg-surface0 border-overlay0 px-3 py-2 pr-10 text text focus:ring-blue-500 relative w-full cursor-default border text-left focus:ring-2 focus:outline-none">
              <span class="block overflow-hidden text-ellipsis whitespace-nowrap">{{
                translateGrade(formData.grade)
              }}</span>
              <span class="inset-0 right-0 pr-2 pointer-events-none absolute flex items-center justify-end">
                <ChevronsUpDownIcon class="w-4 h-4 text-subtext" aria-hidden="true" />
              </span>
            </ListboxButton>
            <transition
              leave-active-class="transition-opacity duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0">
              <ListboxOptions
                class="mt-1 max-h-60 rounded-md bg-surface0 p-1 shadow-md border-overlay0 absolute z-10 w-full overflow-auto border">
                <ListboxOption
                  v-for="gradeOption in gradeOptions"
                  :key="gradeOption.grade"
                  v-slot="{ active, selected }"
                  :value="gradeOption.grade">
                  <li :class="['py-2 px-4 pr-10 text relative cursor-default select-none', active ? 'bg-overlay' : '']">
                    <span
                      :class="['block overflow-hidden text-ellipsis whitespace-nowrap', selected ? 'font-medium' : '']">
                      {{ gradeOption.name }}
                    </span>
                    <span v-if="selected" class="inset-0 left-0 pl-3 text-blue-500 absolute flex items-center">
                      <CheckIcon class="w-4 h-4" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>
      </div>

      <Input v-model="formData.getGradeAt" type="date" label="取得日" />

      <Input v-model="formData.joinedAt" type="number" label="入部年" min="2020" max="9999" />

      <div class="gap-1.5 flex flex-col">
        <label class="text-sm font-medium text-subtext block">学年</label>
        <Listbox v-model="formData.year">
          <div class="mt-1 relative">
            <ListboxButton
              class="rounded-md bg-surface0 border-overlay0 px-3 py-2 pr-10 text text focus:ring-blue-500 relative w-full cursor-default border text-left focus:ring-2 focus:outline-none">
              <span class="block overflow-hidden text-ellipsis whitespace-nowrap">{{
                translateYear(formData.year)
              }}</span>
              <span class="inset-0 right-0 pr-2 pointer-events-none absolute flex items-center justify-end">
                <ChevronsUpDownIcon class="w-4 h-4 text-subtext" aria-hidden="true" />
              </span>
            </ListboxButton>
            <transition
              leave-active-class="transition-opacity duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0">
              <ListboxOptions
                class="mt-1 max-h-60 rounded-md bg-surface0 p-1 shadow-md border-overlay0 absolute z-10 w-full overflow-auto border">
                <ListboxOption
                  v-for="yearOption in yearOptions"
                  :key="yearOption.year"
                  v-slot="{ active, selected }"
                  :value="yearOption.year">
                  <li :class="['py-2 px-4 pr-10 text relative cursor-default select-none', active ? 'bg-overlay' : '']">
                    <span
                      :class="['block overflow-hidden text-ellipsis whitespace-nowrap', selected ? 'font-medium' : '']">
                      {{ yearOption.name }}
                    </span>
                    <span v-if="selected" class="inset-0 left-0 pl-3 text-blue-500 absolute flex items-center">
                      <CheckIcon class="w-4 h-4" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>
      </div>

      <p v-if="message" :class="['text-sm font-medium', isError ? 'text-red-500' : 'text-green-500']">
        {{ message }}
      </p>

      <div class="gap-3 pt-2 flex">
        <button type="submit" class="btn-primary w-full" :disabled="isSubmitting">
          {{ isSubmitting ? '保存中...' : '保存' }}
        </button>
        <button type="button" class="btn-secondary w-full" @click="cancelEdit">キャンセル</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { AccountMetadata } from '@/share/types/account';
import { ArkErrors } from 'arktype';
import hc from '@/src/lib/honoClient';
import Input from '@/src/components/ui/UiInput.vue';
import { queryKeys } from '@/src/lib/queryKeys';
import { computed, reactive, ref, watch } from 'vue';
import { grade, translateGrade } from '@/share/lib/grade';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue';
import { translateYear, year } from '@/share/lib/year';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

interface FormData {
  grade: number;
  getGradeAt: string;
  joinedAt: number;
  year: `b${number}` | `m${number}` | `d${number}`;
}

const queryClient = useQueryClient();

const isEditing = ref(false);
const message = ref('');
const isError = ref(false);
const gradeOptions = grade;
const yearOptions = year;

const formData = reactive<FormData>({
  grade: 0,
  getGradeAt: '',
  joinedAt: new Date().getFullYear(),
  year: 'b1',
});

// Query - Returns { profile: ... } to match server response shape
const { data: profileData } = useQuery({
  queryKey: queryKeys.user.clerk.profile(),
  queryFn: async () => {
    const res = await hc.user.clerk.profile.$get();
    if (!res.ok) throw new Error('Failed to fetch profile');
    const data = await res.json();
    if (data.profile) {
      const profileParsed = AccountMetadata(data.profile);
      if (profileParsed instanceof ArkErrors) {
        console.error(profileParsed);
        throw new Error('Invalid profile data');
      }
      return { profile: profileParsed };
    }
    return { profile: null };
  },
});

const profile = computed(() => profileData.value?.profile ?? null);

// Sync form data
watch(
  profile,
  (newProfile) => {
    if (newProfile) {
      formData.grade = Number(newProfile.grade) || 0;
      formData.getGradeAt = newProfile.getGradeAt || '';
      formData.joinedAt = Number(newProfile.joinedAt) || new Date().getFullYear();
      formData.year = newProfile.year || 'b1';
    }
  },
  { immediate: true }
);

function updateFormData() {
  if (profile.value) {
    formData.grade = Number(profile.value.grade) || 0;
    formData.getGradeAt = profile.value.getGradeAt || '';
    formData.joinedAt = Number(profile.value.joinedAt) || new Date().getFullYear();
    formData.year = profile.value.year || 'b1';
  }
}

// Mutation
const { mutateAsync: updateProfile, isPending: isSubmitting } = useMutation({
  mutationFn: async (json: {
    grade: number;
    getGradeAt: `${number}-${number}-${number}` | null;
    joinedAt: number;
    year: `b${number}` | `m${number}` | `d${number}`;
  }) => {
    const res = await hc.user.clerk.profile.$patch({ json });
    if (!res.ok) throw new Error('プロフィールの更新に失敗しました');
    return res.json();
  },
  onSuccess: (responseData) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.clerk.profile() });

    if (responseData.profile) {
      const validatedProfile = AccountMetadata({
        role: responseData.profile.role,
        grade: responseData.profile.grade,
        getGradeAt: responseData.profile.getGradeAt,
        joinedAt: responseData.profile.joinedAt,
        year: responseData.profile.year,
      });
      if (validatedProfile instanceof ArkErrors) {
        console.error(validatedProfile);
      } else {
        // Set cache with consistent { profile: ... } shape
        queryClient.setQueryData(queryKeys.user.clerk.profile(), { profile: validatedProfile });
      }
    }

    message.value = 'プロフィールを更新しました';
    isEditing.value = false;
  },
  onError: (error) => {
    isError.value = true;
    message.value = error instanceof Error ? error.message : 'プロフィールの更新に失敗しました';
  },
});

async function handleSubmit() {
  message.value = '';
  isError.value = false;
  try {
    const getGradeAtValue = (formData.getGradeAt || null) as `${number}-${number}-${number}` | null;

    const updateData = {
      grade: formData.grade,
      getGradeAt: getGradeAtValue,
      joinedAt: formData.joinedAt,
      year: formData.year as `b${number}` | `m${number}` | `d${number}`,
    };

    await updateProfile(updateData);
  } catch {
    // handled in onError
  }
}

function cancelEdit() {
  updateFormData();
  isEditing.value = false;
  message.value = '';
}
</script>
