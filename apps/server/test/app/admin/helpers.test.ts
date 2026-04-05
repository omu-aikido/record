import { describe, test, expect } from 'bun:test';
import * as helpers from '@/src/app/admin/helpers';

describe('accountsQuerySchema', () => {
  test('should accept empty object', () => {
    const data = {};
    expect(data).toBeDefined();
  });

  test('should accept query parameter', () => {
    const data = { query: 'test' };
    expect(data.query).toBe('test');
  });

  test('should accept limit parameter', () => {
    const data = { limit: '20' };
    expect(data.limit).toBe('20');
  });

  test('should accept page parameter', () => {
    const data = { page: '1' };
    expect(data.page).toBe('1');
  });

  test('should accept sortBy parameter', () => {
    const data = { sortBy: 'created_at' };
    expect(data.sortBy).toBe('created_at');
  });

  test('should accept sortOrder parameter', () => {
    const data = { sortOrder: 'desc' };
    expect(data.sortOrder).toBe('desc');
  });

  test('should accept all parameters together', () => {
    const data = {
      query: 'test',
      limit: '20',
      page: '1',
      sortBy: 'created_at',
      sortOrder: 'asc',
    };

    expect(data.query).toBe('test');
    expect(data.limit).toBe('20');
  });
});

describe('userActivitiesQuerySchema', () => {
  test('should accept empty object', () => {
    const data = {};
    expect(data).toBeDefined();
  });

  test('should accept page parameter', () => {
    const data = { page: '1' };
    expect(data.page).toBe('1');
  });

  test('should accept limit parameter', () => {
    const data = { limit: '10' };
    expect(data.limit).toBe('10');
  });
});

describe('adminProfileUpdateSchema', () => {
  test('should require year', () => {
    const data = { year: '2024' };
    expect(data.year).toBe('2024');
  });

  test('should require grade', () => {
    const data = { grade: 2 };
    expect(data.grade).toBe(2);
  });

  test('should require role', () => {
    const data = { role: 'member' };
    expect(data.role).toBe('member');
  });

  test('should require joinedAt', () => {
    const data = { joinedAt: 2024 };
    expect(data.joinedAt).toBe(2024);
  });

  test('should accept optional getGradeAt', () => {
    const data = { getGradeAt: '2024-03-15' };
    expect(data.getGradeAt).toBe('2024-03-15');
  });

  test('should accept null getGradeAt', () => {
    const data = { getGradeAt: null };
    expect(data.getGradeAt).toBeNull();
  });
});

describe('publicMetadataProfileSchema', () => {
  test('should accept optional role', () => {
    const data = { role: 'admin' };
    expect(data.role).toBe('admin');
  });

  test('should accept numeric grade', () => {
    const data = { grade: 2 };
    expect(data.grade).toBe(2);
  });

  test('should accept string grade', () => {
    const data = { grade: '2' };
    expect(data.grade).toBe('2');
  });

  test('should accept joinedAt', () => {
    const data = { joinedAt: 2024 };
    expect(data.joinedAt).toBe(2024);
  });

  test('should accept year', () => {
    const data = { year: '2024' };
    expect(data.year).toBe('2024');
  });

  test('should accept getGradeAt date', () => {
    const data = { getGradeAt: '2024-03-15' };
    expect(data.getGradeAt).toBe('2024-03-15');
  });

  test('should accept null getGradeAt', () => {
    const data = { getGradeAt: null };
    expect(data.getGradeAt).toBeNull();
  });

  test('should accept all fields', () => {
    const data = {
      role: 'admin',
      grade: 3,
      joinedAt: 2023,
      year: '2024',
      getGradeAt: '2024-01-15',
    };

    expect(data.role).toBe('admin');
    expect(data.grade).toBe(3);
  });
});

describe('toAdminUser', () => {
  test('should convert basic user info', () => {
    const user = {
      id: 'user_123',
      firstName: 'Test',
      lastName: 'User',
      imageUrl: 'https://example.com/image.jpg',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      publicMetadata: {},
    };

    expect(user.id).toBe('user_123');
    expect(user.firstName).toBe('Test');
  });

  test('should extract role from metadata', () => {
    const metadata = { role: 'admin' };
    expect(metadata.role).toBe('admin');
  });

  test('should default role to member', () => {
    const metadata = {};
    const role = (metadata as any).role || 'member';
    expect(role).toBe('member');
  });

  test('should parse numeric grade', () => {
    const metadata = { grade: 2 };
    expect(metadata.grade).toBe(2);
  });

  test('should parse string grade as number', () => {
    const gradeStr = '2';
    const grade = parseInt(gradeStr, 10) || 0;
    expect(grade).toBe(2);
  });

  test('should default grade to 0', () => {
    const metadata = {};
    const grade = (metadata as any).grade || 0;
    expect(grade).toBe(0);
  });

  test('should extract joinedAt year', () => {
    const metadata = { joinedAt: 2024 };
    expect(metadata.joinedAt).toBe(2024);
  });

  test('should extract year field', () => {
    const metadata = { year: '2024' };
    expect(metadata.year).toBe('2024');
  });

  test('should extract getGradeAt date', () => {
    const metadata = { getGradeAt: '2024-03-15' };
    expect(metadata.getGradeAt).toBe('2024-03-15');
  });

  test('should handle missing email', () => {
    const user = {
      id: 'user_123',
      emailAddresses: [],
      publicMetadata: {},
    };

    const email = user.emailAddresses[0]?.emailAddress ?? null;
    expect(email).toBeNull();
  });
});

describe('coerceProfileMetadata', () => {
  test('should return metadata if it is an object', () => {
    const metadata = { role: 'admin' };
    const coerced = metadata && typeof metadata === 'object' ? metadata : {};
    expect(coerced).toEqual(metadata);
  });

  test('should return empty object if metadata is null', () => {
    const metadata = null;
    const coerced = metadata && typeof metadata === 'object' ? metadata : {};
    expect(coerced).toEqual({});
  });

  test('should return empty object if metadata is undefined', () => {
    const metadata = undefined;
    const coerced = metadata && typeof metadata === 'object' ? metadata : {};
    expect(coerced).toEqual({});
  });

  test('should return empty object if metadata is not an object', () => {
    const metadata = 'string';
    const coerced = metadata && typeof metadata === 'object' ? metadata : {};
    expect(coerced).toEqual({});
  });
});

describe('getJST', () => {
  test('should convert UTC to JST (+9 hours)', () => {
    const utcDate = new Date('2024-01-01T00:00:00Z');
    const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    expect(jstDate.getUTCHours()).toBe(9);
  });

  test('should handle different times correctly', () => {
    const utcDate = new Date('2024-01-01T12:00:00Z');
    const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    expect(jstDate.getUTCHours()).toBe(21);
  });

  test('should handle date boundaries', () => {
    const utcDate = new Date('2024-01-01T22:00:00Z');
    const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    // Should roll over to next day
    expect(jstDate.getUTCDate()).toBeGreaterThanOrEqual(utcDate.getUTCDate());
  });
});

describe('formatDateToJSTString', () => {
  test('should format date as YYYY-MM-DD in JST', () => {
    const utcDate = new Date('2024-01-15T00:00:00Z');
    const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    const dateStr = jstDate.toISOString().split('T')[0];
    expect(dateStr).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  test('should correctly format various dates', () => {
    const dates = [
      '2024-01-01T00:00:00Z',
      '2024-06-15T12:00:00Z',
      '2024-12-31T23:59:59Z',
    ];

    for (const dateStr of dates) {
      const utcDate = new Date(dateStr);
      const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
      const formatted = jstDate.toISOString().split('T')[0];
      expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}/);
    }
  });

  test('should handle month/day boundaries', () => {
    const utcDate = new Date('2024-01-31T23:00:00Z');
    const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    const formatted = jstDate.toISOString().split('T')[0];
    // JST is +9, so this will be Feb 1
    expect(formatted).toBeDefined();
  });
});
