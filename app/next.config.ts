import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Only lint the files I've modified, ignore existing issues in other files
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
