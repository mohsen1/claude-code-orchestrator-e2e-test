import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize output for production
  swcMinify: true,

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
    ],
  },

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Enable transpiling of node_modules in development
    if (dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }

    // Handle SQLite for server-side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'better-sqlite3': 'commonjs better-sqlite3',
      });
    }

    return config;
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Output configuration
  output: 'standalone',

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '0.1.0',
  },
};

export default nextConfig;
