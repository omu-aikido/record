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

const activityLimitCalls: Array<{ key: string }> = [];
const deniedActivityLimiter: RateLimit = {
  limit: async (options) => {
    activityLimitCalls.push(options);
    return { success: false };
  },
};
const bulkDeleteLimitCalls: Array<{ key: string }> = [];
const deniedBulkDeleteLimiter: RateLimit = {
  limit: async (options) => {
    bulkDeleteLimitCalls.push(options);
    return { success: false };
  },
};

const testEnv = {
  ACTIVITY_MUTATION_RATE_LIMIT: deniedActivityLimiter,
  BULK_DELETE_RATE_LIMIT: deniedBulkDeleteLimiter,
} as Env;

describe("activity mutation rate-limit routing", () => {
  beforeEach(() => {
    insertMock.mockClear();
    deleteMock.mockClear();
    activityLimitCalls.length = 0;
    bulkDeleteLimitCalls.length = 0;
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
    expect(res.headers.get("Retry-After")).toBe("60");
    expect(activityLimitCalls).toEqual([{ key: "member-user:activity-create" }]);
    expect(bulkDeleteLimitCalls).toEqual([]);
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
    expect(res.headers.get("Retry-After")).toBe("60");
    expect(activityLimitCalls).toEqual([]);
    expect(bulkDeleteLimitCalls).toEqual([{ key: "member-user:activity-delete" }]);
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
