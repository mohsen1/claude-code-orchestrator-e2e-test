/**
 * Next.js Configuration for SplitSync
 * Optimized for Docker deployment with standalone output
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker (smaller image size)
  output: "standalone",

  // Optimize for production
  swcMinify: true,
  reactStrictMode: true,

  // Environment variables accessible to the browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ENABLE_SOCKET: process.env.NEXT_PUBLIC_ENABLE_SOCKET,
  },

  // Image optimization
  images: {
    domains: [],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Webpack configuration for native modules
  webpack: (config, { isServer }) => {
    // Fixes for better-sqlite3 in Docker
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "better-sqlite3": "commonjs better-sqlite3",
      });
    }

    return config;
  },

  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;
