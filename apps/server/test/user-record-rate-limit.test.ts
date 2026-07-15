import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { RateLimit } from "@cloudflare/workers-types";

const insertMock = mock(() => ({ values: mock(async () => undefined) }));
const deleteMock = mock(() => ({
  where: mock(() => ({ returning: mock(async () => []) })),
}));

mock.module("@clerk/hono", () => ({
  getAuth: () => ({
    userId: "member-user",
    isAuthenticated: true,
  }),
}));

mock.module("@/src/db/drizzle", () => ({
  dbClient: () => ({
    insert: insertMock,
    delete: deleteMock,
  }),
}));

const { record } = await import("@/src/app/user/record");

const limitCalls: Array<{ key: string }> = [];
const deniedLimiter: RateLimit = {
  limit: async (options) => {
    limitCalls.push(options);
    return { success: false };
  },
};

const testEnv = {
  ACTIVITY_MUTATION_RATE_LIMIT: deniedLimiter,
  BULK_DELETE_RATE_LIMIT: deniedLimiter,
} as Env;

describe("activity mutation rate-limit routing", () => {
  beforeEach(() => {
    insertMock.mockClear();
    deleteMock.mockClear();
    limitCalls.length = 0;
  });

  test("rejects activity creation before invoking the database insert", async () => {
    const res = await record.request(
      "http://localhost/",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ date: "2025-01-01", period: 1.5 }),
      },
      testEnv
    );

    expect(res.status).toBe(429);
    expect(limitCalls).toEqual([{ key: "member-user:activity-create" }]);
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("rejects activity deletion before invoking the database delete", async () => {
    const res = await record.request(
      "http://localhost/",
      {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: ["activity-1"] }),
      },
      testEnv
    );

    expect(res.status).toBe(429);
    expect(limitCalls).toEqual([{ key: "member-user:activity-delete" }]);
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
