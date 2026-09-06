import { describe, expect, mock, test } from "bun:test";

mock.module("vue-router", () => ({
  createWebHistory: () => ({}),
  createRouter: () => ({
    beforeEach: () => undefined,
  }),
}));

for (const specifier of ["@/pages/Home.vue", "@/pages/NotFound.vue"]) {
  mock.module(specifier, () => ({ default: {} }));
}

const { getNavigationOnClerkFailure, waitForClerk } = await import("../../src/router/index");

describe("Clerk router waiting", () => {
  test("resolves when Clerk becomes loaded before the deadline", async () => {
    let now = 0;
    let checks = 0;
    const clerk = { loaded: true, user: null };

    const result = await waitForClerk(
      () => {
        checks += 1;
        return checks < 3 ? undefined : clerk;
      },
      {
        timeoutMs: 250,
        intervalMs: 100,
        now: () => now,
        sleep: async (delayMs) => {
          now += delayMs;
        },
      }
    );

    expect(result).toBe(clerk);
    expect(checks).toBe(3);
  });

  test("rejects after a finite wait when Clerk never loads", async () => {
    let now = 0;
    const waits: number[] = [];

    await expect(
      waitForClerk(() => undefined, {
        timeoutMs: 250,
        intervalMs: 100,
        now: () => now,
        sleep: async (delayMs) => {
          waits.push(delayMs);
          now += delayMs;
        },
      })
    ).rejects.toThrow("Clerk failed to load before the timeout");

    expect(waits).toEqual([100, 100, 50]);
  });
});

describe("Clerk failure navigation", () => {
  test("redirects protected routes to sign-in instead of allowing navigation", () => {
    expect(getNavigationOnClerkFailure(true, false)).toEqual({ name: "signIn" });
    expect(getNavigationOnClerkFailure(false, true)).toEqual({ name: "signIn" });
  });

  test("allows public routes when Clerk cannot load", () => {
    expect(getNavigationOnClerkFailure(false, false)).toBe(true);
  });
});
