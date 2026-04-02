import { describe, test, expect } from 'bun:test';
import { Role } from '../index';

describe('Role static instances', () => {
  test('should have ADMIN role', () => {
    expect(Role.ADMIN.role).toBe('admin');
    expect(Role.ADMIN.ja).toBe('管理者');
  });

  test('should have CAPTAIN role', () => {
    expect(Role.CAPTAIN.role).toBe('captain');
    expect(Role.CAPTAIN.ja).toBe('主将');
  });

  test('should have VICE_CAPTAIN role', () => {
    expect(Role.VICE_CAPTAIN.role).toBe('vice-captain');
    expect(Role.VICE_CAPTAIN.ja).toBe('副主将');
  });

  test('should have TREASURER role', () => {
    expect(Role.TREASURER.role).toBe('treasurer');
    expect(Role.TREASURER.ja).toBe('会計');
  });

  test('should have MEMBER role', () => {
    expect(Role.MEMBER.role).toBe('member');
    expect(Role.MEMBER.ja).toBe('部員');
  });
});

describe('Role.ALL', () => {
  test('should contain all 5 roles', () => {
    expect(Role.ALL).toHaveLength(5);
    expect(Role.ALL).toContain(Role.ADMIN);
    expect(Role.ALL).toContain(Role.CAPTAIN);
    expect(Role.ALL).toContain(Role.VICE_CAPTAIN);
    expect(Role.ALL).toContain(Role.TREASURER);
    expect(Role.ALL).toContain(Role.MEMBER);
  });

  test('should have correct ordering', () => {
    expect(Role.ALL[0]).toBe(Role.ADMIN);
    expect(Role.ALL[1]).toBe(Role.CAPTAIN);
    expect(Role.ALL[2]).toBe(Role.VICE_CAPTAIN);
    expect(Role.ALL[3]).toBe(Role.TREASURER);
    expect(Role.ALL[4]).toBe(Role.MEMBER);
  });
});

describe('Role.parse()', () => {
  test('should parse valid role strings', () => {
    expect(Role.parse('admin')).toBe(Role.ADMIN);
    expect(Role.parse('captain')).toBe(Role.CAPTAIN);
    expect(Role.parse('vice-captain')).toBe(Role.VICE_CAPTAIN);
    expect(Role.parse('treasurer')).toBe(Role.TREASURER);
    expect(Role.parse('member')).toBe(Role.MEMBER);
  });

  test('should return undefined for null', () => {
    expect(Role.parse(null)).toBeUndefined();
  });

  test('should return undefined for undefined', () => {
    expect(Role.parse(undefined)).toBeUndefined();
  });

  test('should return undefined for random strings', () => {
    expect(Role.parse('foo')).toBeUndefined();
    expect(Role.parse('unknown')).toBeUndefined();
    expect(Role.parse('')).toBeUndefined();
  });

  test('should return undefined for numbers', () => {
    expect(Role.parse(1)).toBeUndefined();
    expect(Role.parse(0)).toBeUndefined();
  });
});

describe('Role.fromString()', () => {
  test('should return correct Role instances', () => {
    expect(Role.fromString('admin')).toBe(Role.ADMIN);
    expect(Role.fromString('captain')).toBe(Role.CAPTAIN);
    expect(Role.fromString('vice-captain')).toBe(Role.VICE_CAPTAIN);
    expect(Role.fromString('treasurer')).toBe(Role.TREASURER);
    expect(Role.fromString('member')).toBe(Role.MEMBER);
  });

  test('should return null for invalid strings', () => {
    expect(Role.fromString('foo')).toBeNull();
    expect(Role.fromString('')).toBeNull();
    expect(Role.fromString('unknown')).toBeNull();
  });
});

describe('Role.toString()', () => {
  test('should return the role string', () => {
    expect(Role.ADMIN.toString()).toBe('admin');
    expect(Role.CAPTAIN.toString()).toBe('captain');
    expect(Role.VICE_CAPTAIN.toString()).toBe('vice-captain');
    expect(Role.TREASURER.toString()).toBe('treasurer');
    expect(Role.MEMBER.toString()).toBe('member');
  });
});

describe('Role.isManagement()', () => {
  test('should return true for management roles', () => {
    expect(Role.ADMIN.isManagement()).toBe(true);
    expect(Role.CAPTAIN.isManagement()).toBe(true);
    expect(Role.VICE_CAPTAIN.isManagement()).toBe(true);
    expect(Role.TREASURER.isManagement()).toBe(true);
  });

  test('should return false for MEMBER', () => {
    expect(Role.MEMBER.isManagement()).toBe(false);
  });
});

describe('Role.compare()', () => {
  test('should return 0 for same roles', () => {
    expect(Role.compare('admin', 'admin')).toBe(0);
    expect(Role.compare('member', 'member')).toBe(0);
  });

  test('should return negative when first role has higher priority', () => {
    expect(Role.compare('admin', 'captain')).toBeLessThan(0);
    expect(Role.compare('captain', 'member')).toBeLessThan(0);
    expect(Role.compare('admin', 'member')).toBeLessThan(0);
  });

  test('should return positive when first role has lower priority', () => {
    expect(Role.compare('member', 'admin')).toBeGreaterThan(0);
    expect(Role.compare('captain', 'admin')).toBeGreaterThan(0);
    expect(Role.compare('treasurer', 'vice-captain')).toBeGreaterThan(0);
  });

  test('should handle invalid roles as member', () => {
    expect(Role.compare('invalid', 'member')).toBe(0);
    expect(Role.compare('admin', 'invalid')).toBeLessThan(0);
  });
});

describe('Role.type', () => {
  test('should exist as arktype schema', () => {
    expect(Role.type).toBeDefined();
    expect(typeof Role.type).toBe('function');
  });

  test('should validate valid role strings', () => {
    const result = Role.type('admin');
    expect(result).toBe('admin');
  });

  test('should reject invalid role strings', () => {
    const { ArkErrors } = require('arktype');
    const result = Role.type('invalid');
    expect(result instanceof ArkErrors).toBe(true);
  });
});
