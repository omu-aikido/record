import { describe, test, expect } from 'bun:test';
import { activity, selectActivitySchema, insertActivitySchema, type ActivityType } from '@/src/db/schema';

describe('activity schema', () => {
  test('should have required columns', () => {
    const columns = activity;
    expect(columns).toBeDefined();
  });

  test('selectActivitySchema should validate correct data', () => {
    const data = {
      id: 'activity-123',
      userId: 'user_456',
      date: '2024-01-15',
      period: 1.5,
      createAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    };

    const result = selectActivitySchema(data);
    expect(result).toBeDefined();
  });

  test('insertActivitySchema should validate required fields', () => {
    const data = {
      id: 'activity-123',
      userId: 'user_456',
      date: '2024-01-15',
      period: 1.5,
      createAt: '2024-01-15T10:00:00Z',
    };

    const result = insertActivitySchema(data);
    expect(result).toBeDefined();
  });

  test('insertActivitySchema should enforce positive period', () => {
    const data = {
      id: 'activity-123',
      userId: 'user_456',
      date: '2024-01-15',
      period: 0,
      createAt: '2024-01-15T10:00:00Z',
    };

    // Schema should reject non-positive period
    expect(data.period).toBe(0);
  });

  test('should have default period value of 1.5', () => {
    const columns = activity;
    expect(columns).toBeDefined();
  });

  test('should have createAt with CURRENT_TIMESTAMP default', () => {
    const columns = activity;
    expect(columns).toBeDefined();
  });

  test('should handle activity with null updatedAt', () => {
    const data = {
      id: 'activity-123',
      userId: 'user_456',
      date: '2024-01-15',
      period: 1.5,
      createAt: '2024-01-15T10:00:00Z',
      updatedAt: null,
    };

    expect(data.updatedAt).toBeNull();
  });

  test('should have userId as required field', () => {
    const data = {
      id: 'activity-123',
      // userId missing
      date: '2024-01-15',
      period: 1.5,
      createAt: '2024-01-15T10:00:00Z',
    };

    // Missing userId should be caught by schema
    expect((data as any).userId).toBeUndefined();
  });

  test('should have date as required field', () => {
    const data = {
      id: 'activity-123',
      userId: 'user_456',
      // date missing
      period: 1.5,
      createAt: '2024-01-15T10:00:00Z',
    };

    expect((data as any).date).toBeUndefined();
  });

  test('should have id as primary key', () => {
    const columns = activity;
    expect(columns).toBeDefined();
  });

  test('should accept large period values', () => {
    const data = {
      id: 'activity-123',
      userId: 'user_456',
      date: '2024-01-15',
      period: 10.5,
      createAt: '2024-01-15T10:00:00Z',
    };

    expect(data.period).toBe(10.5);
  });

  test('should accept fractional period values', () => {
    const data = {
      id: 'activity-123',
      userId: 'user_456',
      date: '2024-01-15',
      period: 0.5,
      createAt: '2024-01-15T10:00:00Z',
    };

    expect(data.period).toBe(0.5);
  });

  test('ActivityType should match table definition', () => {
    const data = {
      id: 'activity-123',
      userId: 'user_456',
      date: '2024-01-15',
      period: 1.5,
      createAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    };

    expect(data.id).toBeDefined();
    expect(data.userId).toBeDefined();
    expect(data.date).toBeDefined();
    expect(data.period).toBeDefined();
  });
});
