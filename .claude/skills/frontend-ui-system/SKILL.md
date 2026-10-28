---
name: frontend-ui-system
description: >
  UI and UX rules for shadcn-first components, semantic theming, dashboard
  consistency, permissions UX, loading/error/empty states, accessibility,
  responsive layouts, tables, forms, and interaction patterns.
---

# Frontend UI System

## Purpose

Use this skill when implementing or reviewing UI/UX.

## Component Priority

Use this order:

```text
1. Existing project component
2. Existing customized shadcn component in components/ui
3. Add/use the appropriate shadcn component
4. Compose a small custom component from existing primitives
5. Add another UI dependency only when genuinely necessary
```

Do not add a third-party UI library when the requirement can be met cleanly with existing components.

## Preserve the Existing Visual Language

Before building a new page, inspect similar existing dashboard pages.

Match established patterns for:

- page headers
- breadcrumbs
- action buttons
- cards
- forms
- tables
- filters
- dialogs
- spacing
- empty states
- loading states
- destructive confirmations
- toasts

## Theme

Prefer semantic theme tokens rather than arbitrary colors.

Read [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).

## Permissions UX

Use:

```text
hooks/auth/usePermissions.ts
```

for existing role-based UI gating.

Do not create another permission architecture.

`PlatformPermission` is currently unused; do not revive/migrate to it without an explicit architectural decision.

Frontend permissions improve UX.

Backend authorization remains authoritative.

## Prices

Backend prices use minor units.

Use the existing:

```text
getDisplayPrice
```

helper instead of duplicating price conversion logic.

## UI States

Every async list/page should consider:

- loading
- error
- empty
- success

Mutations should consider:

- idle
- submitting
- success
- failure

## Read When Relevant

- theme/tokens → [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)
- accessibility → [ACCESSIBILITY.md](ACCESSIBILITY.md)
- responsive behavior → [RESPONSIVE-UX.md](RESPONSIVE-UX.md)
- common dashboard patterns → [UI-PATTERNS.md](UI-PATTERNS.md)

## Review Checklist

- existing components reused
- shadcn prioritized
- semantic theme tokens used
- page matches nearby UX
- permissions use existing hook
- loading/error/empty state exists
- responsive behavior considered
- accessibility basics preserved
