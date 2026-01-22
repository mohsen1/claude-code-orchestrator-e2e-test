/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  // Optimize for production
  swcMinify: true,
  compress: true,

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'SplitSync',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // Webpack configuration for better-sqlite3
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'better-sqlite3': 'commonjs better-sqlite3',
      });
    }
    return config;
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;
