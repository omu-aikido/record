import { describe, test, expect, mock, spyOn } from 'bun:test';
import { calculatePeriodRange, maskRankingData, getRankingData } from '@/src/app/user/ranking';
import type { Context } from 'hono';
import * as dbDrizzle from '@/src/db/drizzle';

describe('calculatePeriodRange', () => {
  test('should calculate annual period', () => {
    const result = calculatePeriodRange({ year: 2024, month: 6, period: 'annual' });
    expect(result.startDate).toBe('2024-01-01');
    expect(result.endDate).toBe('2024-12-31');
    expect(result.periodLabel).toBe('2024年');
  });

  test('should calculate fiscal period', () => {
    const result = calculatePeriodRange({ year: 2024, month: 6, period: 'fiscal' });
    expect(result.startDate).toBe('2024-04-01');
    expect(result.endDate).toBe('2025-03-31');
    expect(result.periodLabel).toBe('2024年度');
  });

  test('should calculate monthly period', () => {
    const result = calculatePeriodRange({ year: 2024, month: 1, period: 'monthly' });
    expect(result.startDate).toMatch(/2024-01-01/);
    expect(result.endDate).toMatch(/2024-01-31/);
  });

  test('should handle February leap year', () => {
    const result = calculatePeriodRange({ year: 2024, month: 2, period: 'monthly' });
    expect(result.endDate).toMatch(/2024-02-29/);
  });

  test('should handle February non-leap year', () => {
    const result = calculatePeriodRange({ year: 2023, month: 2, period: 'monthly' });
    expect(result.endDate).toMatch(/2023-02-28/);
  });

  test('should handle December for fiscal year rollover', () => {
    const result = calculatePeriodRange({ year: 2024, month: 12, period: 'fiscal' });
    expect(result.startDate).toBe('2024-04-01');
    expect(result.endDate).toBe('2025-03-31');
  });

  test('should handle January for annual period', () => {
    const result = calculatePeriodRange({ year: 2024, month: 1, period: 'annual' });
    expect(result.startDate).toBe('2024-01-01');
    expect(result.endDate).toBe('2024-12-31');
  });

  test('should generate correct period labels', () => {
    const annual = calculatePeriodRange({ year: 2024, month: 6, period: 'annual' });
    const fiscal = calculatePeriodRange({ year: 2024, month: 6, period: 'fiscal' });

    expect(annual.periodLabel).toContain('2024');
    expect(fiscal.periodLabel).toContain('2024');
  });

  test('should handle all months for monthly period', () => {
    for (let month = 1; month <= 12; month++) {
      const result = calculatePeriodRange({ year: 2024, month, period: 'monthly' });
      expect(result.startDate).toBeDefined();
      expect(result.endDate).toBeDefined();
    }
  });
});

describe('getRankingData', () => {
  test('should return empty array when no activities exist', async () => {
    // Create a mock context with environment
    const mockContext = {
      env: {
        TURSO_DATABASE_URL: 'libsql://test.turso.io',
        TURSO_AUTH_TOKEN: 'test-token',
      },
    } as unknown as Context;

    // Mock the dbClient to return our mock query builder
    const mockDb = {
      select: mock(() => ({
        from: mock(() => ({
          where: mock(() => ({
            groupBy: mock(() => ({
              orderBy: mock(() => ({
                limit: mock(async () => []),
              })),
            })),
          })),
        })),
      })),
    };

    const dbClientSpy = spyOn(dbDrizzle, 'dbClient').mockReturnValue(mockDb as any);

    try {
      const result = await getRankingData(mockContext, '2024-01-01', '2024-01-31');
      expect(result).toEqual([]);
      expect(dbClientSpy).toHaveBeenCalled();
    } finally {
      dbClientSpy.mockRestore();
    }
  });

  test('should return ranking entries with userId and totalPeriod in correct order', async () => {
    const mockContext = {
      env: {
        TURSO_DATABASE_URL: 'libsql://test.turso.io',
        TURSO_AUTH_TOKEN: 'test-token',
      },
    } as unknown as Context;

    const mockData = [
      { userId: 'user_1', totalPeriod: 100 },
      { userId: 'user_2', totalPeriod: 80 },
      { userId: 'user_3', totalPeriod: 60 },
    ];

    const mockDb = {
      select: mock(() => ({
        from: mock(() => ({
          where: mock(() => ({
            groupBy: mock(() => ({
              orderBy: mock(() => ({
                limit: mock(async () => mockData),
              })),
            })),
          })),
        })),
      })),
    };

    const dbClientSpy = spyOn(dbDrizzle, 'dbClient').mockReturnValue(mockDb as any);

    try {
      const result = await getRankingData(mockContext, '2024-01-01', '2024-12-31');
      expect(result.length).toBe(3);
      expect(result[0].userId).toBe('user_1');
      expect(result[0].totalPeriod).toBe(100);
      expect(result[1].totalPeriod).toEqual(80);
      expect(result[2].totalPeriod).toEqual(60);
    } finally {
      dbClientSpy.mockRestore();
    }
  });

  test('should limit results to 50 users', async () => {
    const mockContext = {
      env: {
        TURSO_DATABASE_URL: 'libsql://test.turso.io',
        TURSO_AUTH_TOKEN: 'test-token',
      },
    } as unknown as Context;

    let limitCalled = false;
    let limitValue = 0;

    const mockDb = {
      select: mock(() => ({
        from: mock(() => ({
          where: mock(() => ({
            groupBy: mock(() => ({
              orderBy: mock(() => ({
                limit: mock(async (n: number) => {
                  limitCalled = true;
                  limitValue = n;
                  return [];
                }),
              })),
            })),
          })),
        })),
      })),
    };

    const dbClientSpy = spyOn(dbDrizzle, 'dbClient').mockReturnValue(mockDb as any);

    try {
      await getRankingData(mockContext, '2024-01-01', '2024-12-31');
      expect(limitCalled).toBe(true);
      expect(limitValue).toBe(50);
    } finally {
      dbClientSpy.mockRestore();
    }
  });
});

describe('maskRankingData', () => {
  test('should mask non-current users as 匿名', () => {
    const rawData = [
      { userId: 'user_1', totalPeriod: 10 },
      { userId: 'user_2', totalPeriod: 8 },
    ];

    const result = maskRankingData(rawData, 'user_1');
    expect(result[0].userName).toBe('あなた');
    expect(result[1].userName).toBe('匿名');
  });

  test('should mark current user', () => {
    const rawData = [
      { userId: 'user_1', totalPeriod: 10 },
    ];

    const result = maskRankingData(rawData, 'user_1');
    expect(result[0].isCurrentUser).toBe(true);
  });

  test('should calculate practice count correctly', () => {
    const rawData = [
      { userId: 'user_1', totalPeriod: 15 },
    ];

    const result = maskRankingData(rawData, 'user_1');
    expect(result[0].practiceCount).toBe(10);
  });

  test('should assign ranks correctly', () => {
    const rawData = [
      { userId: 'user_1', totalPeriod: 10 },
      { userId: 'user_2', totalPeriod: 8 },
      { userId: 'user_3', totalPeriod: 8 },
      { userId: 'user_4', totalPeriod: 5 },
    ];

    const result = maskRankingData(rawData, 'user_1');
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
    expect(result[2].rank).toBe(2);
    expect(result[3].rank).toBe(4);
  });

  test('should handle empty ranking', () => {
    const rawData: any[] = [];
    const result = maskRankingData(rawData, 'user_1');
    expect(result.length).toBe(0);
  });

  test('should handle single user', () => {
    const rawData = [
      { userId: 'user_1', totalPeriod: 10 },
    ];

    const result = maskRankingData(rawData, 'user_1');
    expect(result.length).toBe(1);
    expect(result[0].rank).toBe(1);
  });

  test('should handle tied scores', () => {
    const rawData = [
      { userId: 'user_1', totalPeriod: 10 },
      { userId: 'user_2', totalPeriod: 10 },
      { userId: 'user_3', totalPeriod: 5 },
    ];

    const result = maskRankingData(rawData, 'user_1');
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(1);
    expect(result[2].rank).toBe(3);
  });

  test('should preserve original user order', () => {
    const rawData = [
      { userId: 'user_1', totalPeriod: 10 },
      { userId: 'user_2', totalPeriod: 8 },
      { userId: 'user_3', totalPeriod: 6 },
    ];

    const result = maskRankingData(rawData, 'user_1');
    expect(result[0].totalPeriod).toBe(10);
    expect(result[1].totalPeriod).toBe(8);
    expect(result[2].totalPeriod).toBe(6);
  });

  test('should calculate ranks based on score changes', () => {
    const rawData = [
      { userId: 'user_1', totalPeriod: 20 },
      { userId: 'user_2', totalPeriod: 20 },
      { userId: 'user_3', totalPeriod: 15 },
      { userId: 'user_4', totalPeriod: 15 },
      { userId: 'user_5', totalPeriod: 10 },
    ];

    const result = maskRankingData(rawData, 'user_1');
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(1);
    expect(result[2].rank).toBe(3);
    expect(result[3].rank).toBe(3);
    expect(result[4].rank).toBe(5);
  });

  test('should handle fractional period values', () => {
    const rawData = [
      { userId: 'user_1', totalPeriod: 4.5 },
    ];

    const result = maskRankingData(rawData, 'user_1');
    expect(result[0].practiceCount).toBe(3);
  });

  test('should increment rank when consecutive entries have different scores', () => {
    const rawData = [
      { userId: 'user_1', totalPeriod: 100 },
      { userId: 'user_2', totalPeriod: 50 },
      { userId: 'user_3', totalPeriod: 50 },
      { userId: 'user_4', totalPeriod: 30 },
    ];

    const result = maskRankingData(rawData, 'user_1');
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
    expect(result[2].rank).toBe(2);
    expect(result[3].rank).toBe(4);
  });

  test('should track previousTotalPeriod correctly across multiple rank changes', () => {
    const rawData = [
      { userId: 'user_1', totalPeriod: 100 },
      { userId: 'user_2', totalPeriod: 90 },
      { userId: 'user_3', totalPeriod: 90 },
      { userId: 'user_4', totalPeriod: 70 },
      { userId: 'user_5', totalPeriod: 70 },
      { userId: 'user_6', totalPeriod: 50 },
    ];

    const result = maskRankingData(rawData, 'user_1');
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
    expect(result[2].rank).toBe(2);
    expect(result[3].rank).toBe(4);
    expect(result[4].rank).toBe(4);
    expect(result[5].rank).toBe(6);
  });

  test('should maintain same rank for consecutive entries with identical scores', () => {
    const rawData = [
      { userId: 'user_1', totalPeriod: 50 },
      { userId: 'user_2', totalPeriod: 50 },
      { userId: 'user_3', totalPeriod: 50 },
    ];

    const result = maskRankingData(rawData, 'user_1');
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(1);
    expect(result[2].rank).toBe(1);
  });
});
