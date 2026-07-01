import { describe, expect, test } from "bun:test";

import { isIgnoredBrowserInternalError } from "../../src/lib/browserInternalError";

describe("isIgnoredBrowserInternalError", () => {
  test("returns true for Safari internal error message", () => {
    expect(isIgnoredBrowserInternalError(new Error("viewportDominantIFrameHandle failed"))).toBe(true);
  });

  test("returns true when ErrorEvent-style input has null error", () => {
    expect(
      isIgnoredBrowserInternalError({
        error: null,
        filename: "global code",
        message: "TypeError: null is not an object (evaluating 'this.viewportDominantIFrameElement().contentWindow')",
      })
    ).toBe(true);
  });

  test("returns false for normal application error", () => {
    expect(isIgnoredBrowserInternalError(new Error("Cannot load profile"))).toBe(false);
  });

  test("returns false for nullish input", () => {
    expect(isIgnoredBrowserInternalError(null)).toBe(false);
    expect(isIgnoredBrowserInternalError(undefined)).toBe(false);
  });
});
