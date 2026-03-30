import { Hono } from 'hono';

import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

import { clerkMiddleware, getAuth } from '@hono/clerk-auth';

import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

import adminApp from './app/admin';
import userApp from './app/user';
import { webhooks } from './app/webhooks/clerk';

export default new Hono<{ Bindings: Env }>() //
  .use((c, next) => {
    return secureHeaders({
      contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://*.clerk.accounts.dev',
          'https://accounts.omu-aikido.com',
          c.env.CLERK_FRONTEND_API_URL,
        ],
        connectSrc: [
          "'self'",
          'https://*.clerk.accounts.dev',
          'https://accounts.omu-aikido.com',
          c.env.CLERK_FRONTEND_API_URL,
        ],
        imgSrc: ["'self'", 'https://img.clerk.com', 'data:'],
        workerSrc: ["'self'", 'blob:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
      xFrameOptions: 'DENY',
      referrerPolicy: 'strict-origin-when-cross-origin',
    })(c, next);
  })
  .use('*', cors())
  .use('*', errorHandler)
  .use('*', requestLogger)
  .route('/api/webhooks', webhooks)
  .use('*', (c, next) => {
    const middleware = clerkMiddleware({
      publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
      secretKey: c.env.CLERK_SECRET_KEY,
    });
    return middleware(c, next);
  })
  .basePath('/api')
  .get('/auth-status', (c) => {
    const auth = getAuth(c);
    return c.json({
      isAuthenticated: auth?.isAuthenticated ?? false,
      userId: auth?.userId ?? null,
      sessionId: auth?.sessionId ?? null,
    });
  })
  .route('/admin', adminApp)
  .route('/user', userApp);
