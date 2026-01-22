import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types/**',
        '**/dist/**',
        '**/.next/**',
        '**/out/**',
      ],
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: [
      'node_modules/',
      '.next/',
      'out/',
      'dist/',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/app': path.resolve(__dirname, './app'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/types': path.resolve(__dirname, './types'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/config': path.resolve(__dirname, './config'),
      '@/styles': path.resolve(__dirname, './styles'),
    },
  },
});
