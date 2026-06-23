import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@stoicpiggy/shared', '@stoicpiggy/ui', '@stoicpiggy/api'],
  // Static export (out/) — deployed to Cloudflare Pages. The dashboard is a
  // client SPA that talks to the API via NEXT_PUBLIC_API_URL at runtime.
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
