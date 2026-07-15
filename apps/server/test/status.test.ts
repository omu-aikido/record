import { describe, expect, test } from "bun:test";

import app from "@/src/index";

describe("GET /api/status", () => {
  test("returns the Worker version before Clerk configuration is evaluated", async () => {
    const response = await app.request("https://app.example/api/status", undefined, {
      CF_VERSION_METADATA: {
        id: "7c119265-a520-440e-be2d-ec5cce748393",
        tag: "a1b2c3d",
        timestamp: "2026-07-15T12:26:00.000Z",
      },
    } as Env);

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Record-Version")).toBe("a1b2c3d");
    expect(await response.json()).toEqual({
      version: {
        id: "7c119265-a520-440e-be2d-ec5cce748393",
        shortId: "7c119265",
        tag: "a1b2c3d",
        createdAt: "2026-07-15T12:26:00.000Z",
      },
    });
  });
});
