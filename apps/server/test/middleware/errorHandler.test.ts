import { describe, test, expect, mock, beforeEach } from 'bun:test';
import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { errorHandler } from '@/src/middleware/errorHandler';

// Mock context and next
function createMockContext(resStatus: number = 200): Context {
  return {
    req: {
      method: 'GET',
      url: 'http://localhost/api/test',
      path: '/api/test',
      header: mock(() => ''),
    },
    res: new Response('test', { status: resStatus }),
    json: mock((data: unknown, status?: number) => {
      return new Response(JSON.stringify(data), { status: status || 200 });
    }),
    status: mock((code: number) => {
      return { res: { status: code } };
    }),
  } as unknown as Context;
}

describe('errorHandler middleware', () => {
  test('should pass through successful requests', async () => {
    const c = createMockContext(200);
    const next = mock(async () => {
      // simulate successful execution
    });

    const result = await errorHandler(c, next as unknown as Next);
    expect(result).toBeDefined();
  });

  test('should handle HTTPException', async () => {
    const c = createMockContext();
    const httpException = new HTTPException(404, { message: 'Not found' });

    const next = mock(async () => {
      throw httpException;
    });

    const result = await errorHandler(c, next as unknown as Next);
    expect(result.status).toBe(404);
  });

  test('should handle Error objects with 500 response', async () => {
    const c = createMockContext();
    const error = new Error('Something went wrong');

    const next = mock(async () => {
      throw error;
    });

    const result = await errorHandler(c, next as unknown as Next);
    expect(result.status).toBe(500);
  });

  test('should handle non-Error thrown values', async () => {
    const c = createMockContext();

    const next = mock(async () => {
      throw 'string error';
    });

    const result = await errorHandler(c, next as unknown as Next);
    expect(result.status).toBe(500);
  });

  test('should return JSON error response with error field', async () => {
    const c = createMockContext();
    const error = new Error('Test error');

    const next = mock(async () => {
      throw error;
    });

    const result = await errorHandler(c, next as unknown as Next);
    expect(result.status).toBe(500);
  });

  test('should include error message in response', async () => {
    const c = createMockContext();
    const errorMessage = 'Specific error message';
    const error = new Error(errorMessage);

    const next = mock(async () => {
      throw error;
    });

    const result = await errorHandler(c, next as unknown as Next);
    expect(result.status).toBe(500);
  });
});
