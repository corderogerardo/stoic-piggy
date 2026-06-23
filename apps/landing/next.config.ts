import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@stoicpiggy/shared', '@stoicpiggy/ui'],
  // Self-contained server build (.next/standalone) for slim Docker images.
  output: 'standalone',
};

export default nextConfig;
