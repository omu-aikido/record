import { describe, expect, test } from "bun:test";

import { releases } from "../../src/lib/releases";

describe("releases", () => {
  test("lists the deployment version release with user-facing changes", () => {
    const deploymentRelease = releases.find((release) =>
      release.changes.some((change) => change.includes("現在利用中のバージョン"))
    );

    expect(deploymentRelease).toMatchObject({
      date: "2026-07-15",
    });
    expect(deploymentRelease?.changes.length).toBeGreaterThan(0);
  });
});
