import type { ClerkAPIError } from '@clerk/vue/types';
import { useClerk } from '@clerk/vue';
import { type Ref, ref } from 'vue';

function extractClerkError(err: unknown): string {
  const clerkError = (err as { errors?: ClerkAPIError[] }).errors?.[0];
  return clerkError?.longMessage || clerkError?.message || 'An error occurred.';
}

function checkClerkLoaded(clerk: ReturnType<typeof useClerk>, error: Ref<string | null>): boolean {
  if (!clerk.value?.loaded) {
    error.value = 'Authentication service is not available.';
    return false;
  }
  return true;
}

async function signIn(
  clerk: ReturnType<typeof useClerk>,
  email: Ref<string>,
  password: Ref<string>,
  isLoading: Ref<boolean>,
  error: Ref<string | null>,
  needsVerification: Ref<boolean>
): Promise<boolean> {
  if (!checkClerkLoaded(clerk, error)) return false;

  isLoading.value = true;
  error.value = null;

  try {
    const signInAttempt = await clerk.value?.client?.signIn.create({
      identifier: email.value,
      password: password.value,
    });

    if (!signInAttempt) throw new Error('Sign in failed.');

    if (signInAttempt.status === 'complete') {
      await clerk.value?.setActive({ session: signInAttempt.createdSessionId });
      return true;
    }

    if (signInAttempt.status === 'needs_second_factor') {
      needsVerification.value = true;
      return false;
    }
  } catch (err: unknown) {
    error.value = extractClerkError(err) || 'Sign in failed.';
  } finally {
    isLoading.value = false;
  }
  return false;
}

async function verifyCode(
  clerk: ReturnType<typeof useClerk>,
  code: Ref<string>,
  isLoading: Ref<boolean>,
  error: Ref<string | null>
): Promise<boolean> {
  if (!checkClerkLoaded(clerk, error)) return false;

  isLoading.value = true;
  error.value = null;

  try {
    const signInAttempt = await clerk.value?.client?.signIn.attemptSecondFactor({
      strategy: 'email_code',
      code: code.value,
    });

    if (!signInAttempt) throw new Error('Verification failed.');

    if (signInAttempt.status === 'complete') {
      await clerk.value?.setActive({ session: signInAttempt.createdSessionId });
      return true;
    }
  } catch (err: unknown) {
    error.value = extractClerkError(err) || 'Verification failed.';
  } finally {
    isLoading.value = false;
  }
  return false;
}

async function signInWithDiscord(
  clerk: ReturnType<typeof useClerk>,
  isLoading: Ref<boolean>,
  error: Ref<string | null>
): Promise<void> {
  if (!checkClerkLoaded(clerk, error)) return;
  isLoading.value = true;
  error.value = null;
  try {
    await clerk.value?.client?.signIn.authenticateWithRedirect({
      strategy: 'oauth_discord',
      redirectUrl: '/',
      redirectUrlComplete: '/',
    });
  } catch (err: unknown) {
    error.value = extractClerkError(err) || 'Discord authentication failed.';
  } finally {
    isLoading.value = false;
  }
}

function reset(
  email: Ref<string>,
  password: Ref<string>,
  code: Ref<string>,
  error: Ref<string | null>,
  needsVerification: Ref<boolean>
): void {
  email.value = '';
  password.value = '';
  code.value = '';
  error.value = null;
  needsVerification.value = false;
}

export function useSignIn() {
  const clerk = useClerk();
  const email = ref('');
  const password = ref('');
  const code = ref('');
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const needsVerification = ref(false);

  const signInFn = () => signIn(clerk, email, password, isLoading, error, needsVerification);
  const verifyCodeFn = () => verifyCode(clerk, code, isLoading, error);
  const signInWithDiscordFn = () => signInWithDiscord(clerk, isLoading, error);
  const resetFn = () => reset(email, password, code, error, needsVerification);

  return {
    email,
    password,
    code,
    isLoading,
    error,
    needsVerification,
    signIn: signInFn,
    verifyCode: verifyCodeFn,
    signInWithDiscord: signInWithDiscordFn,
    reset: resetFn,
  };
}
