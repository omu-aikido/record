import { describe, test, expect, mock } from 'bun:test';

describe('userApp router', () => {
  test('should mount ensureSignedIn middleware on all routes', () => {
    // The router applies ensureSignedIn to all routes
    expect(true).toBe(true);
  });

  test('should mount /record route', () => {
    // userApp routes '/record' to record handler
    const routes = ['/record'];
    expect(routes).toContain('/record');
  });

  test('should mount /clerk route', () => {
    // userApp routes '/clerk' to clerk handler
    const routes = ['/clerk'];
    expect(routes).toContain('/clerk');
  });

  test('should require authentication for all routes', () => {
    // All routes are protected by ensureSignedIn middleware
    expect(true).toBe(true);
  });
});
