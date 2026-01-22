/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Enable experimental features for Next.js 16
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },

  // Webpack configuration for better-sqlite3
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'better-sqlite3': 'commonjs better-sqlite3',
      });
    }
    return config;
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.APP_NAME || 'SplitSync',
    NEXT_PUBLIC_APP_URL: process.env.APP_URL || 'http://localhost:3000',
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Output configuration
  output: 'standalone',

  // Image optimization
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

module.exports = nextConfig;
