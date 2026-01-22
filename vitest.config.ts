import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      '.turbo',
      'coverage',
      'build',
      'e2e',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types/**',
        '**/mocks/**',
        '**/__tests__/**',
        '**/test-utils/**',
        'vitest.config.ts',
        'vitest.setup.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
        perFile: true,
      },
      all: true,
      cleanOnRerun: true,
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    isolate: true,
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    shard: undefined,
    fileParallelism: true,
    reporters: ['default', 'json'],
    outputFile: './test-results/test-results.json',
    cache: {
      dir: '.vitest/cache',
    },
    sequence: {
      shuffle: false,
      concurrent: true,
    },
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/*': path.resolve(__dirname, './*'),
      '@/components/*': path.resolve(__dirname, './components/*'),
      '@/lib/*': path.resolve(__dirname, './lib/*'),
      '@/app/*': path.resolve(__dirname, './app/*'),
      '@/tests/*': path.resolve(__dirname, './tests/*'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/*': path.resolve(__dirname, './*'),
    },
  },
  esbuild: {
    target: 'es2020',
  },
});
