import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'file::memory:';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Suppress console errors in tests unless debugging
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  if (process.env.DEBUG !== 'true') {
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
        return;
      }
      originalError.call(console, ...args);
    };
    console.warn = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
        return;
      }
      originalWarn.call(console, ...args);
    };
  }
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
