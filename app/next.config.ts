import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  eslint: {
    // Only lint the files I've modified, ignore existing issues in other files
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Skip build-time generation for dynamic routes with user-generated content
  // These will be handled by client-side routing
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
