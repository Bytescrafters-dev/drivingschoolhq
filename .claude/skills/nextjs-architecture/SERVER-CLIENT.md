# Server and Client Component Boundaries

Use this reference when deciding where `'use client'` belongs.

## Default

Prefer Server Components by default.

Introduce a Client Component only when it needs:

- `useState`
- `useReducer`
- `useEffect`
- event handlers
- browser APIs
- TanStack Query hooks
- store context
- permission hooks
- other client-only libraries

## Keep Client Boundaries Small

Prefer:

```text
ProductsPage            Server
├── PageHeader          Server
└── ProductsSection     Client
    ├── Filters
    ├── Table
    └── Pagination
```

over turning the entire page into a Client Component.

## Do Not Force Server Fetching

Although Server Components can fetch data, this project already has an established BFF + domain-hook architecture for dashboard data.

Do not invent a parallel server-side data-access layer unless:

- an existing project pattern already supports it; or
- the requirement clearly benefits from it and the architecture is intentionally extended.

Preserve existing consistency first.

## Props Across the Boundary

Prefer serializable props from Server Components to Client Components.

Do not pass server-only objects or implementation details into the client tree.

## Review Questions

- Does this component really need `'use client'`?
- Could the interactive section be extracted into a smaller child?
- Is client state located near the interaction that owns it?
- Is the existing hook/BFF pattern preserved?
