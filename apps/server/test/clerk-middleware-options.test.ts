import { describe, expect, test } from "bun:test";

import { getClerkMiddlewareOptions } from "@/src/middleware/clerk";

describe("getClerkMiddlewareOptions", () => {
  test("requires and normalizes authorized parties", () => {
    expect(
      getClerkMiddlewareOptions({
        CLERK_PUBLISHABLE_KEY: "pk_test",
        CLERK_SECRET_KEY: "sk_test",
        CLERK_AUTHORIZED_PARTIES: " https://app.example,https://admin.example ",
      })
    ).toEqual({
      publishableKey: "pk_test",
      secretKey: "sk_test",
      authorizedParties: ["https://app.example", "https://admin.example"],
    });
  });

  test("does not silently allow every origin when configuration is missing", () => {
    expect(() =>
      getClerkMiddlewareOptions({
        CLERK_PUBLISHABLE_KEY: "pk_test",
        CLERK_SECRET_KEY: "sk_test",
      })
    ).toThrow("CLERK_AUTHORIZED_PARTIES");
  });
});
