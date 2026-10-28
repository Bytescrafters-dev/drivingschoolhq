# Query and Mutation Hooks

## Domain Hook Convention

Keep domain-specific query/mutation hooks in the existing `hooks/` structure.

Examples:

```text
hooks/useOrders.ts
hooks/useProducts.ts
```

Follow the local naming style instead of introducing a new convention.

## Queries

A query should have:

- stable query key
- all scope inputs represented in the key
- BFF proxy URL
- clear enabled conditions when identifiers may be unavailable
- normalized error behavior consistent with nearby hooks

## Mutations

Mutations should:

- call the BFF
- surface meaningful errors
- invalidate or update only relevant caches
- avoid broad invalidation when a narrower pattern already exists

## Query Keys

Include every value that materially changes the result.

For store-scoped data:

```text
['orders', storeId, filters...]
```

not:

```text
['orders']
```

when switching stores should produce different data.

## Reuse

Before adding:

```text
useFetchOrders
useOrdersData
useStoreOrders
```

check whether `useOrders.ts` already owns the same concern.

## BFF

Client hooks call `/api/proxy/...`.

Do not:

- read auth cookies manually
- inject Authorization in browser code
- call `BACKEND_URL` from the client

## Loading/Error/Empty

Hooks should expose state clearly enough for components to render:

- loading
- error
- success
- empty data

Do not hide all failure context behind `undefined`.
