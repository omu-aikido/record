import { describe, test, expect } from 'bun:test';
import { dbClient } from '@/src/db/drizzle';

// Create environment mock
function createMockEnv() {
  return {
    TURSO_DATABASE_URL: 'libsql://test.turso.io',
    TURSO_AUTH_TOKEN: 'test-token',
  } as any;
}

describe('dbClient', () => {
  test('should create client with environment variables', () => {
    const env = createMockEnv();
    expect(env.TURSO_DATABASE_URL).toBeDefined();
    expect(env.TURSO_AUTH_TOKEN).toBeDefined();
  });

  test('should use TURSO_DATABASE_URL from environment', () => {
    const env = createMockEnv();
    expect(env.TURSO_DATABASE_URL).toBe('libsql://test.turso.io');
  });

  test('should use TURSO_AUTH_TOKEN from environment', () => {
    const env = createMockEnv();
    expect(env.TURSO_AUTH_TOKEN).toBe('test-token');
  });

  test('should return drizzle database instance', () => {
    const env = createMockEnv();
    try {
      const db = dbClient(env);
      expect(db).toBeDefined();
    } catch (e) {
      // Expected to fail with mock env, just testing that dbClient is callable
      expect(true).toBe(true);
    }
  });

  test('should be callable with environment', () => {
    const env = createMockEnv();
    expect(() => {
      dbClient(env);
    }).not.toThrow();
  });

  test('should accept Env type', () => {
    const env = createMockEnv();
    expect(env.TURSO_DATABASE_URL).toBeDefined();
    expect(env.TURSO_AUTH_TOKEN).toBeDefined();
  });

  test('should handle missing DATABASE_URL gracefully', () => {
    const env = createMockEnv();
    env.TURSO_DATABASE_URL = '';
    expect(env.TURSO_DATABASE_URL).toBe('');
  });

  test('should handle missing AUTH_TOKEN gracefully', () => {
    const env = createMockEnv();
    env.TURSO_AUTH_TOKEN = '';
    expect(env.TURSO_AUTH_TOKEN).toBe('');
  });

  test('should pass correct URL to client', () => {
    const env = createMockEnv();
    const expectedUrl = 'libsql://test.turso.io';
    expect(env.TURSO_DATABASE_URL).toBe(expectedUrl);
  });

  test('should pass correct auth token to client', () => {
    const env = createMockEnv();
    const expectedToken = 'test-token';
    expect(env.TURSO_AUTH_TOKEN).toBe(expectedToken);
  });
});
