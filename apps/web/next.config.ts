import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: [
    '@garageflow/ui',
    '@garageflow/db',
    '@garageflow/ai',
  ],
};

export default nextConfig;

