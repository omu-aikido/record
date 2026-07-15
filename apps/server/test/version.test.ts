import { describe, expect, test } from "bun:test";

import { getPublicVersion } from "@/src/version";

describe("getPublicVersion", () => {
  test("returns a short worker ID and deployment tag", () => {
    expect(
      getPublicVersion({
        id: "7c119265-a520-440e-be2d-ec5cce748393",
        tag: "a1b2c3d",
        timestamp: "2026-07-15T12:26:00.000Z",
      })
    ).toEqual({
      id: "7c119265-a520-440e-be2d-ec5cce748393",
      shortId: "7c119265",
      tag: "a1b2c3d",
      createdAt: "2026-07-15T12:26:00.000Z",
    });
  });

  test("returns stable unknown values when metadata is unavailable in local tests", () => {
    expect(getPublicVersion(undefined)).toEqual({
      id: "unknown",
      shortId: "unknown",
      tag: null,
      createdAt: null,
    });
  });
});
