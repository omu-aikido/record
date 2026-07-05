import { describe, expect, mock, test } from "bun:test";

const whereMock = mock(async () => [{ totalPeriod: 4.5 }]);
const fromMock = mock(() => ({ where: whereMock }));
const selectMock = mock(() => ({ from: fromMock }));

mock.module("@hono/clerk-auth", () => ({
  getAuth: () => ({
    userId: "member-user",
    isAuthenticated: true,
  }),
}));

mock.module("@/src/db/drizzle", () => ({
  dbClient: () => ({
    select: selectMock,
  }),
}));

mock.module("@/src/clerk/profile", () => ({
  getProfile: async () => ({
    grade: 0,
    getGradeAt: null,
    joinedAt: 2024,
    year: "b1",
    birthday: "2001-02-03",
  }),
}));

const { record } = await import("@/src/app/user/record");

const testEnv = {
  CLERK_SECRET_KEY: "test-secret",
} as Env;

describe("GET /count", () => {
  test("returns practice count since the current grade baseline", async () => {
    const res = await record.request("http://localhost/count", {}, testEnv);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      practiceCount: 3,
      totalPeriod: 4.5,
      since: "2024-04-01",
    });
  });
});
