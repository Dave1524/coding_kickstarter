import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname, // explicitly point to the app root
  },
};

export default nextConfig;

