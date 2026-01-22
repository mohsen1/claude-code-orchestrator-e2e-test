import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',

    // Global setup files
    setupFiles: ['./vitest.setup.ts'],

    // Global utilities available in all tests without imports
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        '**/*.config.{js,ts}',
        '**/types/**',
        '**/__tests__/**',
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**',
      ],
      // Coverage thresholds - enforce minimum coverage
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
      // Collect coverage from these directories
      include: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,ts}',
        'utils/**/*.{js,ts}',
        'hooks/**/*.{js,jsx,ts,tsx}',
        'server/**/*.{js,ts}',
      ],
    },

    // Test match patterns
    include: [
      '**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],

    // Exclude patterns
    exclude: [
      'node_modules/',
      'dist/',
      '.next/',
      'coverage/',
      '**/*.config.{js,ts}',
      '**/types/**',
    ],

    // Test timeout in milliseconds
    testTimeout: 10000,

    // Hook timeout
    hookTimeout: 10000,

    // Isolate each test file
    isolate: true,

    // Pool configuration
    pool: 'threads',
    poolOptions: {
      threads: {
        // Number of workers (default: number of CPUs)
        minThreads: 1,
        maxThreads: 4,
        // Use single worker to avoid issues with SQLite
        singleThread: false,
      },
    },

    // Reporter configuration
    reporter: ['default', 'html', 'json', 'junit'],

    // Output directory for test results
    outputFile: {
      json: './test-results/results.json',
      junit: './test-results/junit.xml',
    },

    // Verbose output
    verbose: true,

    // Allow parallel test execution
    parallel: true,

    // Max parallel threads
    maxParallelThreads: 4,

    // Include file stack trace in errors
    includeTaskLocation: true,

    // Show heap usage after each test
    logHeapUsage: true,

    // Suppress console output during tests (set to false to see logs)
    silent: false,

    // Watch mode settings
    watch: false,

    // Benchmark configuration
    benchmark: {
      include: ['**/__benchmarks__/**/*.{bench,spec}.{js,ts}'],
      exclude: ['node_modules/', 'dist/', '.next/'],
    },
  },

  // Path aliases for imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/app': path.resolve(__dirname, './app'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/types': path.resolve(__dirname, './types'),
      '@/server': path.resolve(__dirname, './server'),
      '@/config': path.resolve(__dirname, './config'),
      '@/styles': path.resolve(__dirname, './styles'),
    },
  },

  // ESBuild options for faster compilation
  esbuild: {
    target: 'ES2020',
    // Preserve JSX for testing
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
})
