---
name: react-performance
description: >
  React performance rules covering state locality, rendering, effects,
  memoization, list behavior, large tables, expensive work, and client
  component boundaries.
---

# React Performance

## Purpose

Use this skill when implementing or reviewing React rendering and performance-sensitive UI.

## Core Principle

Prefer good architecture before manual optimization.

Prioritize:

- local state
- correct Server/Client boundaries
- avoiding unnecessary effects
- avoiding duplicated derived state
- stable keys
- efficient query caching
- bounded/paginated large data
- intentional rendering boundaries

before:

- `React.memo`
- `useMemo`
- `useCallback`

## Memoization

Do not add memoization automatically.

Use it when:

- profiling shows meaningful render cost;
- an expensive calculation is repeated unnecessarily;
- referential stability is required for a real downstream optimization.

Do not use `useCallback` only because a function is passed as a prop.

## Effects

Avoid effects for:

- derived values
- ordinary event-driven actions
- API fetching already handled by TanStack Query
- syncing state that should not exist separately

Read [EFFECTS.md](EFFECTS.md).

## Rendering

Keep state near the component that owns it.

Avoid lifting state unnecessarily.

Read [RENDERING.md](RENDERING.md).

## Large Lists

For large datasets prefer:

- server/backend pagination
- table pagination
- bounded rendering
- virtualization when truly necessary

Read [LARGE-LISTS.md](LARGE-LISTS.md).

## Review Checklist

- no unnecessary effect
- no duplicated derived state
- no premature memoization
- state is local enough
- stable keys used
- large datasets are bounded
- client boundary is not unnecessarily broad
