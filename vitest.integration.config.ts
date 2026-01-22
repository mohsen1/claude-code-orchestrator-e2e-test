import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.integration.test.{js,mjs,cjs,ts,mts,cts}'],
    exclude: ['node_modules', 'dist', '.next', 'out', 'build', '**/*.unit.test.*'],
    setupFiles: ['./tests/integration-setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    isolate: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Run integration tests sequentially
        minThreads: 1,
        maxThreads: 1,
      },
    },
    reporters: ['default', 'json', 'junit'],
    outputFile: {
      json: './test-results/integration-results.json',
      junit: './test-results/integration-junit.xml',
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
});
