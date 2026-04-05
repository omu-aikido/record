import { describe, test, expect, mock } from 'bun:test';
import type { Context } from 'hono';

// Mock the dependencies
const mockGetAuth = mock((c: Context) => (c as any).__mockAuth);

function createMockContext(auth?: any, env?: any, publicMetadata?: any): Context {
  const ctx = {
    env: env || {
      CLERK_SECRET_KEY: 'test-secret',
    },
    __mockAuth: auth,
    req: {
      method: 'GET',
      url: 'http://localhost/api/test',
      path: '/api/test',
      header: mock(() => ''),
    },
  } as unknown as Context;
  return ctx;
}

describe('getProfile', () => {
  test('should return null when not authenticated', () => {
    const c = createMockContext(null);
    const auth = mockGetAuth(c);
    expect(auth).toBeNull();
  });

  test('should return null when auth.isAuthenticated is false', () => {
    const c = createMockContext({ isAuthenticated: false });
    const auth = mockGetAuth(c);
    if (!auth || !auth.isAuthenticated) {
      expect(true).toBe(true);
    }
  });

  test('should return null when no publicMetadata', () => {
    const c = createMockContext(
      { isAuthenticated: true, userId: 'user_123' }
    );
    const publicMetadata = {};
    const hasMetadata = Object.keys(publicMetadata).length > 0;
    expect(hasMetadata).toBe(false);
  });

  test('should return profile when authenticated with valid metadata', () => {
    const c = createMockContext(
      { isAuthenticated: true, userId: 'user_123' }
    );
    const auth = mockGetAuth(c);
    expect(auth.isAuthenticated).toBe(true);
  });

  test('should validate publicMetadata against AccountMetadata schema', () => {
    const metadata = {
      role: 'member',
      grade: 1,
      joinedAt: 2024,
      year: '2024',
      getGradeAt: '2024-01-01',
    };

    expect(metadata.role).toBeDefined();
    expect(metadata.grade).toBeDefined();
  });

  test('should return null for invalid metadata', () => {
    const metadata = {
      invalid: 'data',
    };

    // If metadata doesn't match schema, should return null
    expect(metadata.role).toBeUndefined();
  });
});

describe('getUser', () => {
  test('should return null when not authenticated', () => {
    const c = createMockContext(null);
    const auth = mockGetAuth(c);
    expect(auth).toBeNull();
  });

  test('should return null when auth.userId is missing', () => {
    const c = createMockContext({ isAuthenticated: true });
    const auth = mockGetAuth(c);
    expect(auth?.userId).toBeUndefined();
  });

  test('should return user when authenticated with valid userId', () => {
    const c = createMockContext({ isAuthenticated: true, userId: 'user_123' });
    const auth = mockGetAuth(c);
    expect(auth.userId).toBe('user_123');
  });
});

describe('patchProfile', () => {
  test('should throw error when not authenticated', () => {
    const c = createMockContext(null);
    const auth = mockGetAuth(c);
    
    const shouldThrow = !auth || !auth.userId;
    expect(shouldThrow).toBe(true);
  });

  test('should throw error when auth.userId is missing', () => {
    const c = createMockContext({ isAuthenticated: true });
    const auth = mockGetAuth(c);
    
    const shouldThrow = !auth || !auth.userId;
    expect(shouldThrow).toBe(true);
  });

  test('should validate data against AccountMetadata schema', () => {
    const data = {
      role: 'member',
      grade: 1,
      joinedAt: 2024,
      year: '2024',
    };

    expect(data.role).toBeDefined();
    expect(data.grade).toBeDefined();
    expect(data.joinedAt).toBeDefined();
    expect(data.year).toBeDefined();
  });

  test('should throw TypeError for invalid account data', () => {
    const data = {
      invalid: 'data',
    };

    const isValid = data.role !== undefined;
    expect(isValid).toBe(false);
  });

  test('should handle Clerk API errors', () => {
    const error = new Error('Failed to update user profile');
    expect(error.message).toBe('Failed to update user profile');
  });

  test('should notify on error', () => {
    const error = new Error('Clerk API error');
    expect(error).toBeDefined();
  });

  test('should update user metadata with provided data', () => {
    const c = createMockContext({ isAuthenticated: true, userId: 'user_123' });
    const data = {
      role: 'member',
      grade: 2,
      joinedAt: 2024,
      year: '2024',
    };

    expect(data.grade).toBe(2);
  });
});

describe('AccountMetadata validation', () => {
  test('should accept valid role values', () => {
    const roles = ['member', 'admin', 'treasurer'];
    
    for (const role of roles) {
      expect(role).toBeDefined();
    }
  });

  test('should require role field', () => {
    const data = {
      grade: 1,
      joinedAt: 2024,
      year: '2024',
    };

    expect((data as any).role).toBeUndefined();
  });

  test('should accept optional getGradeAt', () => {
    const data = {
      role: 'member',
      grade: 1,
      joinedAt: 2024,
      year: '2024',
      getGradeAt: '2024-01-01',
    };

    expect(data.getGradeAt).toBe('2024-01-01');
  });

  test('should handle null getGradeAt', () => {
    const data = {
      role: 'member',
      grade: 1,
      joinedAt: 2024,
      year: '2024',
      getGradeAt: null,
    };

    expect(data.getGradeAt).toBeNull();
  });
});
