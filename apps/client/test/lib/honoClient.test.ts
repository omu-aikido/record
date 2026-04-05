import { describe, test, expect } from 'bun:test';
import honoClient from '@/lib/honoClient';

describe('honoClient', () => {
  test('should be defined', () => {
    expect(honoClient).toBeDefined();
  });

  test('should have auth-status endpoint', () => {
    expect(honoClient['auth-status']).toBeDefined();
  });

  test('should have user endpoints', () => {
    expect(honoClient.user).toBeDefined();
    expect(honoClient.user.clerk).toBeDefined();
    expect(honoClient.user.record).toBeDefined();
  });

  test('should have clerk endpoints', () => {
    expect(honoClient.user.clerk.profile).toBeDefined();
    expect(honoClient.user.clerk.account).toBeDefined();
    expect(honoClient.user.clerk.menu).toBeDefined();
  });

  test('should have record endpoints', () => {
    expect(honoClient.user.record).toBeDefined();
  });

  test('should have admin endpoints', () => {
    expect(honoClient.admin).toBeDefined();
    expect(honoClient.admin.dashboard).toBeDefined();
    expect(honoClient.admin.accounts).toBeDefined();
    expect(honoClient.admin.norms).toBeDefined();
    expect(honoClient.admin.users).toBeDefined();
  });

  test('should support HTTP methods', () => {
    // Methods like $get, $post, $patch, $delete are added by Hono client
    expect(honoClient.user.clerk.profile.$get).toBeDefined();
    expect(honoClient.user.clerk.profile.$patch).toBeDefined();
  });
});
