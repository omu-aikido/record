declare namespace Cloudflare {
  interface Env {
    CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
    CLERK_WEBHOOK_SECRET: string;
    CLERK_FRONTEND_API_URL: string;
    TURSO_AUTH_TOKEN: string;
    TURSO_DATABASE_URL: string;
  }
}
interface Env extends Cloudflare.Env {}
