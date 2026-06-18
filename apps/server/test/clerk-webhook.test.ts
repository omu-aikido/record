import { beforeEach, describe, expect, mock, test } from 'bun:test';

const updateUserMock = mock(async () => {});
const notifyMock = mock(() => {});

mock.module('svix', () => ({
  Webhook: class {
    constructor(_secret: string) {}

    verify(payload: string) {
      return JSON.parse(payload);
    }
  },
}));

mock.module('@clerk/backend', () => ({
  createClerkClient: () => ({
    users: {
      updateUser: updateUserMock,
    },
  }),
}));

mock.module('@/src/lib/observability', () => ({
  notify: notifyMock,
}));

const { webhooks } = await import('@/src/app/webhooks/clerk');

const testEnv = {
  CLERK_SECRET_KEY: 'test-secret',
  CLERK_WEBHOOK_SECRET: 'whsec_test',
} as Env;

describe('POST /clerk', () => {
  beforeEach(() => {
    updateUserMock.mockClear();
    notifyMock.mockClear();
  });

  test('migrates birthday from unsafe metadata to public metadata on user.created', async () => {
    const res = await webhooks.request(
      'http://localhost/clerk',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'svix-id': '1',
          'svix-timestamp': '1',
          'svix-signature': 'test',
        },
        body: JSON.stringify({
          type: 'user.created',
          data: {
            id: 'user_123',
            unsafe_metadata: {
              year: 'b1',
              grade: 0,
              joinedAt: 2024,
              getGradeAt: null,
              birthday: '2001-02-03',
            },
          },
        }),
      },
      testEnv
    );

    expect(res.status).toBe(200);
    expect(updateUserMock).toHaveBeenCalledWith(
      'user_123',
      expect.objectContaining({
        publicMetadata: expect.objectContaining({
          birthday: '2001-02-03',
        }),
      })
    );
  });
});
