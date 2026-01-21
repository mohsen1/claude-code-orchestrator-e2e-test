import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Next.js environment
vi.mock('next-auth', () => ({
  default: () => ({
    getSession: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));
