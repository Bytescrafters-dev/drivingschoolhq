import type { NextConfig } from "next";
import {
  DEFAULT_JWT_COOKIE_NAME,
  DEFAULT_REFRESH_COOKIE_NAME,
} from "./lib/cookie-names";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL ?? "",
    // Tenant cookie names must differ from the admin dashboard's.
    JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME || DEFAULT_JWT_COOKIE_NAME,
    REFRESH_COOKIE_NAME:
      process.env.REFRESH_COOKIE_NAME || DEFAULT_REFRESH_COOKIE_NAME,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ?? "",
  },
};

export default nextConfig;
