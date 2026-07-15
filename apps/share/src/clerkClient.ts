import { type } from "arktype";

const accountFieldNames = new Set(["firstName", "lastName", "username"]);

export const updateAccountSchema = type({
  firstName: "string?",
  lastName: "string?",
  username: "string?",
}).narrow((input) => Object.keys(input).every((key) => accountFieldNames.has(key)));

/** Public fields returned by the authenticated account endpoint. */
export const accountUserSchema = type({
  userId: "string",
  username: "string | null",
  firstName: "string | null",
  lastName: "string | null",
  imageUrl: "string",
});
export type AccountUserType = typeof accountUserSchema.infer;
