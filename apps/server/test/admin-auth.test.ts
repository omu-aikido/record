import { beforeEach, describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";

mock.module("@clerk/hono", () => ({
  getAuth: (
    c: { req: { header: (key: string) => string | null } },
    options: { acceptsToken?: string },
  ) => {
    if (c.req.header("x-token-type") !== options.acceptsToken) {
      return { isAuthenticated: false, userId: null };
    }
    return { isAuthenticated: true, userId: "admin-user" };
  },
}));

const getProfileMock = mock(async () => ({ role: "admin" }));
mock.module("@/src/clerk/profile", () => ({
  getProfile: getProfileMock,
}));

const { ensureAdmin } = await import("@/src/middleware/admin");

const app = new Hono<{ Bindings: Env }>().use("*", ensureAdmin).get("/", (c) => c.json({ ok: true }));

describe("ensureAdmin", () => {
  beforeEach(() => {
    getProfileMock.mockClear();
  });

  test("allows a management user session", async () => {
    const response = await app.request("http://localhost/", { headers: { "x-token-type": "session_token" } });

    expect(response.status).toBe(200);
  });

  test("rejects a machine token before profile lookup", async () => {
    const response = await app.request("http://localhost/", { headers: { "x-token-type": "api_key" } });

    expect(response.status).toBe(401);
    expect(getProfileMock).not.toHaveBeenCalled();
  });
});
