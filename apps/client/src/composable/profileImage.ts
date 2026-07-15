const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024;
const PROFILE_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export function validateProfileImage(file: File): string | null {
  if (!PROFILE_IMAGE_TYPES.has(file.type)) {
    return "プロフィール画像は PNG・JPEG・WebP 形式を選択してください";
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
    return "プロフィール画像は 2 MiB 以下にしてください";
  }

  return null;
}
