import { describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";

let authenticated = true;
let userId: string | null = "member-user";
let tokenType: "session_token" | "api_key" = "session_token";
const getAuthCalls: unknown[][] = [];

mock.module("@clerk/hono", () => ({
  getAuth: (...args: unknown[]) => {
    getAuthCalls.push(args);
    const options = args[1] as { acceptsToken?: string } | undefined;
    if (options?.acceptsToken !== tokenType) {
      return { isAuthenticated: false, userId: null };
    }
    return { isAuthenticated: authenticated, userId };
  },
}));

const { ensureSignedIn } = await import("@/src/middleware/signedIn");

const app = new Hono().use("*", ensureSignedIn).get("/", (c) => c.json({ ok: true }));

describe("ensureSignedIn", () => {
  test("rejects an authenticated machine token", async () => {
    authenticated = true;
    userId = "machine-user";
    tokenType = "api_key";
    getAuthCalls.length = 0;

    const response = await app.request("http://localhost/");

    expect(response.status).toBe(401);
    expect(getAuthCalls).toEqual([[expect.anything(), { acceptsToken: "session_token" }]]);
  });

  test("allows an authenticated user session", async () => {
    authenticated = true;
    userId = "member-user";
    tokenType = "session_token";
    getAuthCalls.length = 0;

    const response = await app.request("http://localhost/");

    expect(response.status).toBe(200);
    expect(getAuthCalls).toEqual([[expect.anything(), { acceptsToken: "session_token" }]]);
  });
});
