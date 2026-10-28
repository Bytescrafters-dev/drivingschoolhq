# Store Scoping

The selected store is owned by:

```text
contexts/storeProvider.tsx
```

and persisted in localStorage as:

```text
selected_store_id
```

Store-scoped hooks use:

```text
useCurrentStore()
```

## Mandatory Rule

Store-scoped data must include the selected store in both:

```text
query key
+
BFF endpoint
```

Example:

```text
queryKey: ['orders', currentStore?.id]
```

and:

```text
/api/proxy/admin/stores/:storeId/orders
```

## Why Query-Key Scope Matters

Without the store ID in the key:

```text
Store A data cached
      ↓
switch to Store B
      ↓
same key reused
      ↓
stale Store A data may appear
```

## Missing Store

When no store is selected/available:

- disable the query where appropriate;
- show the project-consistent empty/unavailable UI;
- do not build malformed endpoints.

## Mutations

Store-scoped mutations must invalidate the cache for the correct store.

Avoid invalidating unrelated stores unless project behavior explicitly requires it.

## Review Questions

- Does endpoint contain the current store?
- Does query key contain the current store?
- Is query disabled until store exists?
- Does mutation invalidate the correct scoped key?
- Does UI behave correctly when the selected store changes?
