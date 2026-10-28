# Environment and Amplify Rules

Use this reference when adding or changing environment variables or middleware configuration.

## Validated Environment

`lib/env.ts` validates env variables with Zod at import time and throws when invalid.

Required:

```text
BACKEND_URL
```

Optional existing values include:

```text
JWT_COOKIE_NAME
REFRESH_COOKIE_NAME
COOKIE_DOMAIN
```

## Middleware Exception

`middleware.ts` intentionally reads `process.env` directly.

Do not import `lib/env.ts` into middleware.

Reason: invalid/missing backend configuration should not make every middleware request crash through eager env validation.

Preserve this exception.

## Amplify

The project deploys through AWS Amplify.

Server-side env values are available at build time and the build process writes required values into `.env.production`.

When adding a new server-side env variable:

1. add validation/config where appropriate;
2. document local `.env.local` usage;
3. inspect `amplify.yml`;
4. add the variable to the existing environment-export/grep pattern if runtime code requires it.

Do not assume a value available during build is automatically available at runtime.

## Review Checklist

- env variable has correct validation
- middleware exception preserved
- Amplify propagation considered
- no secret exposed to client bundle
