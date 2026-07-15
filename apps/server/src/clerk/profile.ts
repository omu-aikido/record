import { ArkErrors } from "arktype";
import type { Context } from "hono";

import { createClerkClient } from "@clerk/backend";
import { getAuth } from "@clerk/hono";

import { AccountMetadata, type AccountMetadataType } from "share";

import { notify } from "../lib/observability";

function normalizeRole(value: unknown): AccountMetadataType["role"] {
  if (
    value === "admin" ||
    value === "captain" ||
    value === "vice-captain" ||
    value === "treasurer" ||
    value === "member"
  ) {
    return value;
  }
  return "member";
}

function normalizeDateString(value: unknown): AccountMetadataType["getGradeAt"] {
  if (value === null || value === "") return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return value as AccountMetadataType["getGradeAt"];
  }
  return null;
}

function normalizeYear(value: unknown): AccountMetadataType["year"] {
  if (value === null || value === "") return value;
  if (typeof value === "string" && /^(b[1-4]|m[1-2]|d[1-2])$/u.test(value)) {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return value as AccountMetadataType["year"];
  }
  return "";
}

function normalizeProfileMetadata(metadata: Record<string, unknown> | null | undefined): AccountMetadataType {
  const raw = metadata ?? {};

  return {
    role: normalizeRole(raw.role),
    grade:
      typeof raw.grade === "number"
        ? raw.grade
        : typeof raw.grade === "string"
          ? Math.trunc(Number(raw.grade))
          : raw.grade === null
            ? null
            : null,
    getGradeAt: normalizeDateString(raw.getGradeAt),
    joinedAt:
      typeof raw.joinedAt === "number"
        ? raw.joinedAt
        : typeof raw.joinedAt === "string"
          ? Math.trunc(Number(raw.joinedAt))
          : raw.joinedAt === null
            ? null
            : null,
    year: normalizeYear(raw.year),
    birthday: normalizeDateString(raw.birthday),
  };
}

export const getProfile = async (
  c: Context<{
    Bindings: Env;
  }>
) => {
  const auth = getAuth(c);
  if (!auth.isAuthenticated) return null;

  const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY });
  const user = await clerkClient.users.getUser(auth.userId);

  const profile = AccountMetadata(normalizeProfileMetadata(user.publicMetadata));
  if (profile instanceof ArkErrors) return null;

  return profile;
};

export const getUser = async (
  c: Context<{
    Bindings: Env;
  }>
) => {
  const auth = getAuth(c);
  if (!auth.isAuthenticated) return null;

  const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY });
  const user = await clerkClient.users.getUser(auth.userId);

  return user;
};

export const patchProfile = async (
  c: Context<{
    Bindings: Env;
  }>,
  data: typeof AccountMetadata.infer
) => {
  const clerkClient = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY });
  const auth = getAuth(c);
  if (!auth.isAuthenticated) throw new Error("Unauthorized");

  const validated = AccountMetadata(data);
  if (validated instanceof ArkErrors) {
    throw new TypeError("Invalid account data");
  }
  try {
    const updatedUser = await clerkClient.users.updateUserMetadata(auth.userId, { publicMetadata: { ...validated } });

    return updatedUser;
  } catch {
    notify(c, new Error("Failed to update user profile"), { statusCode: 500, userId: auth.userId });
    throw new Error("Failed to update user");
  }
};
