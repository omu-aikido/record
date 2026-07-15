import type { Context, Next } from "hono";

import { getAuth } from "@clerk/hono";

import { getProfile } from "../clerk/profile";
import { Role } from "share";

export const ensureAdmin = async (
  c: Context<{
    Bindings: Env;
  }>,
  next: Next
): Promise<Response | void> => {
  const auth = getAuth(c, { acceptsToken: "session_token" });
  if (!auth.isAuthenticated || !auth.userId) {
    c.status(401);
    return c.json({ error: "Unauthorized" });
  }
  const profile = await getProfile(c);
  const role = profile?.role ? Role.fromString(profile.role) : null;
  if (!role || !role.isManagement()) {
    c.status(403);
    return c.json({ error: "Forbidden" });
  }
  await next();
};
