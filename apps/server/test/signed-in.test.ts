import { describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";

let authenticated = true;
let userId: string | null = "member-user";
const getAuthCalls: unknown[][] = [];

mock.module("@clerk/hono", () => ({
  getAuth: (...args: unknown[]) => {
    getAuthCalls.push(args);
    return { isAuthenticated: authenticated, userId };
  },
}));

const { ensureSignedIn } = await import("@/src/middleware/signedIn");

const app = new Hono().use("*", ensureSignedIn).get("/", (c) => c.json({ ok: true }));

describe("ensureSignedIn", () => {
  test("rejects an authenticated non-user token", async () => {
    authenticated = true;
    userId = null;
    getAuthCalls.length = 0;

    const response = await app.request("http://localhost/");

    expect(response.status).toBe(401);
    expect(getAuthCalls).toEqual([[expect.anything(), { acceptsToken: "session_token" }]]);
  });

  test("allows an authenticated user session", async () => {
    authenticated = true;
    userId = "member-user";
    getAuthCalls.length = 0;

    const response = await app.request("http://localhost/");

    expect(response.status).toBe(200);
    expect(getAuthCalls).toEqual([[expect.anything(), { acceptsToken: "session_token" }]]);
  });
});
