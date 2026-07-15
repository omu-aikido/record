import { describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";

let authenticated = true;
let userId: string | null = "member-user";

mock.module("@hono/clerk-auth", () => ({
  getAuth: () => ({ isAuthenticated: authenticated, userId }),
}));

const { ensureSignedIn } = await import("@/src/middleware/signedIn");

const app = new Hono().use("*", ensureSignedIn).get("/", (c) => c.json({ ok: true }));

describe("ensureSignedIn", () => {
  test("rejects an authenticated non-user token", async () => {
    authenticated = true;
    userId = null;

    const response = await app.request("http://localhost/");

    expect(response.status).toBe(401);
  });

  test("allows an authenticated user session", async () => {
    authenticated = true;
    userId = "member-user";

    const response = await app.request("http://localhost/");

    expect(response.status).toBe(200);
  });
});
