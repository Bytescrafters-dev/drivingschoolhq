# Runtime and Static Verification

## Lint

Run:

```bash
yarn lint
```

Fix underlying issues.

Do not suppress ESLint errors merely to get green output.

## Build

Run:

```bash
yarn build
```

The build may catch:

- TypeScript errors
- App Router issues
- invalid imports
- server/client boundary mistakes
- environment problems
- static build/runtime assumptions

Fix build failures before completion.

## Dev Runtime

When practical run:

```bash
yarn dev
```

Verify the affected flow manually.

Useful checks include:

- route loads
- navigation works
- no hydration/runtime error
- BFF request succeeds
- auth refresh/redirect behavior is preserved
- store switching updates scoped data
- form submits correctly
- toast/error/empty/loading state appears
- permissions hide/show intended actions
- responsive layout behaves reasonably

## Environment

`lib/env.ts` throws on invalid env values.

Ensure required local values exist before diagnosing unrelated runtime failures.

Do not "fix" middleware by importing `lib/env.ts`.

## No Tests

There is currently no automated test suite configured.

Do not invent or report automated test execution.

If a test stack is added later, update this verification skill to include it.

## Partial Verification

If manual runtime verification cannot be completed, state exactly what was verified.

Example:

```text
Verified:
- yarn lint
- yarn build

Not verified:
- interactive store-switch flow because backend API was unavailable
```
