import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Enable React strict mode for catching potential issues */
  reactStrictMode: true,

  /* Optimize package imports for smaller bundle sizes */
  experimental: {
    optimizePackageImports: ['@shadcn/ui'],
  },

  /* TypeScript configuration */
  typescript: {
    // Only build if TypeScript passes type checking
    ignoreBuildErrors: false,
  },

  /* ESLint configuration */
  eslint: {
    // Only build if ESLint passes
    ignoreDuringBuilds: false,
  },

  /* Image optimization */
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  /* Webpack configuration for better performance */
  webpack: (config, { isServer }) => {
    // Optimize for better-sqlite3 in server-side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'better-sqlite3': 'commonjs better-sqlite3',
      });
    }

    // Improve bundle analysis
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')();
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze.html',
          openAnalyzer: false,
        })
      );
    }

    return config;
  },

  /* Environment variables available to the browser */
  env: {
    NEXT_PUBLIC_APP_NAME: 'SplitSync',
    NEXT_PUBLIC_APP_VERSION: '3.0.0',
  },

  /* Output configuration */
  output: 'standalone',

  /* Production source maps for debugging */
  productionBrowserSourceMaps: false,

  /* Power header security */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },

  /* Logging configuration */
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
