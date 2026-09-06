import { describe, expect, mock, test } from "bun:test";

type RegisteredGuard = (...args: unknown[]) => unknown;
let registeredGuard: RegisteredGuard | undefined;

mock.module("vue-router", () => ({
  createWebHistory: () => ({}),
  createRouter: () => ({
    beforeEach: (guard: RegisteredGuard) => {
      registeredGuard = guard;
    },
  }),
}));

for (const specifier of ["@/pages/Home.vue", "@/pages/NotFound.vue"]) {
  mock.module(specifier, () => ({ default: {} }));
}

const { navigationGuard, waitForClerk } = await import("../../src/router/index");

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

describe("Clerk navigation guard", () => {
  const getRegisteredGuard = () => {
    if (!registeredGuard) throw new Error("Router guard was not registered");
    return registeredGuard as unknown as (
      to: Parameters<typeof navigationGuard>[0],
      from: Parameters<typeof navigationGuard>[1]
    ) => ReturnType<typeof navigationGuard>;
  };

  const from = {} as Parameters<typeof navigationGuard>[1];
  const route = (meta: { requiresAuth?: boolean; requiresAdmin?: boolean }, name = "record") =>
    ({ meta, name }) as Parameters<typeof navigationGuard>[0];

  test("applies the registered guard after Clerk loads", async () => {
    const guard = getRegisteredGuard();
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { Clerk: { loaded: true, user: null } },
    });

    try {
      await expect(guard(route({ requiresAuth: true }), from)).resolves.toEqual({ name: "signIn" });
    } finally {
      Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
    }
  });

  test("fails closed for protected routes when Clerk fails", async () => {
    const waitThatFails = async () => {
      throw new Error("Clerk failed to load before the timeout");
    };
    const originalConsoleError = console.error;
    console.error = () => {};

    try {
      await expect(navigationGuard(route({ requiresAuth: true }), from, waitThatFails)).resolves.toEqual({
        name: "signIn",
      });
      await expect(navigationGuard(route({ requiresAdmin: true }), from, waitThatFails)).resolves.toEqual({
        name: "signIn",
      });
      await expect(navigationGuard(route({}, "notFound"), from, waitThatFails)).resolves.toBe(true);
    } finally {
      console.error = originalConsoleError;
    }
  });
});
