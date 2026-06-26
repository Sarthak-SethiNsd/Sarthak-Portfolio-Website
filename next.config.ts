import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the production build strict so malformed components are caught before deployment.
  reactStrictMode: true,
};

export default nextConfig;
