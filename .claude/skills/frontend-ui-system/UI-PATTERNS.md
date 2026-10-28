# Dashboard UI Patterns

Before implementing a new section, inspect at least one or two nearby mature sections.

## List Page

A typical list screen may include:

```text
Page Header
├── title/description
└── primary action

Filters/Search

Table/List

Pagination

Empty/Loading/Error state
```

Follow the project's actual nearby pattern.

## Create/Update Page

Prefer existing form layout and navigation patterns.

Reuse:

- back navigation
- headings
- card/form sections
- footer buttons
- toasts
- success navigation

## Tables

The project uses:

```text
@tanstack/react-table
```

Do not introduce another table framework for ordinary dashboard tables.

Inspect existing patterns for:

- columns
- sorting
- filters
- row actions
- pagination
- empty states

## Toasts

The project uses Sonner.

Do not introduce `alert()` or a second toast framework.

## Permissions

Hide/disable UI actions using `usePermissions.ts` where the existing role model requires it.

Never treat this as backend authorization.

## Lead Import/Export

Existing XLSX parsing/template utilities live in `lib/utils.ts` with mappings in `types/leads.ts`.

Do not duplicate spreadsheet helpers for leads without checking these first.
