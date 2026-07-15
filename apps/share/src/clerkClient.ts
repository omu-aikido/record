import { type } from "arktype";

export const updateAccountSchema = type({
  firstName: "string?",
  lastName: "string?",
  username: "string?",
  profileImage: "unknown?",
});

/** Public fields returned by the authenticated account endpoint. */
export const accountUserSchema = type({
  userId: "string",
  username: "string | null",
  firstName: "string | null",
  lastName: "string | null",
  imageUrl: "string",
});
export type AccountUserType = typeof accountUserSchema.infer;
