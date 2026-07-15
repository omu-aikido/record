import { getAuth } from "@clerk/hono";
import type { Context, Next } from "hono";

export const ensureSignedIn = async (c: Context, next: Next): Promise<Response | void> => {
  const auth = getAuth(c, { acceptsToken: "session_token" });
  if (!auth.isAuthenticated || !auth.userId) {
    c.status(401);
    return c.json({ error: "Unauthorized" });
  }
  await next();
};
