/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  },
  webpack: (config) => {
    // Add alias for importing from frontend
    config.resolve.alias = {
      ...config.resolve.alias,
      '@frontend': path.resolve(__dirname, '../frontend'),
    };
    return config;
  },
}

module.exports = nextConfig