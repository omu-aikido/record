import { describe, test, expect, mock, beforeEach } from 'bun:test';
import type { Context } from 'hono';
import { notify } from '@/src/lib/observability';
import { notify } from '@/src/lib/observability';

const originalError = console.error;
const originalWarn = console.warn;

let errorMock: ReturnType<typeof mock>;
let warnMock: ReturnType<typeof mock>;

beforeEach(() => {
  errorMock = mock(() => {});
  warnMock = mock(() => {});
  console.error = errorMock as any;
  console.warn = warnMock as any;
});

function createMockContext(method: string = 'GET', path: string = '/api/test'): Context {
  return {
    req: {
      method,
      url: `http://localhost${path}`,
      path,
      header: mock((name: string) => {
        if (name === 'user-agent') return 'Mozilla/5.0';
        if (name === 'cf-ray') return 'ray-123';
        if (name === 'cf-connecting-ip') return '192.168.1.1';
        return undefined;
      }),
    },
  } as unknown as Context;
}

describe('notify function', () => {
  test('should log to console when called', () => {
    const c = createMockContext('GET', '/api/test');
    const error = new Error('Server error');

    notify(c, error, { statusCode: 500 });

    // Verify a console method was called
    expect(errorMock.mock.calls.length + warnMock.mock.calls.length).toBeGreaterThan(0);
  });

  test('should log to console.warn for 4xx status', () => {
    const c = createMockContext('GET', '/api/test');
    const error = new Error('Bad request');

    notify(c, error, { statusCode: 400 });

    expect(warnMock).toHaveBeenCalled();
  });

  test('should log to console.warn when no metadata provided', () => {
    const c = createMockContext('GET', '/api/test');
    const error = new Error('Some error');

    notify(c, error);

    expect(warnMock).toHaveBeenCalled();
  });

  test('should include error details in log', () => {
    const c = createMockContext('POST', '/api/users');
    const error = new Error('Test error message');

    notify(c, error, { statusCode: 500 });

    expect(errorMock).toHaveBeenCalled();
    const call = errorMock.mock.calls[0];
    const logData = JSON.parse(call[0] as string);
    expect(logData.error.message).toBe('Test error message');
    expect(logData.error.name).toBe('Error');
  });

  test('should include request details in log', () => {
    const c = createMockContext('GET', '/api/users');
    const error = new Error('Test error');

    notify(c, error, { statusCode: 500 });

    const call = errorMock.mock.calls[0];
    const logData = JSON.parse(call[0] as string);
    expect(logData.request.method).toBe('GET');
    expect(logData.request.path).toBe('/api/users');
  });

  test('should include custom metadata', () => {
    const c = createMockContext('GET', '/api/test');
    const error = new Error('Test error');
    const metadata = { userId: 'user_123', statusCode: 500 };

    notify(c, error, metadata);

    const call = errorMock.mock.calls[0];
    const logData = JSON.parse(call[0] as string);
    expect(logData.metadata.userId).toBe('user_123');
  });

  test('should include timestamp', () => {
    const c = createMockContext('GET', '/api/test');
    const error = new Error('Test error');

    notify(c, error, { statusCode: 500 });

    const call = errorMock.mock.calls[0];
    const logData = JSON.parse(call[0] as string);
    expect(logData.timestamp).toBeDefined();
    expect(typeof logData.timestamp).toBe('string');
  });

  test('should handle different error types', () => {
    const c = createMockContext('GET', '/api/test');

    class CustomError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'CustomError';
      }
    }

    const error = new CustomError('Custom error message');
    notify(c, error, { statusCode: 500 });

    const call = errorMock.mock.calls[0];
    const logData = JSON.parse(call[0] as string);
    expect(logData.error.name).toBe('CustomError');
  });

  test('should include Cloudflare headers when available', () => {
    const c = createMockContext('GET', '/api/test');
    const error = new Error('Test error');

    notify(c, error, { statusCode: 500 });

    const call = errorMock.mock.calls[0];
    const logData = JSON.parse(call[0] as string);
    expect(logData.request.headers['cf-ray']).toBe('ray-123');
    expect(logData.request.headers['cf-connecting-ip']).toBe('192.168.1.1');
  });

  test('should handle missing statusCode type validation', () => {
    const c = createMockContext('GET', '/api/test');
    const error = new Error('Test error');

    // When statusCode is not a number, should log to console.error
    notify(c, error, { statusCode: 'invalid' } as any);

    // Should be called since rawStatus is not a number, so console.error is used
    expect(errorMock).toHaveBeenCalled();
  });

  test('should include error stack trace', () => {
    const c = createMockContext('GET', '/api/test');
    const error = new Error('Test error with stack');

    notify(c, error, { statusCode: 500 });

    const call = errorMock.mock.calls[0];
    const logData = JSON.parse(call[0] as string);
    expect(logData.error.stack).toBeDefined();
    expect(typeof logData.error.stack).toBe('string');
  });

  test('should include metadata in error log', () => {
    const c = createMockContext('GET', '/api/test');
    const error = new Error('Test error');
    const metadata = { errorType: 'ValidationError', userId: 'user_456' };

    notify(c, error, metadata);

    const call = errorMock.mock.calls[0];
    const logData = JSON.parse(call[0] as string);
    expect(logData.metadata).toEqual(metadata);
  });
});

// Restore console after tests
afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

function afterEach() {
  console.error = originalError;
  console.warn = originalWarn;
}
