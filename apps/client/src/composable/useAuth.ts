import { computed } from "vue";
import type { Ref } from "vue";
import type { UserResource } from "@clerk/vue/types";
import { useClerk, useAuth as useClerkAuth, useUser } from "@clerk/vue";

export function useAuth() {
  const clerk = useClerk();
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useClerkAuth();

  const isAuthenticated = computed(() => isSignedIn.value && !!user.value);

  const isLoading = computed(() => !authLoaded.value || !userLoaded.value);
  const isLoaded = computed(() => authLoaded.value && userLoaded.value);

  const signOut = async () => {
    if (!clerk.value) return;
    await clerk.value.signOut();
  };

  return {
    user: user as Ref<UserResource | null | undefined>,
    isAuthenticated,
    isLoading,
    isLoaded,
    signOut,
  };
}
