import { beforeEach, afterEach, vi } from 'bun:test';

// Mock window.location
delete (window as any).location;
(window as any).location = { href: '/', reload: vi.fn(), pathname: '/' };

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock HTMLImageElement
Object.defineProperty(HTMLImageElement.prototype, 'src', {
  set: vi.fn(),
  get: vi.fn(),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock file reader
class FileReaderMock {
  readAsDataURL = vi.fn(function (this: any) {
    this.onload?.({
      target: { result: 'data:image/png;base64,test' },
    });
  });
}
(window as any).FileReader = FileReaderMock;

// Common mock utilities
export function createMockRouter() {
  return {
    push: vi.fn(() => Promise.resolve()),
    replace: vi.fn(() => Promise.resolve()),
    back: vi.fn(),
    currentRoute: { value: { path: '/', name: 'home' } },
  };
}

export function createMockQueryClient() {
  return {
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
    invalidateQueries: vi.fn(() => Promise.resolve()),
    removeQueries: vi.fn(),
  };
}

export function createMockClerk() {
  return {
    value: {
      loaded: true,
      signOut: vi.fn(() => Promise.resolve()),
      setActive: vi.fn(() => Promise.resolve()),
      client: {
        signIn: {
          create: vi.fn(),
          attemptSecondFactor: vi.fn(),
          authenticateWithRedirect: vi.fn(),
        },
        signUp: {
          create: vi.fn(),
          prepareEmailAddressVerification: vi.fn(),
          attemptEmailAddressVerification: vi.fn(),
        },
      },
    },
  };
}

export function createMockHonoClient() {
  return {
    'auth-status': {
      $get: vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: vi.fn(() =>
            Promise.resolve({ isAuthenticated: false, userId: null })
          ),
        })
      ),
    },
    user: {
      clerk: {
        profile: {
          $get: vi.fn(),
          $patch: vi.fn(),
        },
        account: {
          $get: vi.fn(),
          $patch: vi.fn(),
        },
        menu: {
          $get: vi.fn(),
        },
      },
      record: {
        $get: vi.fn(),
        $post: vi.fn(),
        $delete: vi.fn(),
        count: {
          $get: vi.fn(),
        },
        ranking: {
          $get: vi.fn(),
        },
      },
    },
    admin: {
      dashboard: {
        $get: vi.fn(),
      },
      accounts: {
        $get: vi.fn(),
      },
      norms: {
        $get: vi.fn(),
      },
      users: {
        ':userId': {
          $get: vi.fn(),
          $patch: vi.fn(),
          $delete: vi.fn(),
          profile: {
            $patch: vi.fn(),
          },
        },
      },
    },
  };
}
