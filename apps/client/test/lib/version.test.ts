import { describe, expect, test } from "bun:test";

import { toVersionDisplay } from "../../src/lib/version";

describe("toVersionDisplay", () => {
  test("prefers the deployment tag and retains the complete Worker ID as detail", () => {
    expect(
      toVersionDisplay({
        id: "7c119265-a520-440e-be2d-ec5cce748393",
        shortId: "7c119265",
        tag: "a1b2c3d",
        createdAt: "2026-07-15T12:26:00.000Z",
      })
    ).toEqual({
      label: "a1b2c3d",
      detail: "7c119265-a520-440e-be2d-ec5cce748393",
    });
  });
});
