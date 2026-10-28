# BFF and Authentication Architecture

Use this reference when modifying authentication, proxy access, route handlers, or browser-to-backend data flow.

## Core Security Boundary

The browser never talks directly to the backend and never sees access/refresh tokens.

Auth routes live under:

```text
app/api/auth/
```

including:

```text
login
refresh
logout
change-password
```

These call backend admin-auth endpoints and manage httpOnly cookies using project helpers.

## Normal Backend Data

All ordinary client-side backend access should go through:

```text
app/api/proxy/[...path]/route.ts
```

and:

```text
lib/with-auth-proxy.ts
```

Example:

```ts
fetch(`/api/proxy/admin/stores/${storeId}/orders`)
```

maps to the backend:

```text
/admin/stores/:storeId/orders
```

## Do Not Bypass the Proxy

Do not write client-side code such as:

```ts
fetch(`${process.env.BACKEND_URL}/admin/...`)
```

Do not read or construct:

- access token
- refresh token
- Authorization header

inside browser components.

## Existing 401/Refresh Behavior

The proxy already owns:

- access-cookie extraction
- Authorization header injection
- cookie stripping
- one refresh attempt on 401
- refresh de-duplication
- Set-Cookie propagation
- login redirect

Do not duplicate this behavior in hooks or components.

## New Route Handlers

Before adding a new route handler ask:

1. Can the existing proxy handle this?
2. Is special BFF-only behavior actually required?
3. Is this auth-specific?
4. Does it need custom cookie/header handling?

Create specialized BFF routes only when there is a concrete reason.

## Permissions

Frontend permission gating is UX, not security.

Backend authorization remains authoritative.

Do not treat hidden buttons or routes as authorization.
