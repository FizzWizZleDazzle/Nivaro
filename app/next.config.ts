import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Only lint the files I've modified, ignore existing issues in other files
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/Nivaro' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Nivaro' : '',
};

export default nextConfig;
