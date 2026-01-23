/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Optimize for production
  swcMinify: true,

  // Experimental features for Next.js 16
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },

  // Websocket configuration for Socket.io
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }
    return config;
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'SplitSync',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Modern expense sharing application',
  },

  // Headers for security
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
        ],
      },
    ];
  },
};

module.exports = nextConfig;
