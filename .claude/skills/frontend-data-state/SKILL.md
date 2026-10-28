---
name: frontend-data-state
description: >
  Data-fetching and state-management rules for TanStack Query domain hooks,
  Next BFF calls, store scoping, React state, URL state, forms, and cache
  invalidation.
---

# Frontend Data and State

## Purpose

Use this skill when implementing:

- TanStack Query hooks
- BFF-backed API calls
- mutations
- query invalidation
- store-scoped data
- local state
- URL/search state
- React Hook Form
- Zod schemas
- loading/error/empty states

## Core Data Flow

Client-side data should follow:

```text
Client Component
      ↓
Domain Hook
      ↓
TanStack Query
      ↓
/api/proxy/...
      ↓
Backend
```

Do not fetch the NestJS backend directly from browser code.

## Search Before Creating Hooks

Before creating a hook:

1. search `hooks/`;
2. inspect the existing domain hook file;
3. check whether the query/mutation already exists;
4. extend the existing cohesive domain hook when appropriate.

Do not create duplicate hooks with slightly different names for the same data source.

## Domain Types

Use existing domain types under:

```text
types/<domain>.ts
```

Do not duplicate response/domain types unnecessarily.

## Query Defaults

`QueryProvider` owns global defaults including:

```text
staleTime: 5 min
retry: 1
```

Do not override these per query without a concrete reason.

## Store Scope

Store-scoped hooks must use the existing `StoreProvider` / `useCurrentStore()` pattern.

The selected store ID must influence both:

- the endpoint
- the query key

Read [STORE-SCOPING.md](STORE-SCOPING.md).

## State Placement

Prefer:

```text
server/API state
    → TanStack Query

selected store
    → existing StoreProvider

form state
    → React Hook Form

URL/shareable state
    → searchParams when appropriate

small local UI state
    → useState/useReducer

new global client state
    → only when justified
```

Do not introduce Redux/Zustand merely for convenience.

## Forms

New forms should follow existing:

```text
react-hook-form
+
zod
+
existing shadcn form controls
+
sonner
```

Read [FORMS.md](FORMS.md).

## Read When Relevant

- query/mutation design → [QUERY-HOOKS.md](QUERY-HOOKS.md)
- store-scoped data → [STORE-SCOPING.md](STORE-SCOPING.md)
- state-placement decisions → [STATE-MANAGEMENT.md](STATE-MANAGEMENT.md)
- forms → [FORMS.md](FORMS.md)

## Review Checklist

- existing hook searched first
- BFF proxy used
- query key is stable and complete
- store ID included where required
- mutation invalidates/updates correct queries
- global query defaults respected
- state located at appropriate level
- no unnecessary global state
- loading/error/empty behavior considered
