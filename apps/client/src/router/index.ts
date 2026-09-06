import { createRouter, createWebHistory } from "vue-router";

import { getPublicMetadataRole, isAdminRole } from "./adminGuard";

import HomeView from "@/pages/Home.vue";
import NotFoundView from "@/pages/NotFound.vue";
// Lazy load other views
const RecordView = () => import("@/pages/Record.vue");
const SignInView = () => import("@/pages/SignIn.vue");
const SignUpView = () => import("@/pages/SignUp.vue");
const SignUpVerifyView = () => import("@/pages/SignUpVerify.vue");
const ReleasesView = () => import("@/pages/Releases.vue");
const UserView = () => import("@/pages/account/User.vue");
const AdminAccountsView = () => import("@/pages/admin/Accounts.vue");

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: "/record",
      name: "record",
      component: RecordView,
      meta: { requiresAuth: true },
    },
    {
      path: "/sign-in",
      name: "signIn",
      component: SignInView,
      meta: { requiresAuth: false },
    },
    {
      path: "/sign-up",
      name: "signUp",
      component: SignUpView,
      meta: { requiresAuth: false },
    },
    {
      path: "/sign-up/verify",
      name: "signUpVerify",
      component: SignUpVerifyView,
      meta: { requiresAuth: false },
    },
    {
      path: "/releases",
      name: "releases",
      component: ReleasesView,
      meta: { requiresAuth: true },
    },
    {
      path: "/account",
      name: "accountPortal",
      component: UserView,
      meta: { requiresAuth: true },
    },
    {
      path: "/admin",
      name: "adminDashboard",
      component: () => import("@/pages/admin/Dashboard.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/accounts",
      name: "adminAccounts",
      component: AdminAccountsView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/users/:userId",
      name: "adminUserDetail",
      component: () => import("@/pages/admin/UserDetail.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "notFound",
      component: NotFoundView,
      meta: { requiresAuth: false },
    },
  ],
});

export interface ClerkUser {
  publicMetadata: unknown;
}

export interface ClerkClient {
  user: ClerkUser | null | undefined;
  loaded: boolean;
}

export interface ClerkWaitOptions {
  timeoutMs?: number;
  intervalMs?: number;
  sleep?: (delayMs: number) => Promise<void>;
  now?: () => number;
}

const CLERK_WAIT_TIMEOUT_MS = 5_000;
const CLERK_POLL_INTERVAL_MS = 100;

const sleep = (delayMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });

// Clerkが利用可能になるまで待つ。ロードに失敗した場合は有限時間で拒否する。
export function waitForClerk(
  getClerk: () => ClerkClient | null | undefined = () => window.Clerk,
  options: ClerkWaitOptions = {}
): Promise<ClerkClient> {
  const timeoutMs = options.timeoutMs ?? CLERK_WAIT_TIMEOUT_MS;
  const intervalMs = options.intervalMs ?? CLERK_POLL_INTERVAL_MS;
  const wait = options.sleep ?? sleep;
  const now = options.now ?? Date.now;
  const deadline = now() + timeoutMs;

  const checkClerk = async (): Promise<ClerkClient> => {
    const clerk = getClerk();
    if (clerk?.loaded === true) return clerk;

    const remainingMs = deadline - now();
    if (remainingMs <= 0) {
      throw new Error("Clerk failed to load before the timeout");
    }

    await wait(Math.min(intervalMs, remainingMs));
    return checkClerk();
  };

  return checkClerk();
}

export function getNavigationOnClerkFailure(requiresAuth: boolean, requiresAdmin: boolean): true | { name: "signIn" } {
  return requiresAuth || requiresAdmin ? { name: "signIn" } : true;
}

// ナビゲーションガード：Clerkの認証を確認
router.beforeEach(async (to, _from) => {
  const requiresAuth = to.meta.requiresAuth === true;
  const requiresAdmin = to.meta.requiresAdmin === true;

  try {
    const clerk = await waitForClerk();
    const isAuthenticated = clerk.user !== null && clerk.user !== undefined;

    // 1. 認証が必要だが未ログイン
    if (requiresAuth && !isAuthenticated) {
      return { name: "signIn" };
    }

    // 2. 管理者権限チェック
    if (requiresAdmin) {
      if (!isAuthenticated) {
        return { name: "signIn" };
      }

      const roleValue = getPublicMetadataRole(clerk.user?.publicMetadata);
      const isAdmin = isAdminRole(roleValue);

      if (!isAdmin) {
        return { name: "home" };
      }
    }

    // 3. ログイン済みでサインイン/サインアップ画面に行こうとした場合
    if (isAuthenticated && (to.name === "signIn" || to.name === "signUp" || to.name === "signUpVerify")) {
      return { name: "home" };
    }

    return true;
  } catch (error) {
    console.error("Router guard error:", error);
    return getNavigationOnClerkFailure(requiresAuth, requiresAdmin);
  }
});

export default router;
