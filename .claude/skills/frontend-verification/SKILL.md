---
name: frontend-verification
description: >
  Final verification workflow for frontend changes covering requirements,
  App Router architecture, BFF/auth boundaries, hook/store scope, UI
  consistency, permissions, accessibility, responsive behavior, lint, build,
  and runtime/manual checks.
---

# Frontend Verification

## Purpose

Use this skill after implementing or modifying frontend functionality.

Verification should determine whether the change is:

- correct
- consistent
- architecturally compliant
- secure with respect to BFF/auth boundaries
- usable
- accessible
- responsive
- buildable
- safe to integrate

## Never Claim Unexecuted Verification

Never claim:

```text
lint passed
build passed
runtime works
feature works
tests passed
```

unless the relevant check actually ran successfully.

This repository currently has no automated test suite configured.

Do not claim tests passed.

## Project Commands

Use:

```bash
yarn lint
yarn build
yarn dev
```

Do not invent test commands.

## Verification Order

For non-trivial changes:

```text
1. Review requirement
2. Review changed files
3. Review App Router / Server-Client boundaries
4. Review BFF/auth/data-hook behavior
5. Review store scoping and permissions
6. Review UI consistency/accessibility/responsiveness
7. Run lint
8. Run build
9. Run dev/manual verification where practical
```

Fix structural problems before broad runtime checks.

## Requirement Review

Confirm:

- requested behavior exists
- expected states/actions exist
- loading/error/empty states are handled
- permission behavior matches requirement
- store-scoped behavior is correct
- relevant navigation is wired

## Delegate to Skills

Architecture issue:

```text
nextjs-architecture
```

Component-design issue:

```text
frontend-components
```

Data/state issue:

```text
frontend-data-state
```

UI/UX issue:

```text
frontend-ui-system
```

Performance issue:

```text
react-performance
```

## Read When Relevant

- detailed review → [REVIEW-CHECKLIST.md](REVIEW-CHECKLIST.md)
- build/runtime/manual checks → [RUNTIME-CHECKS.md](RUNTIME-CHECKS.md)

## Completion Gate

Before completion confirm:

- requirement satisfied
- no direct browser-to-backend call introduced
- App Router conventions followed
- client boundary is appropriate
- existing hook/component reuse considered
- store scope correct
- permissions UX correct
- loading/error/empty states handled
- UI matches existing product
- accessibility/responsive concerns reviewed
- lint/build passed where run
- runtime/manual gaps reported honestly
