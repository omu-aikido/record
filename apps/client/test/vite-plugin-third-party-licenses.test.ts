import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { collectThirdPartyLicenses } from "../vite-plugin-third-party-licenses";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("third-party-licenses Vite plugin", () => {
  test("collects a sorted list of licenses for bundled dependencies", () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), "third-party-licenses-"));
    temporaryDirectories.push(directory);

    const packageModule = (name: string, metadata: Record<string, unknown>) => {
      const packageDirectory = path.join(directory, "node_modules", ...name.split("/"));
      mkdirSync(packageDirectory, { recursive: true });
      writeFileSync(path.join(packageDirectory, "package.json"), JSON.stringify(metadata));
      return path.join(packageDirectory, "index.js");
    };

    const vueModule = packageModule("vue", { name: "vue", version: "3.5.0", license: "MIT" });
    const clerkModule = packageModule("@clerk/vue", {
      name: "@clerk/vue",
      version: "2.0.0",
      license: { type: "MIT" },
    });

    expect(
      collectThirdPartyLicenses([
        vueModule,
        `${vueModule}?commonjs-proxy`,
        clerkModule,
        path.join(directory, "src", "main.js"),
      ])
    ).toEqual([
      { name: "@clerk/vue", version: "2.0.0", license: "MIT" },
      { name: "vue", version: "3.5.0", license: "MIT" },
    ]);
  });
});
