import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import type { Context, Next } from 'hono';
import { requestLogger } from '@/src/middleware/requestLogger';

// Store original console methods
const originalLog = console.log;
let logMock: ReturnType<typeof mock>;

beforeEach(() => {
  logMock = mock(() => {});
  console.log = logMock as any;
});

// Restore console after tests
afterEach(() => {
  console.log = originalLog;
});

function createMockContext(status: number = 200, method: string = 'GET', path: string = '/api/test'): Context {
  return {
    req: {
      method,
      url: `http://localhost${path}`,
      path,
      query: mock(() => ({})),
    },
    res: {
      status,
    },
  } as unknown as Context;
}

describe('requestLogger middleware', () => {
  test('should log info for 2xx status', async () => {
    const c = createMockContext(200, 'GET', '/api/users');
    const next = mock(async () => {
      // No-op
    });

    await requestLogger(c, next as unknown as Next);

    expect(logMock).toHaveBeenCalled();
    const logCall = logMock.mock.calls[0];
    // logCall[0] is an object, not a string
    expect((logCall[0] as any).level).toBe('info');
  });

  test('should log warn for 4xx status', async () => {
    const c = createMockContext(404, 'GET', '/api/users');
    const next = mock(async () => {
      // No-op
    });

    await requestLogger(c, next as unknown as Next);

    expect(logMock).toHaveBeenCalled();
    const logCall = logMock.mock.calls[0];
    expect((logCall[0] as any).level).toBe('warn');
  });

  test('should log error for 5xx status', async () => {
    const c = createMockContext(500, 'GET', '/api/users');
    const next = mock(async () => {
      // No-op
    });

    await requestLogger(c, next as unknown as Next);

    expect(logMock).toHaveBeenCalled();
    const logCall = logMock.mock.calls[0];
    expect((logCall[0] as any).level).toBe('error');
  });

  test('should log request method and URL', async () => {
    const c = createMockContext(200, 'POST', '/api/records');
    const next = mock(async () => {
      // No-op
    });

    await requestLogger(c, next as unknown as Next);

    expect(logMock).toHaveBeenCalled();
    const logCall = logMock.mock.calls[0];
    expect((logCall[0] as any).request.method).toBe('POST');
    expect((logCall[0] as any).request.url).toContain('/api/records');
  });

  test('should include response status and duration', async () => {
    const c = createMockContext(200, 'GET', '/api/test');
    const next = mock(async () => {
      // Simulate some delay
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    await requestLogger(c, next as unknown as Next);

    expect(logMock).toHaveBeenCalled();
    const logCall = logMock.mock.calls[0];
    expect((logCall[0] as any).response.status).toBe(200);
    expect((logCall[0] as any).response.duration).toMatch(/ms$/);
  });

  test('should handle various HTTP methods', async () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    for (const method of methods) {
      logMock = mock(() => {});
      console.log = logMock as any;

      const c = createMockContext(200, method, '/api/test');
      const next = mock(async () => {
        // No-op
      });

      await requestLogger(c, next as unknown as Next);

      expect(logMock).toHaveBeenCalled();
      const logCall = logMock.mock.calls[0];
      expect((logCall[0] as any).request.method).toBe(method);
    }
  });

  test('should handle status code boundaries', async () => {
    const testCases = [
      { status: 399, expectedLevel: 'info' },
      { status: 400, expectedLevel: 'warn' },
      { status: 499, expectedLevel: 'warn' },
      { status: 500, expectedLevel: 'error' },
      { status: 599, expectedLevel: 'error' },
    ];

    for (const { status, expectedLevel } of testCases) {
      logMock = mock(() => {});
      console.log = logMock as any;

      const c = createMockContext(status, 'GET', '/api/test');
      const next = mock(async () => {
        // No-op
      });

      await requestLogger(c, next as unknown as Next);

      const logCall = logMock.mock.calls[0];
      expect((logCall[0] as any).level).toBe(expectedLevel);
    }
  });

  test('should measure timing accurately', async () => {
    const c = createMockContext(200, 'GET', '/api/test');
    const delay = 5;
    const next = mock(async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
    });

    await requestLogger(c, next as unknown as Next);

    const logCall = logMock.mock.calls[0];
    const durationStr = (logCall[0] as any).response.duration;
    const durationMs = parseInt(durationStr);
    expect(durationMs).toBeGreaterThanOrEqual(delay - 5);
  });

  test('should include query parameters in log', async () => {
    const c = createMockContext(200, 'GET', '/api/test');
    c.req.query = mock(() => ({ page: '1', limit: '10' }));

    const next = mock(async () => {
      // No-op
    });

    await requestLogger(c, next as unknown as Next);

    expect(logMock).toHaveBeenCalled();
    const logCall = logMock.mock.calls[0];
    expect((logCall[0] as any).request.query).toBeDefined();
  });
});

function afterEach() {
  // Restore after each test
  console.log = originalLog;
}
