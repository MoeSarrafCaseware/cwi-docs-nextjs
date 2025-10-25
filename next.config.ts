import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:4000',
  },
};

export default nextConfig;
