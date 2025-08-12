import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Only lint the files I've modified, ignore existing issues in other files
    ignoreDuringBuilds: true,
  },
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
