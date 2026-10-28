# Frontend Review Checklist

## Requirement

- requested behavior implemented
- expected user actions work
- errors/empty/loading states considered
- navigation/redirect behavior correct

## App Router

- new routes use App Router
- route placement matches `(auth)` / `(dashboard)` structure
- new top-level protected section reviewed in `middleware.ts`
- route constants updated where appropriate
- no unnecessary layout introduced

## Server / Client

- Server Component kept where possible
- `'use client'` boundary is not broader than required
- client-only hooks/browser APIs are contained appropriately

## BFF / Auth

- browser does not call backend directly
- access/refresh tokens are not exposed
- ordinary data uses existing proxy
- auth flow not duplicated in hooks/components
- no unnecessary resource-specific API route added

## Data Hooks

- existing hook searched first
- domain hook follows local convention
- query key complete
- mutation invalidation correct
- global QueryProvider defaults not overridden casually

## Store Scope

- `useCurrentStore()` used where required
- store ID present in endpoint
- store ID present in query key
- query disabled safely when store unavailable
- cache invalidation scoped correctly

## State

- server state remains in TanStack Query
- form state uses React Hook Form
- selected store uses existing context
- no unnecessary global state library
- derived values are not duplicated in state

## Components

- functional components
- cohesive responsibilities
- no speculative factory/engine
- local components remain local where appropriate
- existing components reused

## UI

- existing project component/shadcn prioritized
- semantic theme tokens used
- nearby dashboard patterns followed
- Sonner used for toast behavior
- TanStack Table conventions followed where relevant
- `getDisplayPrice` used for backend minor-unit prices

## Permissions

- `usePermissions.ts` used where applicable
- no duplicate permission system
- frontend gating not mistaken for backend security

## Accessibility

- form labels
- semantic controls
- icon button accessible names
- keyboard/focus behavior preserved
- headings and contrast reasonable

## Responsive

- desktop/tablet/small-screen behavior considered
- table overflow handled
- actions/forms/dialogs fit small screens

## Performance

- no unnecessary effects
- no premature memoization
- stable list keys
- large datasets bounded
- no broad client boundary without reason

## Regression

Ask:

> What existing behavior could this change break?

Review shared:

- hooks
- components
- route constants
- permissions
- store context
- BFF routes
- env handling
