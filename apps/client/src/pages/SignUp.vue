<template>
  <AuthFlowLayout class="card max-w-md mx-auto h-full w-full">
    <template #heading>
      <h1 class="heading-1">サインアップ</h1>
    </template>

    <template #context>
      <ProgressIndicator :step="step" />
    </template>

    <form @submit.prevent="handleSubmit">
      <template v-if="step === 'basic'">
        <SignUpStepBasic
          :form-values="formValues"
          :form-errors="formErrors"
          :is-sign-up-created="isSignUpCreated"
          :handle-next="handleNext"
          @update:form-value="setFormValue" />
      </template>

      <template v-if="step === 'personal'">
        <SignUpStepPersonal
          :form-values="formValues"
          :form-errors="formErrors"
          :is-sign-up-created="isSignUpCreated"
          :handle-next="handleNext"
          :prev-step="prevStep"
          @update:form-value="setFormValue" />
      </template>

      <template v-if="step === 'profile'">
        <SignUpStepProfile
          :form-values="formValues"
          :form-errors="formErrors"
          :is-sign-up-created="isSignUpCreated"
          :can-submit="!isSignUpCreated"
          :prev-step="prevStep"
          @update:form-value="setFormValue" />
      </template>
    </form>

    <div v-if="formErrors.general || clerkErrors.length > 0" class="gap-4 text-base text-red-500 flex flex-col">
      <div v-if="formErrors.general">{{ formErrors.general }}</div>
      <div v-if="clerkErrors.length > 0">
        <div v-for="(e, i) in clerkErrors" :key="i">
          {{ e.longMessage ?? e.message }}
        </div>
      </div>
    </div>

    <template #continuation>
      <div class="text-base text-subtext text-center">
        既にアカウントをお持ちですか？<br />
        <RouterLink to="/sign-in" class="text-blue-500 hover:text-blue-600 underline"> こちら </RouterLink>
        からサインインしてください。
      </div>
    </template>
  </AuthFlowLayout>
</template>

<script setup lang="ts">
import AuthFlowLayout from "@/components/auth/AuthFlowLayout.vue";
import { onMounted } from "vue";
import ProgressIndicator from "@/components/signup/ProgressIndicator.vue";
import SignUpStepBasic from "@/components/signup/SignUpStepBasic.vue";
import SignUpStepPersonal from "@/components/signup/SignUpStepPersonal.vue";
import SignUpStepProfile from "@/components/signup/SignUpStepProfile.vue";
import { useRouter } from "vue-router";
import { useSignUpForm } from "@/composable/useSignUpForm";

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
  document.title = "サインアップ - 稽古記録";
});

const handleNext = () => {
  if (validateStep(step.value)) {
    nextStep();
  }
};

const handleSubmit = async () => {
  if (!validateStep("profile")) return;

  const success = await handleClerkSignUp();
  if (success) {
    router.push("/sign-up/verify");
  }
};
</script>
