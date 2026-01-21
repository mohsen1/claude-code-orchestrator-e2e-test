/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Add better-sqlite3 external handling for client side
    if (!isServer) {
      config.externals = [...(config.externals || []), 'better-sqlite3'];
    }

    return config;
  },
};

module.exports = nextConfig;
