---
name: nextjs-architecture
description: >
  Next.js App Router architecture rules for routing, Server/Client Component
  boundaries, BFF access, auth proxy behavior, middleware protection, and
  environment handling in this frontend.
---

# Next.js Architecture

## Purpose

Use this skill when creating or modifying:

- routes and layouts
- App Router pages
- Server/Client Component boundaries
- route handlers
- BFF integrations
- middleware-protected sections
- auth flows
- environment variables
- route constants

## Mandatory Rules

### App Router Only

New pages and routes must use the existing `app/` App Router structure.

Do not introduce Pages Router patterns for new functionality.

Follow established dashboard conventions:

```text
app/(dashboard)/<section>/page.tsx
app/(dashboard)/<section>/create/page.tsx
app/(dashboard)/<section>/update/[id]/page.tsx
```

Use local section `components/` folders when appropriate.

### Server Components by Default

App Router components are Server Components by default.

Add `'use client'` only when a component needs client capabilities such as:

- state
- effects
- event handlers
- browser APIs
- TanStack Query hooks
- store context
- permission hooks

Prefer the smallest useful Client Component boundary.

Do not make an entire route client-side because one child is interactive.

### Preserve the Existing BFF

The browser must not call the NestJS backend directly.

Normal client-side data access should follow:

```text
Client Component
    ↓
Domain Hook
    ↓
TanStack Query
    ↓
/api/proxy/...
    ↓
Next BFF
    ↓
Backend
```

Do not expose backend tokens to browser code.

Do not create resource-specific Route Handlers when the existing catch-all proxy already satisfies the use case.

### Search Before Creating Routes or APIs

Before adding:

- a Route Handler
- auth API route
- proxy behavior
- protected top-level route

inspect existing patterns first.

### Route Constants

Use `shared/constants/pageUrls.ts` for route path constants where the project does so.

Do not scatter duplicate path literals unnecessarily.

### Protected Routes

When creating a new top-level protected dashboard section, review `middleware.ts` and update `PROTECTED` if the route requires the same redirect behavior.

Do not assume a dashboard page is automatically protected by middleware.

### Environment Rules

Follow the project-specific environment architecture.

Use `lib/env.ts` for validated server-side env access where appropriate.

Do not import `lib/env.ts` into `middleware.ts`; middleware intentionally reads `process.env` directly.

If introducing a new server-side env var, review:

- `lib/env.ts`
- `.env.local` expectations
- `amplify.yml`

Amplify only exposes env values at build time, so required server-side variables may need to be included in the existing `.env.production` write/grep pattern.

### Path Alias

Use the configured frontend alias:

```ts
@/...
```

Do not copy backend-project import rules into this frontend.

## Read When Relevant

- Routing and layout changes → [APP-ROUTER.md](APP-ROUTER.md)
- Server/Client boundary questions → [SERVER-CLIENT.md](SERVER-CLIENT.md)
- Auth/BFF/proxy work → [BFF-AUTH.md](BFF-AUTH.md)
- Environment/config work → [ENVIRONMENT.md](ENVIRONMENT.md)

## Review Checklist

- App Router convention followed
- Server Component kept where possible
- Client boundary is no broader than needed
- Browser does not call backend directly
- Existing proxy reused where appropriate
- auth/token handling not duplicated
- new protected top-level route added to middleware if required
- route constants follow project convention
- env handling preserves middleware/Amplify constraints
