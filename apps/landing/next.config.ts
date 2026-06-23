import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@stoicpiggy/shared', '@stoicpiggy/ui'],
  // Static export (out/) — deployed to Cloudflare Pages. The app is a pure
  // client SPA, so no server runtime is needed.
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
