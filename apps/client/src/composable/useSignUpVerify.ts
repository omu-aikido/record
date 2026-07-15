import type { ClerkAPIError } from "@clerk/vue/types";
import { ref } from "vue";
import { useClerk } from "@clerk/vue";

export function useSignUpVerify() {
  const clerk = useClerk();
  const code = ref("");
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const verifyCode = async () => {
    if (!clerk.value?.client?.signUp) {
      error.value = "Sign up process not started.";
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const signUpAttempt = await clerk.value.client.signUp.attemptEmailAddressVerification({
        code: code.value,
      });

      if (signUpAttempt.status === "complete") {
        await clerk.value.setActive({
          session: signUpAttempt.createdSessionId,
        });
        return true;
      }
      // This case should ideally not be reached if the code is correct
      if (import.meta.env.DEV) console.error("Sign up verification did not complete");
      error.value = "Verification failed. Please try again.";
      return false;
    } catch (err: unknown) {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      const clerkError = (err as { errors?: ClerkAPIError[] }).errors?.[0];
      error.value = clerkError?.longMessage ?? clerkError?.message ?? "An unknown error occurred.";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return { code, isLoading, error, verifyCode };
}
