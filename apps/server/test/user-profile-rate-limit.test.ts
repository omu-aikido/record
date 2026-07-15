import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { RateLimit } from "@cloudflare/workers-types";

const patchProfileMock = mock(async () => ({
  id: "member-user",
  publicMetadata: {
    role: "member",
    grade: 0,
    getGradeAt: null,
    joinedAt: 2024,
    year: "b1",
    birthday: "2001-02-03",
  },
}));

mock.module("@clerk/hono", () => ({
  getAuth: () => ({
    userId: "member-user",
    isAuthenticated: true,
  }),
}));

mock.module("@/src/clerk/profile", () => ({
  getProfile: mock(async () => null),
  getUser: mock(async () => null),
  patchProfile: patchProfileMock,
}));

const { clerk } = await import("@/src/app/user/clerk");

const limitCalls: Array<{ key: string }> = [];
const deniedProfileLimiter: RateLimit = {
  limit: async (options) => {
    limitCalls.push(options);
    return { success: false };
  },
};

const testEnv = {
  ACCOUNT_MUTATION_RATE_LIMIT: deniedProfileLimiter,
} as Env;

describe("PATCH /clerk/profile rate limit", () => {
  beforeEach(() => {
    patchProfileMock.mockClear();
    limitCalls.length = 0;
  });

  test("rejects before patchProfile updates Clerk metadata", async () => {
    const res = await clerk.request(
      "http://localhost/profile",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          grade: 0,
          getGradeAt: null,
          joinedAt: 2024,
          year: "b1",
          birthday: "2001-02-03",
        }),
      },
      testEnv
    );

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    expect(limitCalls).toEqual([{ key: "member-user:profile-update" }]);
    expect(patchProfileMock).not.toHaveBeenCalled();
  });
});
