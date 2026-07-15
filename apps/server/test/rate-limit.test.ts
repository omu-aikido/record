import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { RateLimit } from "@cloudflare/workers-types";
import { Hono } from "hono";

let userId: string | null = "member-user";
const getAuthCalls: unknown[][] = [];

mock.module("@clerk/hono", () => ({
  getAuth: (...args: unknown[]) => {
    getAuthCalls.push(args);
    return { isAuthenticated: true, userId };
  },
}));

const { enforceUserRateLimit } = await import("@/src/middleware/rateLimit");

const limitCalls: Array<{ key: string }> = [];
let allowed = true;
let downstreamCalls = 0;

const limiter: RateLimit = {
  limit: async (options) => {
    limitCalls.push(options);
    return { success: allowed };
  },
};

const app = new Hono<{ Bindings: { ACCOUNT_MUTATION_RATE_LIMIT: RateLimit } }>().patch("/account", async (c) => {
  const limited = await enforceUserRateLimit(c, c.env.ACCOUNT_MUTATION_RATE_LIMIT, "account-update");
  if (limited) return limited;

  downstreamCalls += 1;
  return c.json({ ok: true });
});

describe("enforceUserRateLimit", () => {
  beforeEach(() => {
    userId = "member-user";
    allowed = true;
    downstreamCalls = 0;
    limitCalls.length = 0;
    getAuthCalls.length = 0;
  });

  test("uses the authenticated user and operation as the rate-limit key, then allows downstream work", async () => {
    const response = await app.request(
      "http://localhost/account",
      { method: "PATCH" },
      {
        ACCOUNT_MUTATION_RATE_LIMIT: limiter,
      }
    );

    expect(response.status).toBe(200);
    expect(getAuthCalls).toEqual([[expect.anything(), { acceptsToken: "session_token" }]]);
    expect(limitCalls).toEqual([{ key: "member-user:account-update" }]);
    expect(downstreamCalls).toBe(1);
  });

  test("returns 429 and does not invoke downstream work when the binding denies the request", async () => {
    allowed = false;

    const response = await app.request(
      "http://localhost/account",
      { method: "PATCH" },
      {
        ACCOUNT_MUTATION_RATE_LIMIT: limiter,
      }
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(await response.json()).toEqual({ error: "Too Many Requests" });
    expect(limitCalls).toEqual([{ key: "member-user:account-update" }]);
    expect(downstreamCalls).toBe(0);
  });
});
