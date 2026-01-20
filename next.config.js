/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  // This creates a minimal build with only necessary files
  output: 'standalone',

  // Optimize for production with SQLite and custom server
  poweredByHeader: false,

  // Disable x-powered-by header for security

  // Configure Webpack for better-sqlite3 support
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure better-sqlite3 is properly bundled
      config.externals = config.externals || [];
      config.externals.push('better-sqlite3');
    }
    return config;
  },

  // Strict mode for React (enables additional checks and warnings)
  reactStrictMode: true,

  // Experimental features for Next.js 14
  experimental: {
    // Optimize package imports for smaller bundle size
    optimizePackageImports: ['@shadcn/ui'],
  },

  // Environment variables available to the browser
  env: {
    // Ensure build-time environment variables are set
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Image optimization configuration
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google OAuth avatars
    formats: ['image/webp', 'image/avif'],
  },

  // Production source maps for better error tracking
  productionBrowserSourceMaps: false, // Set to true only if needed for debugging

  // Compression
  compress: true,

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;
