import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:4000',
  },
  // Uncomment below for static export (if not using API routes)
  // output: 'export',
  // images: {
  //   unoptimized: true,
  // },
};

export default nextConfig;
