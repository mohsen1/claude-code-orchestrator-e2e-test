/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable App Router (default in Next.js 14)
  experimental: {
    // Enable server actions if needed
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },

  // Environment variables accessible to the browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fixes for better-sqlite3 in Next.js
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('better-sqlite3');
    }
    return config;
  },

  // Image optimization
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google OAuth avatars
    formats: ['image/avif', 'image/webp'],
  },

  // React strict mode
  reactStrictMode: true,

  // SWC minification
  swcMinify: true,
};

module.exports = nextConfig;
