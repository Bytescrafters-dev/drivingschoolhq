import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL ?? "",
    JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME ?? "dev_super_admin_jwt",
    REFRESH_COOKIE_NAME:
      process.env.REFRESH_COOKIE_NAME ?? "dev_super_admin_refresh",
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ?? "",
  },
};

export default nextConfig;
