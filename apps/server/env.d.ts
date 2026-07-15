import type { RateLimit } from "@cloudflare/workers-types";

declare global {
  namespace Cloudflare {
    interface Env {
      CLERK_PUBLISHABLE_KEY: string;
      CLERK_SECRET_KEY: string;
      CLERK_WEBHOOK_SECRET: string;
      CLERK_FRONTEND_API_URL: string;
      CLERK_AUTHORIZED_PARTIES: string;
      TURSO_AUTH_TOKEN: string;
      TURSO_DATABASE_URL: string;
      ACCOUNT_MUTATION_RATE_LIMIT: RateLimit;
      ACTIVITY_MUTATION_RATE_LIMIT: RateLimit;
      BULK_DELETE_RATE_LIMIT: RateLimit;
    }
  }

  interface Env extends Cloudflare.Env {}
}

export type WorkerEnv = Env;
