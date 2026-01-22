import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'out', 'build'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['app/**/*.{js,jsx,ts,tsx}', 'lib/**/*.{js,jsx,ts,tsx}', 'components/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types/**',
        'middleware.ts',
        'next-env.d.ts',
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
    reporters: ['default', 'json', 'junit'],
    outputFile: {
      json: './test-results/results.json',
      junit: './test-results/junit.xml',
    },
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/app': path.resolve(__dirname, './app'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/components': path.resolve(__dirname, './components'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/types': path.resolve(__dirname, './types'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/styles': path.resolve(__dirname, './styles'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/app': path.resolve(__dirname, './app'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/components': path.resolve(__dirname, './components'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/types': path.resolve(__dirname, './types'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/styles': path.resolve(__dirname, './styles'),
    },
  },
  esbuild: {
    logLevel: 'error',
  },
});
