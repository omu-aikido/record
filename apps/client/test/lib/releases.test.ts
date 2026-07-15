import { describe, expect, test } from "bun:test";

import { releases } from "../../src/lib/releases";

describe("releases", () => {
  test("lists the deployment version release with user-facing changes", () => {
    expect(releases[0]).toMatchObject({
      date: "2026-07-15",
      title: "デプロイ版情報とリリースノートを追加",
    });
    expect(releases[0]?.changes.length).toBeGreaterThan(0);
  });
});
