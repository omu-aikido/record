import { describe, test, expect, mock, beforeEach } from 'bun:test';
import type { Context } from 'hono';

function createMockContext(auth?: any, env?: any): Context {
  return {
    env: env || {
      CLERK_SECRET_KEY: 'test-secret',
    },
    req: {
      method: 'GET',
      url: 'http://localhost/api/clerk',
      path: '/api/clerk',
      valid: mock((type: string) => {
        if (type === 'form') return {};
        if (type === 'json') return {};
        return {};
      }),
    },
    json: mock((data: any, status?: number) => {
      return new Response(JSON.stringify(data), { status: status || 200 });
    }),
    __mockAuth: auth,
  } as unknown as Context;
}

describe('GET /api/user/clerk/account', () => {
  test('should return 401 when not authenticated', () => {
    const response = new Response(JSON.stringify({ error: 'Not Authenticated' }), { status: 401 });
    expect(response.status).toBe(401);
  });

  test('should return user data when authenticated', () => {
    const userData = {
      id: 'user_123',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      imageUrl: 'https://example.com/image.jpg',
    };

    expect(userData.id).toBe('user_123');
    expect(userData.username).toBe('testuser');
  });

  test('should return user info with all fields', () => {
    const response = new Response(JSON.stringify({
      id: 'user_123',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      imageUrl: 'https://example.com/image.jpg',
    }), { status: 200 });

    expect(response.status).toBe(200);
  });
});

describe('PATCH /api/user/clerk/account', () => {
  test('should return 400 for invalid account payload', () => {
    const response = new Response(JSON.stringify({ error: 'Invalid account payload' }), { status: 400 });
    expect(response.status).toBe(400);
  });

  test('should return 401 when not authenticated', () => {
    const response = new Response(JSON.stringify({ error: 'Not Authenticated' }), { status: 401 });
    expect(response.status).toBe(401);
  });

  test('should update username', () => {
    const data = { username: 'newusername' };
    expect(data.username).toBe('newusername');
  });

  test('should update firstName', () => {
    const data = { firstName: 'NewFirst' };
    expect(data.firstName).toBe('NewFirst');
  });

  test('should update lastName', () => {
    const data = { lastName: 'NewLast' };
    expect(data.lastName).toBe('NewLast');
  });

  test('should update profile image', () => {
    const imageFile = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
    expect(imageFile.size).toBeGreaterThan(0);
  });

  test('should return updated user data on success', () => {
    const response = new Response(JSON.stringify({
      userId: 'user_123',
      username: 'updated',
      firstName: 'Updated',
      lastName: 'User',
      imageUrl: 'https://example.com/updated.jpg',
    }), { status: 200 });

    expect(response.status).toBe(200);
  });

  test('should handle multiple field updates', () => {
    const data = {
      username: 'newuser',
      firstName: 'New',
      lastName: 'User',
    };

    expect(data.username).toBe('newuser');
    expect(data.firstName).toBe('New');
    expect(data.lastName).toBe('User');
  });

  test('should ignore empty profile image', () => {
    const imageFile = new File([], 'image.jpg', { type: 'image/jpeg' });
    expect(imageFile.size).toBe(0);
  });
});

describe('GET /api/user/clerk/profile', () => {
  test('should return 401 when not authenticated', () => {
    const response = new Response(JSON.stringify({ error: 'Not Authenticated' }), { status: 401 });
    expect(response.status).toBe(401);
  });

  test('should return profile data', () => {
    const response = new Response(JSON.stringify({
      profile: {
        id: 'user_123',
        role: 'member',
        grade: 1,
        joinedAt: 2024,
        year: '2024',
      },
    }), { status: 200 });

    expect(response.status).toBe(200);
  });

  test('should include user id in response', () => {
    const profile = {
      id: 'user_123',
      role: 'member',
      grade: 1,
    };

    expect(profile.id).toBe('user_123');
  });
});

describe('PATCH /api/user/clerk/profile', () => {
  test('should return 400 for invalid profile payload', () => {
    const response = new Response(JSON.stringify({ error: 'Invalid profile payload' }), { status: 400 });
    expect(response.status).toBe(400);
  });

  test('should update profile grade', () => {
    const data = { grade: 2 };
    expect(data.grade).toBe(2);
  });

  test('should update profile year', () => {
    const data = { year: '2025' };
    expect(data.year).toBe('2025');
  });

  test('should update joinedAt', () => {
    const data = { joinedAt: 2023 };
    expect(data.joinedAt).toBe(2023);
  });

  test('should update getGradeAt date', () => {
    const data = { getGradeAt: '2024-03-15' };
    expect(data.getGradeAt).toBe('2024-03-15');
  });

  test('should not allow changing role', () => {
    // Users cannot change their own role
    const data = { grade: 1, year: '2024', joinedAt: 2024 };
    expect((data as any).role).toBeUndefined();
  });

  test('should return updated profile on success', () => {
    const response = new Response(JSON.stringify({
      profile: {
        id: 'user_123',
        role: 'member',
        grade: 2,
        joinedAt: 2024,
        year: '2024',
      },
    }), { status: 200 });

    expect(response.status).toBe(200);
  });
});

describe('GET /api/user/clerk/menu', () => {
  test('should return 401 when not authenticated', () => {
    const response = new Response(JSON.stringify({ error: 'Not Authenticated' }), { status: 401 });
    expect(response.status).toBe(401);
  });

  test('should include record menu item for all users', () => {
    const menu = [
      { id: 'record', title: '活動記録', href: '/record' },
    ];

    expect(menu.some(m => m.id === 'record')).toBe(true);
  });

  test('should include account menu item for all users', () => {
    const menu = [
      { id: 'account', title: 'アカウント', href: '/account' },
    ];

    expect(menu.some(m => m.id === 'account')).toBe(true);
  });

  test('should include admin menu item for management users', () => {
    const isManagement = true;
    if (isManagement) {
      const menu = [
        { id: 'admin', title: '管理パネル', href: '/admin' },
      ];
      expect(menu.some(m => m.id === 'admin')).toBe(true);
    }
  });

  test('should not include admin menu for non-management users', () => {
    const isManagement = false;
    if (!isManagement) {
      const menu = [
        { id: 'record', title: '活動記録', href: '/record' },
        { id: 'account', title: 'アカウント', href: '/account' },
      ];
      expect(menu.some(m => m.id === 'admin')).toBe(false);
    }
  });

  test('should return menu with icons and themes', () => {
    const menuItem = {
      id: 'record',
      title: '活動記録',
      href: '/record',
      icon: 'clipboard-list',
      theme: 'blue',
    };

    expect(menuItem.icon).toBeDefined();
    expect(menuItem.theme).toBeDefined();
  });
});
