import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup-integration.ts'],
    include: ['**/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'build',
      'coverage',
      'test-results',
      '**/*.config.{js,mjs,cjs,ts}',
      '**/unit/**',
      '**/__tests__/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      include: ['src/integration/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'node_modules/',
        '.next/',
        'src/test/',
        'src/unit/',
        'src/e2e/',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        '**/types/',
        '**/*.d.ts',
        '**/*.config.{js,ts}'
      ],
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    isolate: true,
    threads: true,
    maxThreads: 2,
    minThreads: 1,
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './test-results/integration-results.json'
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/db': path.resolve(__dirname, './src/db')
    }
  }
});
