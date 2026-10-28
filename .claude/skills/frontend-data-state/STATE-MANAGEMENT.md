# State Management

Use the smallest appropriate state mechanism.

## Server State

Use TanStack Query for backend-derived asynchronous data.

Do not copy query data into local state merely to "manage" it unless there is a real editable draft requirement.

## Selected Store

Use the existing StoreProvider.

Do not create a second store-selection context.

## URL State

Use search params for state that should survive refresh/share/navigation where appropriate, such as:

- search
- filters
- pagination
- sort

Follow existing page patterns.

## Local UI State

Use `useState`/`useReducer` for local interaction state such as:

- dialog open
- selected tab
- temporary local selection
- disclosure state

## Global Client State

Do not introduce Redux/Zustand by default.

Only consider a new global state mechanism when:

- many unrelated branches need the same mutable client-only state;
- Context/local state/query state are clearly insufficient;
- the requirement is concrete, not hypothetical.

## Derived State

Do not store values that can be calculated from existing state/props during render.

Prefer:

```tsx
const fullName = `${firstName} ${lastName}`;
```

over syncing `fullName` with an effect.
