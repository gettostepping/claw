import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '100MB', // Increase limit for video uploads
    },
  },
};

export default nextConfig;
