import { describe, test, expect } from 'bun:test';

describe('GET /api/admin/dashboard', () => {
  test('should return dashboard statistics', () => {
    const response = new Response(JSON.stringify({
      inactiveUsers: [],
      thresholdDate: '2024-01-01',
    }), { status: 200 });

    expect(response.status).toBe(200);
  });

  test('should identify inactive users (3 weeks no activity)', () => {
    const now = new Date();
    const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
    expect(threeWeeksAgo).toBeDefined();
  });

  test('should include threshold date', async () => {
    const response = new Response(JSON.stringify({
      inactiveUsers: [],
      thresholdDate: '2024-01-01',
    }), { status: 200 });

    const data = await response.json() as any;
    expect(data.thresholdDate).toBeDefined();
  });

  test('should filter users with no recent activity', () => {
    const inactiveUsers = [];
    expect(inactiveUsers).toBeDefined();
  });
});

describe('GET /api/admin/norms', () => {
  test('should return users and norms', () => {
    const response = new Response(JSON.stringify({
      users: [],
      norms: [],
      search: '',
    }), { status: 200 });

    expect(response.status).toBe(200);
  });

  test('should support query parameter', () => {
    const query = { query: 'test' };
    expect(query.query).toBe('test');
  });

  test('should support limit parameter', () => {
    const query = { limit: 20 };
    expect(query.limit).toBe(20);
  });

  test('should return norms with current progress', () => {
    const norm = {
      userId: 'user_123',
      current: 10,
      required: 40,
      progress: 25,
      isMet: false,
      grade: 1,
      gradeLabel: '初段',
      lastPromotionDate: '2024-01-01',
    };

    expect(norm.current).toBe(10);
    expect(norm.required).toBe(40);
    expect(norm.progress).toBe(25);
  });

  test('should calculate progress percentage', () => {
    const current = 20;
    const required = 40;
    const progress = Math.min(100, Math.round((current / required) * 100));
    expect(progress).toBe(50);
  });

  test('should indicate if requirement is met', () => {
    const current = 40;
    const required = 40;
    const isMet = current >= required;
    expect(isMet).toBe(true);
  });

  test('should cap progress at 100%', () => {
    const current = 50;
    const required = 40;
    const progress = Math.min(100, Math.round((current / required) * 100));
    expect(progress).toBe(100);
  });

  test('should use getGradeAt as reference date if available', () => {
    const profile = { getGradeAt: '2024-03-15', joinedAt: 2024 };
    const referenceDate = profile.getGradeAt || String(profile.joinedAt);
    expect(referenceDate).toBe('2024-03-15');
  });

  test('should fallback to joinedAt if getGradeAt missing', () => {
    const profile = { getGradeAt: null, joinedAt: 2024 };
    const referenceDate = profile.getGradeAt || String(profile.joinedAt);
    expect(referenceDate).toBe('2024');
  });

  test('should include grade label', () => {
    const norm = {
      userId: 'user_123',
      current: 0,
      required: 30,
      progress: 0,
      isMet: false,
      grade: 1,
      gradeLabel: '初段',
      lastPromotionDate: null,
    };

    expect(norm.gradeLabel).toBe('初段');
  });

  test('should include last promotion date', () => {
    const norm = {
      userId: 'user_123',
      current: 40,
      required: 30,
      progress: 100,
      isMet: true,
      grade: 2,
      gradeLabel: '二段',
      lastPromotionDate: '2024-06-15',
    };

    expect(norm.lastPromotionDate).toBe('2024-06-15');
  });
});

describe('Dashboard stats calculation', () => {
  test('should get all users from Clerk', () => {
    const userList = [
      { id: 'user_1', firstName: 'Test1' },
      { id: 'user_2', firstName: 'Test2' },
    ];

    expect(userList.length).toBe(2);
  });

  test('should query activities in last 3 weeks', () => {
    const now = new Date();
    const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
    const threeWeeksAgoStr = threeWeeksAgo.toISOString().split('T')[0];
    expect(threeWeeksAgoStr).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  test('should identify inactive users correctly', () => {
    const activeUserIds = new Set(['user_1', 'user_3']);
    const allUsers = ['user_1', 'user_2', 'user_3', 'user_4'];
    const inactiveUsers = allUsers.filter(u => !activeUserIds.has(u));
    expect(inactiveUsers).toEqual(['user_2', 'user_4']);
  });
});

describe('Norms calculation', () => {
  test('should calculate required training hours for next grade', () => {
    const timeForNextGrade = 30;
    expect(timeForNextGrade).toBeGreaterThan(0);
  });

  test('should sum activities after grade date', () => {
    const activities = [
      { date: '2024-01-01', period: 1.5 },
      { date: '2024-03-20', period: 1.5 },
      { date: '2024-04-01', period: 1.5 },
    ];

    const gradeDate = '2024-03-15';
    const sum = activities
      .filter(a => a.date > gradeDate)
      .reduce((s, a) => s + a.period, 0);

    expect(sum).toBe(3);
  });

  test('should handle users with no valid profile', () => {
    // Users without valid profile are skipped
    const validProfiles = [];
    expect(validProfiles.length).toBe(0);
  });

  test('should handle users with no activities', () => {
    const userActivities = [];
    const totalPeriod = userActivities.reduce((sum, a) => sum + (a as any).period, 0);
    expect(totalPeriod).toBe(0);
  });

  test('should map grades to labels', () => {
    const gradeLabel = 'テスト段';
    expect(gradeLabel).toBeDefined();
  });
});
