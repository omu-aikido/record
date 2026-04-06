import { describe, test, expect } from 'bun:test';
import { queryKeys } from '../../src/lib/queryKeys';

describe('queryKeys', () => {
  test('should export queryKeys object', () => {
    expect(queryKeys).toBeDefined();
    expect(typeof queryKeys).toBe('object');
  });

  test('should have user namespace', () => {
    expect(queryKeys.user).toBeDefined();
  });

  test('should have user record query keys', () => {
    expect(queryKeys.user.record).toBeDefined();
    expect(queryKeys.user.record.count).toBeDefined();
    expect(queryKeys.user.record.ranking).toBeDefined();
  });

  test('should generate record query keys', () => {
    const key1 = queryKeys.user.record();
    expect(Array.isArray(key1)).toBe(true);
    expect(key1[0]).toBe('user');
    expect(key1[1]).toBe('record');
  });

  test('should have user clerk query keys', () => {
    expect(queryKeys.user.clerk).toBeDefined();
    expect(queryKeys.user.clerk.profile).toBeDefined();
    expect(queryKeys.user.clerk.account).toBeDefined();
    expect(queryKeys.user.clerk.menu).toBeDefined();
  });

  test('should generate profile query keys', () => {
    const profileKey = queryKeys.user.clerk.profile();
    expect(Array.isArray(profileKey)).toBe(true);
    expect(profileKey[0]).toBe('user');
    expect(profileKey[1]).toBe('clerk');
    expect(profileKey[2]).toBe('profile');
  });

  test('should generate count query keys', () => {
    const countKey = queryKeys.user.record.count();
    expect(Array.isArray(countKey)).toBe(true);
    expect(countKey[0]).toBe('user');
    expect(countKey[1]).toBe('record');
    expect(countKey[2]).toBe('count');
  });

  test('should generate ranking query keys', () => {
    const rankingKey = queryKeys.user.record.ranking();
    expect(Array.isArray(rankingKey)).toBe(true);
    expect(rankingKey[0]).toBe('user');
    expect(rankingKey[1]).toBe('record');
    expect(rankingKey[2]).toBe('ranking');
  });

  test('should have admin query keys', () => {
    expect(queryKeys.admin).toBeDefined();
    expect(queryKeys.admin.dashboard).toBeDefined();
    expect(queryKeys.admin.accounts).toBeDefined();
    expect(queryKeys.admin.norms).toBeDefined();
    expect(queryKeys.admin.users).toBeDefined();
  });

  test('should support query parameters in record', () => {
    const keyWithParams = queryKeys.user.record({ query: { startDate: '2024-01-01' } });
    expect(Array.isArray(keyWithParams)).toBe(true);
    expect(keyWithParams[0]).toBe('user');
    expect(keyWithParams[1]).toBe('record');
    // ensure the params object is included in the generated key
    expect(keyWithParams).toContainEqual(
      expect.objectContaining({ query: expect.objectContaining({ startDate: '2024-01-01' }) })
    );
  });

  test('should support pagination in users query', () => {
    const userKey = queryKeys.admin.users('user_123');
    expect(Array.isArray(userKey)).toBe(true);
  });

  test('should generate consistent keys for same parameters', () => {
    const key1 = queryKeys.user.record();
    const key2 = queryKeys.user.record();
    expect(key1).toEqual(key2);
  });

  test('should generate different keys for different parameters', () => {
    const key1 = queryKeys.user.record({ query: { startDate: '2024-01-01' } });
    const key2 = queryKeys.user.record({ query: { startDate: '2024-02-01' } });
    expect(key1).not.toEqual(key2);
  });
});
