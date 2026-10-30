import { z } from "zod";
import {
  DEFAULT_JWT_COOKIE_NAME,
  DEFAULT_REFRESH_COOKIE_NAME,
} from "./cookie-names";

const EnvSchema = z.object({
  BACKEND_URL: z
    .string()
    .min(1, "BACKEND_URL is required")
    .transform((v) => v.trim().replace(/\/$/, "")),
  JWT_COOKIE_NAME: z.string().min(1).default(DEFAULT_JWT_COOKIE_NAME),
  REFRESH_COOKIE_NAME: z.string().min(1).default(DEFAULT_REFRESH_COOKIE_NAME),
  COOKIE_DOMAIN: z.string().optional(),
});

const parsed = EnvSchema.safeParse({
  BACKEND_URL: process.env.BACKEND_URL,
  JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME || undefined,
  REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME || undefined,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
});

if (!parsed.success) {
  const message = parsed.error.issues
    .map((err) => `${err.path.join(".") || "env"}: ${err.message}`)
    .join(", ");
  throw new Error(`Invalid environment configuration: ${message}`);
}

export const env = parsed.data;
