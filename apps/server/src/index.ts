import { Hono } from "hono";

import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";

import { clerkMiddleware, getAuth } from "@clerk/hono";

import adminApp from "./app/admin";
import userApp from "./app/user";

import { webhooks } from "./app/webhooks/clerk";

import { getClerkMiddlewareOptions } from "./middleware/clerk";

import { errorHandler } from "./middleware/errorHandler";

import { requestLogger } from "./middleware/requestLogger";

import { getPublicVersion } from "./version";

export default new Hono<{ Bindings: Env }>() //
  .use((c, next) => {
    return secureHeaders({
      contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "blob:",
          "https://*.clerk.accounts.dev",
          "https://accounts.omu-aikido.com",
          c.env.CLERK_FRONTEND_API_URL,
        ],
        connectSrc: [
          "'self'",
          "https://*.clerk.accounts.dev",
          "https://accounts.omu-aikido.com",
          c.env.CLERK_FRONTEND_API_URL,
        ],
        frameSrc: [
          "'self'",
          "https://*.clerk.accounts.dev",
          "https://accounts.omu-aikido.com",
          c.env.CLERK_FRONTEND_API_URL,
        ],
        imgSrc: ["'self'", "https://img.clerk.com", "data:"],
        workerSrc: ["'self'", "blob:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
      xFrameOptions: "DENY",
      referrerPolicy: "strict-origin-when-cross-origin",
    })(c, next);
  })
  .use("*", bodyLimit({ maxSize: 10 * 1024 * 1024 }))
  .use("*", errorHandler)
  .use("*", requestLogger)
  .use("*", async (c, next) => {
    const version = getPublicVersion(c.env.CF_VERSION_METADATA);
    c.header("X-Record-Version", version.tag ?? version.shortId);
    await next();
  })
  .route("/api/webhooks", webhooks)
  .basePath("/api")
  .get("/status", (c) => {
    return c.json({ version: getPublicVersion(c.env.CF_VERSION_METADATA) });
  })
  .use("*", (c, next) => {
    const middleware = clerkMiddleware(getClerkMiddlewareOptions(c.env));
    // oxlint-disable-next-line typescript/no-unsafe-argument
    return middleware(c, next);
  })
  .get("/auth-status", (c) => {
    const auth = getAuth(c);
    return c.json({
      isAuthenticated: auth?.isAuthenticated ?? false,
      userId: auth?.userId ?? null,
      sessionId: auth?.sessionId ?? null,
    });
  })
  .route("/admin", adminApp)
  .route("/user", userApp);
