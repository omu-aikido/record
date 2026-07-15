import type { Context } from "hono";
import { getAuth } from "@clerk/hono";
import type { RateLimit } from "@cloudflare/workers-types";

/**
 * Applies a per-user mutation limit. Cloudflare's binding is intentionally used
 * only as abuse control: its counters are per-location and eventually consistent.
 */
export const enforceUserRateLimit = async (
  c: Context,
  limiter: RateLimit,
  operation: string
): Promise<Response | void> => {
  const auth = getAuth(c, { acceptsToken: "session_token" });
  if (!auth.isAuthenticated || !auth.userId) return c.json({ error: "Unauthorized" }, 401);

  const outcome = await limiter.limit({ key: `${auth.userId}:${operation}` });
  if (!outcome.success) {
    return c.json({ error: "Too Many Requests" }, 429, { "Retry-After": "60" });
  }
};
