import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Custom render function that includes any necessary providers
 * This is a utility wrapper around @testing-library/react's render
 */

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any custom options here
  withRouter?: boolean;
  withSession?: boolean;
}

// Example custom providers (will be implemented when auth and routing are added)
// function AllTheProviders({ children }: { children: React.ReactNode }) {
//   return (
//     <SessionProvider>
//       <BrowserRouter>
//         {children}
//       </BrowserRouter>
//     </SessionProvider>
//   );
// }

/**
 * Custom render function
 * @param ui - React component to render
 * @param options - Render options
 * @returns Render result with user event setup
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  // For now, just use the default render
  // When auth/routing is added, wrap with providers
  const user = userEvent.setup();
  const returnValue = {
    user,
    ...render(ui, options),
  };

  return returnValue;
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

/**
 * Mock window.matchMedia
 * Call this in beforeEach if your components use responsive hooks
 */
export function mockMatchMedia(matches: boolean = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

/**
 * Wait for async operations to complete
 * @param ms - Milliseconds to wait (default: 0)
 */
export const waitForAsync = (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a mock router
 * Useful for testing Next.js router functionality
 */
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  reload: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
};

/**
 * Create a mock session
 * Useful for testing authentication
 */
export const mockSession = {
  expires: new Date(Date.now() + 3600 * 1000).toISOString(),
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.png',
  },
};

/**
 * Suppress console errors during tests
 * Use this to test error conditions without cluttering test output
 */
export function suppressConsoleError() {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });
}

/**
 * Mock fetch API
 * @param data - Data to return from fetch
 * @param options - Fetch response options
 */
export function mockFetch(data: unknown, options: { status?: number; ok?: boolean } = {}) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: options.ok ?? true,
      status: options.status ?? 200,
      json: async () => data as JSON,
      text: async () => JSON.stringify(data),
      headers: new Headers(),
      redirected: false,
      statusText: 'OK',
      type: 'basic' as ResponseType,
      url: 'http://localhost:3000',
      clone: vi.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
    }),
  ) as jest.Mock;
}

/**
 * Reset all mocks
 * Call this in afterEach if you've mocked any globals
 */
export function resetAllMocks() {
  vi.clearAllMocks();
  vi.resetAllMocks();
}

/**
 * Test data generators
 * Useful for creating consistent test data
 */
export const testData = {
  user: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    image: 'https://example.com/avatar.jpg',
  },
  group: {
    id: 'group-1',
    name: 'Test Group',
    description: 'A group for testing',
    createdAt: new Date().toISOString(),
    createdBy: '1',
  },
  expense: {
    id: 'expense-1',
    groupId: 'group-1',
    description: 'Test expense',
    amount: 10000, // $100.00 in cents
    payerId: '1',
    date: new Date().toISOString(),
  },
  settlement: {
    id: 'settlement-1',
    groupId: 'group-1',
    fromUserId: '2',
    toUserId: '1',
    amount: 5000, // $50.00 in cents
    settledAt: null,
  },
};

/**
 * Deep freeze an object
 * Useful for ensuring test data isn't modified
 */
export function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = obj[prop as keyof T];
    if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });

  return obj;
}

/**
 * Check if an element has specific text content
 * @param container - Container element
 * @param text - Text to search for
 */
export function hasTextContent(container: HTMLElement, text: string): boolean {
  return container.textContent?.includes(text) ?? false;
}

/**
 * Create a mock function with type safety
 * @param implementation - Function implementation
 */
export function createMockFn<T extends (...args: unknown[]) => unknown>(
  implementation?: T,
): jest.Mock<ReturnType<T>, Parameters<T>> {
  return vi.fn(implementation) as unknown as jest.Mock<ReturnType<T>, Parameters<T>>;
}
