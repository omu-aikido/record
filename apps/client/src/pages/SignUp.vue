<template>
  <div class="p-4 flex items-center justify-center">
    <div class="card max-w-md mx-auto h-full w-full">
      <div class="p-4 pt-2">
        <h1 class="heading-1">サインアップ</h1>
      </div>
      <div class="p-6 pt-0">
        <ProgressIndicator :step="step" />
        <form @submit.prevent="handleSubmit">
          <div :class="step === 'basic' ? '' : 'hidden'">
            <SignUpStepBasic
              :form-values="formValues"
              :form-errors="formErrors"
              :is-sign-up-created="isSignUpCreated"
              :handle-next="handleNext"
              @update:form-value="setFormValue" />
          </div>

          <div :class="step === 'personal' ? '' : 'hidden'">
            <SignUpStepPersonal
              :form-values="formValues"
              :form-errors="formErrors"
              :is-sign-up-created="isSignUpCreated"
              :handle-next="handleNext"
              :prev-step="prevStep"
              @update:form-value="setFormValue" />
          </div>

          <div :class="step === 'profile' ? '' : 'hidden'">
            <SignUpStepProfile
              :form-values="formValues"
              :form-errors="formErrors"
              :is-sign-up-created="isSignUpCreated"
              :can-submit="!isSignUpCreated"
              :prev-step="prevStep"
              @update:form-value="setFormValue" />
          </div>

          <div class="my-4 col-span-3">
            <div id="clerk-captcha" />
          </div>
        </form>

        <div v-if="formErrors.general" class="mt-4 text-base text-red-500">
          {{ formErrors.general }}
        </div>
        <div v-if="clerkErrors.length > 0" class="mt-4 text-base text-red-500">
          <div v-for="(e, i) in clerkErrors" :key="i">
            {{ e.longMessage ?? e.message }}
          </div>
        </div>

        <hr class="my-6" />
        <div class="mt-2 text-base text-subtext text-center">
          既にアカウントをお持ちですか？<br />
          <RouterLink to="/sign-in" class="text-blue-500 hover:text-blue-600 underline"> こちら </RouterLink>
          からサインインしてください。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import ProgressIndicator from '@/components/signup/ProgressIndicator.vue';
import SignUpStepBasic from '@/components/signup/SignUpStepBasic.vue';
import SignUpStepPersonal from '@/components/signup/SignUpStepPersonal.vue';
import SignUpStepProfile from '@/components/signup/SignUpStepProfile.vue';
import { useRouter } from 'vue-router';
import { useSignUpForm } from '@/composable/useSignUpForm';

const router = useRouter();
const currentYear = new Date().getFullYear();

const {
  step,
  formValues,
  formErrors,
  clerkErrors,
  isSignUpCreated,
  validateStep,
  nextStep,
  prevStep,
  setFormValue,
  handleClerkSignUp,
} = useSignUpForm(currentYear);

onMounted(() => {
  document.title = 'サインアップ - 稽古記録';
});

const handleNext = () => {
  if (validateStep(step.value)) {
    nextStep();
  }
};

const handleSubmit = async () => {
  if (!validateStep('profile')) return;

  const success = await handleClerkSignUp();
  if (success) {
    router.push('/sign-up/verify');
  }
};
</script>
