import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

/**
 * Vitest Configuration for SplitSync
 *
 * This configuration provides:
 * - TypeScript support with strict type checking
 * - React component testing capabilities
 * - Testing utilities for Next.js App Router
 * - Coverage reporting with Istanbul
 * - Path aliases for cleaner imports
 * - ESM and CJS build outputs
 * - Optimized test runner performance
 */
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "@babel/plugin-transform-react-jsx",
            {
              runtime: "automatic",
              importSource: "react",
            },
          ],
        ],
      },
    }),
    dts({
      insertTypesEntry: true,
      include: ["lib/**/*", "components/**/*", "app/**/*"],
      rollupTypes: true,
    }),
  ],

  // Test configuration
  test: {
    // Test environment
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost:3000",
        pretendToBeVisual: true,
        resources: "usable",
        runScripts: "dangerously",
      },
    },

    // Global setup and teardown
    setupFiles: [
      "./tests/setup.ts",
      "./tests/mocks/next-auth.mock.ts",
      "./tests/mocks/database.mock.ts",
    ],
    globalSetup: "./tests/global-setup.ts",
    teardownTimeout: 10000,

    // Test file patterns
    include: [
      "**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    exclude: [
      "node_modules",
      "dist",
      ".next",
      "build",
      "coverage",
      "*.config.{ts,js}",
      ".eslintrc.{js,json}",
      ".prettierrc.{js,json}",
    ],
    includeSource: ["app/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],

    // Test execution
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
        isolate: true,
        useAtomics: true,
      },
    },
    maxConcurrency: 4,
    concurrency: 4,
    fileParallelism: true,
    inspect: false,
    inspectBrk: false,

    // Test timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    isolate: true,

    // Reporting
    reporter: [
      "verbose",
      "json",
      "json",
      "html",
      "junit",
      "default",
      [
        "vitest-sonar-reporter",
        {
          outputFile: "test-results/sonar-report.xml",
          outputFilePrefix: "test-results",
        },
      ],
    ],
    outputFile: {
      json: "./test-results/results.json",
      html: "./test-results/index.html",
      junit: "./test-results/junit.xml",
    },

    // Coverage configuration
    coverage: {
      provider: "v8",
      enabled: true,
      reporter: [
        "text",
        "text-summary",
        "json",
        "json-summary",
        "html",
        "lcov",
        "lcovonly",
        "cobertura",
      ],
      reportsDirectory: "./coverage",
      reportOnFailure: true,
      exclude: [
        "node_modules/",
        ".next/",
        "out/",
        "build/",
        "dist/",
        "coverage/",
        "test-results/",
        "*.config.{ts,js}",
        ".eslintrc.{js,json}",
        ".prettierrc.{js,json}",
        "tests/**",
        "__tests__/**",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/types/**",
        "**/mocks/**",
        "**/fixtures/**",
        "**/.next/**",
        "**/dist/**",
        "**/build/**",
        "middleware.ts",
        "vitest.config.ts",
        "tailwind.config.ts",
        "next.config.ts",
      ],
      include: [
        "app/**/*.{js,jsx,ts,tsx}",
        "lib/**/*.{js,jsx,ts,tsx}",
        "components/**/*.{js,jsx,ts,tsx}",
        "hooks/**/*.{js,jsx,ts,tsx}",
        "utils/**/*.{js,jsx,ts,tsx}",
        "services/**/*.{js,jsx,ts,tsx}",
      ],
      excludeAfterRemap: true,
      cleanOnRerun: true,
      src: [],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
        perFile: false,
        autoUpdate: true,
      },
      // Coverage ignore patterns
      ignoreClassMethods: ["^render.*", "^test.*", "^mock.*"],
      comments: true,
      allowExternal: false,
      skipFull: false,
    },

    // Global constants and mocks
    globals: true,
    alias: [
      {
        find: /^@\/(.*)$/,
        replacement: resolve(__dirname, "$1"),
      },
      {
        find: /^@\/app\/(.*)$/,
        replacement: resolve(__dirname, "app", "$1"),
      },
      {
        find: /^@\/components\/(.*)$/,
        replacement: resolve(__dirname, "components", "$1"),
      },
      {
        find: /^@\/lib\/(.*)$/,
        replacement: resolve(__dirname, "lib", "$1"),
      },
      {
        find: /^@\/hooks\/(.*)$/,
        replacement: resolve(__dirname, "hooks", "$1"),
      },
      {
        find: /^@\/types\/(.*)$/,
        replacement: resolve(__dirname, "types", "$1"),
      },
      {
        find: /^@\/utils\/(.*)$/,
        replacement: resolve(__dirname, "utils", "$1"),
      },
      {
        find: /^@\/tests\/(.*)$/,
        replacement: resolve(__dirname, "tests", "$1"),
      },
    ],

    // Snapshot configuration
    snapshotEnvironment: "./tests/snapshot-env.ts",
    snapshotFormat: {
      printBasicPrototype: false,
      escapeString: true,
      printFunctionName: true,
    },
    updateSnapshot: "new",
    snapshotSerializers: [],

    // Benchmark configuration
    benchmark: {
      include: ["**/*.bench.{ts,tsx}"],
      exclude: ["node_modules", "dist", ".next"],
    },

    // Sequence configuration
    sequence: {
      shuffle: false,
      concurrent: true,
      seed: 4242,
      hooks: "stack",
    },

    // Diff configuration
    diff: true,
    diffDirection: "unified",
    diffMaxLineLength: 100,

    // Watch configuration
    watch: true,
    watchExclude: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
    ignoreFiles: [],

    // Clear mocks
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,

    // Retry configuration
    retry: 2,
    failOnConstraintErrors: true,

    // Logging
    logHeapUsage: true,
    bail: 5,
    onConsoleLog: (log, type) => {
      if (type === "error" || type === "warning") {
        return false;
      }
    },
    onStackTrace: (error) => {
      // Filter out stack frames from test runner internals
      return error.stack
        ?.split("\n")
        .filter(
          (line) =>
            !line.includes("node_modules/vitest") &&
            !line.includes("node_modules/@vitest")
        )
        .join("\n");
    },

    // Server configuration
    ui: false,
    open: false,
    api: true,
    strict: true,
    typecheck: {
      enabled: true,
      only: false,
      checker: "tsc",
      allowJs: true,
    },
  },

  // Build configuration
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
      "@/app": resolve(__dirname, "./app"),
      "@/components": resolve(__dirname, "./components"),
      "@/lib": resolve(__dirname, "./lib"),
      "@/hooks": resolve(__dirname, "./hooks"),
      "@/types": resolve(__dirname, "./types"),
      "@/utils": resolve(__dirname, "./utils"),
      "@/tests": resolve(__dirname, "./tests"),
      "@/config": resolve(__dirname, "./config"),
      "@/constants": resolve(__dirname, "./constants"),
    },
  },

  // CSS configuration
  css: {
    modules: {
      scopeBehaviour: "local",
      generateScopedName: "[name]__[local]__[hash:base64:5]",
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "next",
      "vitest",
      "@testing-library/react",
      "@testing-library/jest-dom",
      "@testing-library/user-event",
    ],
    exclude: ["@vitest/coverage-v8"],
  },
});
