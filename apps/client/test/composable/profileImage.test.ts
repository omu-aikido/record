import { describe, expect, test } from "bun:test";

import { validateProfileImage } from "../../src/composable/profileImage";

describe("validateProfileImage", () => {
  test("accepts a 2 MiB PNG", () => {
    const file = new File([new Uint8Array(2 * 1024 * 1024)], "avatar.png", { type: "image/png" });

    expect(validateProfileImage(file)).toBeNull();
  });

  test("rejects an image larger than 2 MiB", () => {
    const file = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "avatar.png", { type: "image/png" });

    expect(validateProfileImage(file)).toBe("プロフィール画像は 2 MiB 以下にしてください");
  });

  test("rejects unsupported MIME types", () => {
    const file = new File(["not an image"], "avatar.gif", { type: "image/gif" });

    expect(validateProfileImage(file)).toBe("プロフィール画像は PNG・JPEG・WebP 形式を選択してください");
  });
});
