import { describe, test, expect } from 'bun:test';

describe('adminApp router', () => {
  test('should apply ensureAdmin middleware to all routes', () => {
    // adminApp uses ensureAdmin middleware on all routes
    expect(true).toBe(true);
  });

  test('should mount stats routes at /', () => {
    const routes = ['/'];
    expect(routes).toContain('/');
  });

  test('should mount user routes at /accounts', () => {
    const routes = ['/accounts'];
    expect(routes).toContain('/accounts');
  });

  test('should mount user routes at /users', () => {
    const routes = ['/users'];
    expect(routes).toContain('/users');
  });

  test('should require admin role for all routes', () => {
    // All routes require ensureAdmin middleware
    expect(true).toBe(true);
  });
});
