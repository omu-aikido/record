<template>
  <AuthFlowLayout class="card max-w-md mx-auto h-full w-full">
    <template #heading>
      <h1 class="heading-1">認証コードの確認</h1>
    </template>

    <template #context>
      <p class="text-base text-subtext">メールアドレスに送信された認証コードを入力してください。</p>
    </template>

    <form class="stack" @submit.prevent="handleVerify">
      <Input
        id="code"
        v-model="code"
        label="認証コード"
        name="code"
        required
        placeholder="123456"
        :disabled="isLoading" />

      <div v-if="error" class="text-base text-red-500">
        {{ error }}
      </div>

      <button type="submit" class="btn-primary w-full" :disabled="isLoading">
        {{ isLoading ? "確認中..." : "確認する" }}
      </button>
    </form>
  </AuthFlowLayout>
</template>

<script setup lang="ts">
import AuthFlowLayout from "@/components/auth/AuthFlowLayout.vue";
import Input from "@/components/ui/UiInput.vue";
import { useClerk } from "@clerk/vue";
import { useRouter } from "vue-router";
import { useSignUpVerify } from "@/composable/useSignUpVerify";
import { onMounted, watch } from "vue";

const router = useRouter();
const clerk = useClerk();
const { code, isLoading, error, verifyCode } = useSignUpVerify();

const handleVerify = async () => {
  const success = await verifyCode();
  if (success) {
    router.push("/");
  }
};

const checkSignUpStatus = () => {
  // If clerk is not ready, we wait
  if (!clerk.value?.loaded) return;

  const signUp = clerk.value.client?.signUp;
  if (!signUp || signUp.status !== "missing_requirements") {
    // router.replace("/sign-up")
  }
};

onMounted(() => {
  document.title = "認証コードの確認 - 稽古記録";
  checkSignUpStatus();
});

watch(
  () => clerk.value?.loaded,
  () => {
    checkSignUpStatus();
  }
);
</script>
