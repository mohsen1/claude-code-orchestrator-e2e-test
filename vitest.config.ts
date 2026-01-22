import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/unit/setup.ts'],
    include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'build',
      'coverage',
      'tests/e2e',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['**/*.{ts,tsx}', '**/*.{js,jsx}'],
      exclude: [
        'node_modules/',
        '.next/',
        'dist/',
        'build/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/tests/**',
        '**/types/**',
        'scripts/',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    isolate: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './coverage/test-results.json',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/app': path.resolve(__dirname, './app'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/types': path.resolve(__dirname, './types'),
      '@/tests': path.resolve(__dirname, './tests'),
    },
  },
});
