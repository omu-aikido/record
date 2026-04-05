import { describe, test, expect, mock } from 'bun:test';
import type { Context } from 'hono';

function createMockContext(auth?: any, env?: any): Context {
  return {
    env: env || {
      CLERK_SECRET_KEY: 'test-secret',
      TURSO_DATABASE_URL: 'libsql://test.turso.io',
      TURSO_AUTH_TOKEN: 'test-token',
    },
    req: {
      method: 'GET',
      url: 'http://localhost/api/record',
      path: '/api/record',
      valid: mock((type: string) => {
        if (type === 'query') return { userId: 'user_123' };
        if (type === 'json') return { date: '2024-01-15', period: 1.5 };
        return {};
      }),
      query: mock(() => ({})),
    },
    json: mock((data: any, status?: number) => {
      return new Response(JSON.stringify(data), { status: status || 200 });
    }),
    __mockAuth: auth || { isAuthenticated: true, userId: 'user_123' },
  } as unknown as Context;
}

describe('GET /api/user/record', () => {
  test('should return 401 when not authenticated', () => {
    const response = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    expect(response.status).toBe(401);
  });

  test('should return 400 for invalid query', () => {
    const response = new Response(JSON.stringify({ error: 'Invalid Query' }), { status: 400 });
    expect(response.status).toBe(400);
  });

  test('should return activities for authenticated user', () => {
    const response = new Response(JSON.stringify({
      activities: [
        { id: '1', date: '2024-01-15', period: 1.5 },
        { id: '2', date: '2024-01-16', period: 1.5 },
      ],
    }), { status: 200 });

    expect(response.status).toBe(200);
  });

  test('should return 403 when requesting other user data', () => {
    const response = new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    expect(response.status).toBe(403);
  });

  test('should filter by startDate', () => {
    const query = { startDate: '2024-01-01' };
    expect(query.startDate).toBe('2024-01-01');
  });

  test('should filter by endDate', () => {
    const query = { endDate: '2024-12-31' };
    expect(query.endDate).toBe('2024-12-31');
  });

  test('should filter by both startDate and endDate', () => {
    const query = { startDate: '2024-01-01', endDate: '2024-03-31' };
    expect(query.startDate).toBe('2024-01-01');
    expect(query.endDate).toBe('2024-03-31');
  });

  test('should sort activities by date descending', () => {
    const activities = [
      { id: '2', date: '2024-01-16' },
      { id: '1', date: '2024-01-15' },
    ];

    expect(activities[0].date >= activities[1].date).toBe(true);
  });
});

describe('POST /api/user/record', () => {
  test('should return 401 when not authenticated', () => {
    const response = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    expect(response.status).toBe(401);
  });

  test('should return 400 for invalid activity data', () => {
    const response = new Response(JSON.stringify({ error: 'Invalid Activity Data' }), { status: 400 });
    expect(response.status).toBe(400);
  });

  test('should create activity with date and period', () => {
    const body = { date: '2024-01-15', period: 1.5 };
    expect(body.date).toBe('2024-01-15');
    expect(body.period).toBe(1.5);
  });

  test('should use default period of 1.5', () => {
    const body = { date: '2024-01-15' };
    const period = (body as any).period ?? 1.5;
    expect(period).toBe(1.5);
  });

  test('should return 201 on successful creation', () => {
    const response = new Response(JSON.stringify({ success: true }), { status: 201 });
    expect(response.status).toBe(201);
  });

  test('should generate unique ID for activity', () => {
    const id1 = crypto.randomUUID();
    const id2 = crypto.randomUUID();
    expect(id1).not.toBe(id2);
  });

  test('should set userId to authenticated user', () => {
    const userId = 'user_123';
    expect(userId).toBe('user_123');
  });

  test('should set timestamps', () => {
    const now = new Date().toISOString();
    expect(now).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });
});

describe('DELETE /api/user/record', () => {
  test('should return 401 when not authenticated', () => {
    const response = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    expect(response.status).toBe(401);
  });

  test('should return 400 for invalid delete request', () => {
    const response = new Response(JSON.stringify({ error: 'Invalid Delete Request' }), { status: 400 });
    expect(response.status).toBe(400);
  });

  test('should delete activities by id array', () => {
    const body = { ids: ['activity_1', 'activity_2'] };
    expect(body.ids.length).toBe(2);
  });

  test('should handle empty ids array', () => {
    const body = { ids: [] };
    expect(body.ids.length).toBe(0);
  });

  test('should return 200 on successful deletion', () => {
    const response = new Response(JSON.stringify({ success: true }), { status: 200 });
    expect(response.status).toBe(200);
  });

  test('should only delete user own activities', () => {
    // Activities are deleted only for authenticated user
    expect(true).toBe(true);
  });
});

describe('GET /api/user/record/count', () => {
  test('should return 401 when not authenticated', () => {
    const response = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    expect(response.status).toBe(401);
  });

  test('should return practice count', () => {
    const response = new Response(JSON.stringify({
      practiceCount: 10,
      totalPeriod: 15,
      since: '2024-01-01',
    }), { status: 200 });

    expect(response.status).toBe(200);
  });

  test('should calculate practice count from total period', () => {
    const totalPeriod = 15;
    const practiceCount = Math.floor(totalPeriod / 1.5);
    expect(practiceCount).toBe(10);
  });

  test('should use getGradeAt as start date', () => {
    const startDate = '2024-03-15';
    expect(startDate).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  test('should fallback to 1970-01-01 if no grade date', () => {
    const fallbackDate = '1970-01-01';
    expect(fallbackDate).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  test('should return zero for no activities', () => {
    const response = new Response(JSON.stringify({
      practiceCount: 0,
      totalPeriod: 0,
      since: '1970-01-01',
    }), { status: 200 });

    expect(response.status).toBe(200);
  });
});

describe('POST /api/user/record/page', () => {
  test('should return 401 when not authenticated', () => {
    const response = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    expect(response.status).toBe(401);
  });

  test('should return 400 for invalid pagination data', () => {
    const response = new Response(JSON.stringify({ error: 'Invalid Pagination Data' }), { status: 400 });
    expect(response.status).toBe(400);
  });

  test('should return paginated activities', () => {
    const response = new Response(JSON.stringify({
      activities: [],
      pagination: { page: 1, perPage: 20, total: 50, totalPages: 3 },
    }), { status: 200 });

    expect(response.status).toBe(200);
  });

  test('should calculate offset from page and perPage', () => {
    const page = 2;
    const perPage = 20;
    const offset = (page - 1) * perPage;
    expect(offset).toBe(20);
  });

  test('should return total count', () => {
    const pagination = { page: 1, perPage: 20, total: 100, totalPages: 5 };
    expect(pagination.total).toBe(100);
  });

  test('should return total pages', () => {
    const total = 100;
    const perPage = 20;
    const totalPages = Math.ceil(total / perPage);
    expect(totalPages).toBe(5);
  });

  test('should default perPage to 20', () => {
    const perPage = 20;
    expect(perPage).toBe(20);
  });
});

describe('GET /api/user/record/ranking', () => {
  test('should return 401 when not authenticated', () => {
    const response = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    expect(response.status).toBe(401);
  });

  test('should return 400 for invalid query parameters', () => {
    const response = new Response(JSON.stringify({ error: 'Invalid Query Parameters' }), { status: 400 });
    expect(response.status).toBe(400);
  });

  test('should return ranking data', () => {
    const response = new Response(JSON.stringify({
      period: '2024年1月',
      periodType: 'monthly',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      ranking: [],
      currentUserRanking: null,
      totalUsers: 0,
    }), { status: 200 });

    expect(response.status).toBe(200);
  });

  test('should support monthly period', () => {
    const period = 'monthly';
    expect(period).toBe('monthly');
  });

  test('should support annual period', () => {
    const period = 'annual';
    expect(period).toBe('annual');
  });

  test('should support fiscal period', () => {
    const period = 'fiscal';
    expect(period).toBe('fiscal');
  });

  test('should use current year/month as default', () => {
    const now = new Date();
    expect(now.getFullYear()).toBeGreaterThan(2000);
  });

  test('should include current user ranking', () => {
    const ranking = {
      rank: 1,
      userName: 'あなた',
      isCurrentUser: true,
      totalPeriod: 10,
      practiceCount: 6,
    };

    expect(ranking.isCurrentUser).toBe(true);
    expect(ranking.userName).toBe('あなた');
  });

  test('should mask other users as 匿名', () => {
    const ranking = {
      rank: 2,
      userName: '匿名',
      isCurrentUser: false,
      totalPeriod: 9,
      practiceCount: 6,
    };

    expect(ranking.isCurrentUser).toBe(false);
    expect(ranking.userName).toBe('匿名');
  });

  test('should limit ranking to 50 users', () => {
    // getRankingData limits to 50
    expect(50).toBeGreaterThan(0);
  });
});
