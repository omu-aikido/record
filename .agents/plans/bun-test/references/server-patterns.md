# Server Testing Patterns

Patterns for testing `apps/server` - Hono API routes, middleware, and handlers on Cloudflare Workers.

## Table of Contents

- [Test Setup](#test-setup)
- [Route Testing with testClient](#route-testing-with-testclient)
- [Middleware Testing](#middleware-testing)
- [Mocking Dependencies](#mocking-dependencies)
- [Coverage Checklist](#coverage-checklist)

## Test Setup

```typescript
import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { testClient } from 'hono/testing';
```

Import the app instance and create a test client:

```typescript
import app from '../src/index';

const client = testClient(app);
```

**Note on type inference:** For `testClient` to infer route types, routes must be defined using chained methods directly on the Hono instance. If routes are defined separately, use string-based requests.

## Route Testing with testClient

### GET endpoints

```typescript
describe('GET /api/endpoint', () => {
  test('should return 200 with valid data', async () => {
    const res = await client.api.endpoint.$get();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ expected: 'data' });
  });

  test('should return 401 without auth', async () => {
    const res = await client.api.endpoint.$get(
      {},
      {
        headers: {
          /* no auth header */
        },
      }
    );
    expect(res.status).toBe(401);
  });
});
```

### POST endpoints

```typescript
describe('POST /api/endpoint', () => {
  test('should create resource with valid input', async () => {
    const res = await client.api.endpoint.$post({
      json: { field: 'value' },
    });
    expect(res.status).toBe(201);
  });

  test('should return 400 with invalid input', async () => {
    const res = await client.api.endpoint.$post({
      json: { field: '' },
    });
    expect(res.status).toBe(400);
  });
});
```

### DELETE endpoints

```typescript
describe('DELETE /api/endpoint/:id', () => {
  test('should delete resource', async () => {
    const res = await client.api.endpoint[':id'].$delete({
      param: { id: '123' },
    });
    expect(res.status).toBe(200);
  });
});
```

## Middleware Testing

### Auth middleware

```typescript
describe('signedIn middleware', () => {
  test('should pass with valid auth', async () => {
    const res = await client.api.protected.$get(
      {},
      {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      }
    );
    expect(res.status).toBe(200);
  });

  test('should reject without token', async () => {
    const res = await client.api.protected.$get();
    expect(res.status).toBe(401);
  });
});
```

### Admin middleware

```typescript
describe('admin middleware', () => {
  test('should allow admin access', async () => {
    const res = await client.api.admin.$get(
      {},
      {
        headers: {
          Authorization: 'Bearer admin-token',
          'X-Role': 'admin',
        },
      }
    );
    expect(res.status).toBe(200);
  });

  test('should reject non-admin', async () => {
    const res = await client.api.admin.$get(
      {},
      {
        headers: {
          Authorization: 'Bearer user-token',
          'X-Role': 'member',
        },
      }
    );
    expect(res.status).toBe(403);
  });
});
```

### Error handler middleware

```typescript
describe('errorHandler middleware', () => {
  test('should return 500 for unhandled errors', async () => {
    const res = await client.api.error.$get();
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toHaveProperty('error');
  });
});
```

## Mocking Dependencies

### Mocking Clerk authentication

```typescript
import { mockModule } from 'bun:test';

// Mock Clerk client
mockModule('@clerk/backend', () => ({
  createClerkClient: () => ({
    users: {
      getUser: mock(() => Promise.resolve({ id: 'user_123', role: 'admin' })),
      updateUser: mock(() => Promise.resolve({ id: 'user_123' })),
    },
  }),
}));
```

### Mocking Drizzle database

```typescript
// Create mock database functions
const mockDb = {
  select: mock(() => Promise.resolve([])),
  insert: mock(() => Promise.resolve({})),
  update: mock(() => Promise.resolve({})),
  delete: mock(() => Promise.resolve({})),
};

// For each test, set up mock return values
mockDb.select.mockImplementation(() => Promise.resolve([{ id: 1, name: 'test' }]));
```

### Mocking Cloudflare bindings

```typescript
// Mock Cloudflare environment
const mockEnv = {
  TURSO_DB_URL: 'libsql://test.turso.io',
  TURSO_DB_AUTH_TOKEN: 'test-token',
  CLERK_SECRET_KEY: 'test-secret',
};

// Pass to app.request if needed
const res = await app.request('/api/test', {}, mockEnv);
```

## Webhook Testing

```typescript
describe('POST /webhooks/clerk', () => {
  test('should handle user.created event', async () => {
    const payload = {
      type: 'user.created',
      data: { id: 'user_123', email_addresses: [{ email_address: 'test@example.com' }] },
    };

    const res = await client.webhooks.clerk.$post({
      json: payload,
    });
    expect(res.status).toBe(200);
  });

  test('should handle user.updated event', async () => {
    const payload = {
      type: 'user.updated',
      data: { id: 'user_123', role: 'admin' },
    };

    const res = await client.webhooks.clerk.$post({
      json: payload,
    });
    expect(res.status).toBe(200);
  });

  test('should ignore unknown events', async () => {
    const payload = { type: 'unknown.event', data: {} };

    const res = await client.webhooks.clerk.$post({
      json: payload,
    });
    expect(res.status).toBe(200);
  });
});
```

## Coverage Checklist

For each route file:

- [ ] Happy path (valid request, expected response)
- [ ] Missing authentication
- [ ] Invalid request body (validation errors)
- [ ] Missing required parameters
- [ ] Resource not found (404)
- [ ] Database errors
- [ ] All HTTP methods (GET, POST, PUT, DELETE)
- [ ] Query parameters (valid, invalid, missing)
- [ ] Pagination parameters
- [ ] Sorting/filtering parameters

For each middleware:

- [ ] Pass-through case (valid request)
- [ ] Rejection case (invalid/missing auth)
- [ ] Error handling

## Running Tests

```bash
cd /Users/hal/Repo/github.com/omu-aikido/record
bun test apps/server/test/           # Run all server tests
bun test apps/server/test/app/user/record.test.ts  # Run single file
bun test --coverage                  # Run all with coverage
```
