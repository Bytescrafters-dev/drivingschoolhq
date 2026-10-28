# App Router Guidelines

Use this reference when creating or changing pages, layouts, route groups, or navigation.

## Existing Structure

The project uses:

```text
app/(auth)/
app/(dashboard)/
```

Dashboard sections generally follow:

```text
<section>/page.tsx
<section>/create/page.tsx
<section>/update/[id]/page.tsx
```

Preserve this convention unless an existing nearby section demonstrates a better matching pattern.

## Route Groups

Use route groups to organize layouts and concerns without changing the public URL.

Do not add nested layouts merely for visual convenience if they introduce unnecessary hierarchy.

## Local Components

Page-specific components belong near the route when they are not broadly reusable.

Example:

```text
app/(dashboard)/orders/
├── page.tsx
├── components/
│   ├── orders-table.tsx
│   └── orders-filters.tsx
└── update/[id]/page.tsx
```

Promote a component to shared `components/` only when it is genuinely reused across features.

## Navigation Constants

Use `shared/constants/pageUrls.ts` where project navigation paths are centralized.

Do not create a second route constants system.

## Protected Top-Level Sections

When adding a protected dashboard section, inspect `middleware.ts`.

Current middleware protection is explicit, not automatic.

If the new top-level path should redirect unauthenticated users, add it to `PROTECTED` following the existing pattern.

## Route Review

Ask:

- Does this fit the existing dashboard route convention?
- Does it need a new layout?
- Does it need middleware protection?
- Does navigation use the existing route constants?
- Are route-specific components kept local?
