# Large Lists and Tables

## Prefer Bounded Data

Do not render unbounded large datasets when the backend/query architecture can paginate.

For dashboard tables prefer the project's established pagination/filtering patterns.

## Virtualization

Introduce virtualization only when the rendered row count is genuinely large and pagination alone does not satisfy the UX.

Do not add virtualization preemptively.

## Sorting/Filtering

Prefer backend/server-supported filtering/sorting for large datasets when the existing API supports it.

Avoid repeatedly sorting/filtering tens of thousands of rows in render.

## Expensive Table Cells

Avoid expensive calculations in every cell render.

Precompute/normalize only when there is a demonstrated need.

## Review

- dataset bounded?
- stable keys?
- expensive transforms?
- repeated per-row queries?
- unnecessary re-rendering?
