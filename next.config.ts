import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* React Configuration */
  reactStrictMode: true,

  /* TypeScript Configuration */
  typescript: {
    ignoreBuildErrors: false,
  },

  /* ESLint Configuration */
  eslint: {
    ignoreDuringBuilds: false,
  },

  /* Output Configuration */
  output: "standalone",

  /* Image Optimization */
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.authjs.dev",
      },
    ],
  },

  /* Experimental Features */
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },

  /* Environment Variables */
  env: {
    NEXT_PUBLIC_APP_NAME: "SplitSync",
    NEXT_PUBLIC_APP_VERSION: "1.0.0",
  },

  /* Headers */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  /* Rewrites for API routes */
  async rewrites() {
    return [];
  },

  /* Webpack Configuration */
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

    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      moduleIds: "deterministic",
    };

    return config;
  },

  /* Logging */
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  /* Power By Header */
  poweredByHeader: false,
};

export default nextConfig;
