import type { ClerkMiddlewareOptions } from "@clerk/hono";

type ClerkEnv = Pick<Env, "CLERK_PUBLISHABLE_KEY" | "CLERK_SECRET_KEY"> & {
  CLERK_AUTHORIZED_PARTIES?: string;
};

/** Build Clerk verification options with an explicit trusted-party allowlist. */
export const getClerkMiddlewareOptions = (env: ClerkEnv): ClerkMiddlewareOptions => {
  const authorizedParties = env.CLERK_AUTHORIZED_PARTIES?.split(",")
    .map((party) => party.trim())
    .filter(Boolean);

  if (authorizedParties === undefined || authorizedParties.length === 0) {
    throw new Error("CLERK_AUTHORIZED_PARTIES must contain at least one origin");
  }

  return {
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
    secretKey: env.CLERK_SECRET_KEY,
    authorizedParties,
  };
};
