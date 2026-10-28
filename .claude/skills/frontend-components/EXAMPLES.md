# Component Examples

## Avoid Fetching Directly in Arbitrary UI

Avoid:

```tsx
function OrdersTable() {
  useEffect(() => {
    fetch('/api/proxy/...');
  }, []);
}
```

Prefer an existing domain hook:

```tsx
function OrdersTableSection() {
  const { data, isLoading } = useOrders();
  // render UI
}
```

## Avoid Premature Generic Engines

Avoid introducing:

```text
GenericTableFactory
GenericFormEngine
ResourcePageRegistry
```

for a single feature.

Prefer concrete feature components until repeated patterns justify abstraction.

## Good Decomposition

```text
ProductsPage
├── ProductsHeader
├── ProductsFilters
└── ProductsTable
```

where each piece has a meaningful responsibility.

## Over-Decomposition

Avoid turning every label and primitive into its own file with no independent behavior or reuse.
