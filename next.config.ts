import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname, // explicitly point to the app root
  },
  webpack: (config, { isServer }) => {
    // Exclude dompurify from server-side bundle
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('dompurify');
    }
    return config;
  },
};

export default nextConfig;

