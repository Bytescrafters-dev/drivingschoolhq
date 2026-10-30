// Cookie names for the tenant session. Must differ from the admin dashboard's
// names: browsers don't separate cookies by port, so identical names on
// localhost would overwrite each other's sessions.
// Kept free of `env.ts` so middleware can import it without parsing BACKEND_URL.
export const DEFAULT_JWT_COOKIE_NAME = "dshq_tenant_at";
export const DEFAULT_REFRESH_COOKIE_NAME = "dshq_tenant_rt";

export const REFRESH_COOKIE_NAME =
  process.env.REFRESH_COOKIE_NAME || DEFAULT_REFRESH_COOKIE_NAME;
