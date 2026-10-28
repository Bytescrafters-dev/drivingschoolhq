# DrivingSchoolHQ Tenant Frontend

This repository contains **`drivingschoolhq`**, the tenant-facing frontend for the Sri Lankan Driving Schools SaaS platform.

It is a **Next.js application for driving-school administration and licence-workflow operations**.

The application is used by authenticated tenant staff to manage:

- branches;
- staff users;
- roles and permissions;
- instructors;
- vehicles;
- customers;
- licence applications;
- customer/application documents;
- medical-assessment tracking;
- written-test tracking;
- learner permits;
- training plans and sessions;
- practical-test attempts;
- driving-licence issuance;
- scheduling;
- operational reporting where supported.

The frontend has **no database of its own**.

All persistent data comes from an external backend API through a **Next.js Backend-for-Frontend (BFF) layer**.

Read and follow this file before creating or changing architecture, authentication, authorization, API access, routing, data fetching, forms, shared components, or feature structure.

---

# 1. Product Boundary

This application is the **tenant / driving-school operational application**.

It is not the SaaS platform-administration application.

Keep the distinction clear:

```text
drivingschoolhq-admin
    → platform administrators
    → manages tenants, price plans, subscriptions, SaaS invoices

drivingschoolhq
    → driving-school staff
    → manages branches, staff, instructors, vehicles, customers,
      licence applications and operational workflows
```

Do not introduce platform-admin concepts such as:

- creating tenants;
- editing SaaS price plans;
- platform subscription management;
- SaaS tenant invoices;
- platform admin users;

unless the requirement explicitly introduces a tenant-visible view of such information.

---

# 2. Core Domain

The tenant application is centred around two main operational areas:

```text
DRIVING SCHOOL ADMINISTRATION
    │
    ├── Branches
    ├── Staff Users
    ├── Roles / Permissions
    ├── Instructors
    └── Vehicles

CUSTOMER / LICENCE OPERATIONS
    │
    ├── Customers
    └── Licence Applications
          ├── Applicant Snapshot
          ├── Vehicle Classes
          ├── Documents
          ├── Medical Assessment
          ├── Written Test
          ├── Learner Permit
          ├── Training
          ├── Practical Test
          └── Licence Issuance
```

`Customer` and `LicenceApplication` are separate concepts.

A customer is the person.

A licence application is a business transaction / case for that person.

A customer may have multiple licence applications over time.

Example:

```text
Customer
  ├── Application #1
  │     → New licence
  │     → A + B
  │
  └── Application #2
        → Add licence class
        → C1
```

Do not model a customer's current workflow stage directly on the customer record.

---

# 3. Licence Application Domain

`LicenceApplication` is the central operational workflow.

Typical lifecycle:

```text
Customer
   ↓
Licence Application
   ↓
Document Collection
   ↓
Medical Assessment
   ↓
Written Test
   ↓
Learner Permit
   ↓
Training
   ↓
Practical Test
   ↓
Licence Issuance
   ↓
Completed
```

Failures do not normally create a new application.

Example:

```text
Written Test
   ├── Attempt 1 → FAIL
   └── Attempt 2 → PASS
```

or:

```text
Practical Test - Class B
   ├── Attempt 1 → FAIL
   └── Attempt 2 → PASS
```

The existing application continues.

The frontend must preserve and display attempt history where the backend exposes it.

---

# 4. Vehicle-Class Workflow

One application may contain multiple requested licence classes.

Example:

```text
Application #1001

A
  → Training
  → Practical attempt 1
  → PASS

B
  → Training
  → Practical attempt 1
  → FAIL
  → Additional training
  → Practical attempt 2
  → PASS
```

Do not assume the entire application has one simple workflow state.

The backend may expose:

```text
Application.status = ACTIVE

Class A = COMPLETED
Class B = REATTEMPT_REQUIRED
Class B1 = TRAINING
```

The UI should preserve this distinction.

Do not collapse detailed class-level progress into one misleading application status.

---

# 5. Frontend Architecture

The application uses:

- Next.js with the App Router;
- TypeScript;
- Next.js BFF route handlers;
- TanStack Query for server state;
- shadcn/ui;
- Tailwind CSS v4;
- react-hook-form;
- zod;
- sonner;
- TanStack Table.

The browser must never communicate with the backend API directly.

The browser must never receive or manage backend access/refresh tokens directly.

All authenticated backend traffic flows through the Next.js BFF.

```text
Browser
   │
   ▼
Next.js App
   │
   ▼
Next.js BFF
   │
   ├── reads secure auth cookies
   ├── injects backend bearer token
   ├── refreshes authentication when required
   │
   ▼
External NestJS Backend
```

The frontend has no database connection.

Do not add:

- Prisma;
- database clients;
- frontend-owned business tables;
- local persistent copies of backend business data.

---

# 6. Authentication Architecture

Authentication follows a BFF pattern.

The backend owns authentication.

The Next.js server stores backend access/refresh tokens in secure cookies.

Client components must never:

- read access tokens;
- read refresh tokens;
- store tokens in localStorage;
- store tokens in sessionStorage;
- store bearer tokens in React state;
- manually add backend bearer tokens.

## Login

Create the login route at:

```text
app/api/auth/login/route.ts
```

It posts credentials to:

```text
${BACKEND_URL}/tenant/auth/login
```

The login payload follows the backend contract and includes:

```text
email
password
decode
```

when required by the backend API.

The login route must:

1. receive credentials from the browser;
2. call the tenant backend login endpoint;
3. receive backend authentication tokens;
4. store access/refresh tokens in secure server-managed cookies;
5. return safe login metadata to the browser;
6. return `mustChangePassword` when supplied by the backend.

The browser must never receive the raw backend tokens.

If:

```text
mustChangePassword = true
```

route the user to:

```text
/forceChangePassword
```

---

# 7. Generic Backend Proxy

All normal authenticated client data requests must use one generic BFF proxy.

Target route:

```text
app/api/proxy/[...path]/route.ts
```

Client code should call:

```ts
fetch("/api/proxy/tenant/branches");
fetch("/api/proxy/tenant/customers");
fetch("/api/proxy/tenant/licence-applications");
```

instead of calling `BACKEND_URL` directly.

The proxy forwards:

- HTTP method;
- request body;
- query parameters;
- required headers;

to:

```text
${BACKEND_URL}/<backend-path>
```

and injects:

```text
Authorization: Bearer <access-cookie-token>
```

The reusable proxy logic should live in:

```text
lib/with-auth-proxy.ts
```

with functions equivalent to:

```ts
proxyToBackend();
proxyToBackendWithAccess();
```

Do not create a dedicated Next.js route handler for every backend resource.

To call a new backend endpoint from client code, use:

```ts
fetch("/api/proxy/tenant/<backend-path>");
```

Dedicated route handlers under:

```text
app/api/auth/*
```

exist only for operations that must read/write authentication cookies or perform authentication-specific server logic.

---

# 8. Refresh-on-401

The generic proxy owns token refresh.

Expected flow:

```text
Client request
   │
   ▼
/api/proxy/*
   │
   ▼
Backend API
   │
   ├── success
   │      ↓
   │   return response
   │
   └── 401
        │
        ▼
   /api/auth/refresh
        │
        ▼
   refresh access token
        │
        ▼
   retry original request
        │
        ├── success
        │      ├── return response
        │      └── set refreshed cookies
        │
        └── failure
               ↓
        redirect to login
```

Refresh requests should be deduplicated with a module-level promise such as:

```ts
pendingRefresh;
```

so concurrent 401 responses do not unnecessarily trigger multiple refresh calls.

After refresh:

- retry with the new access token;
- apply refreshed cookies to the returned response.

If refresh fails or the retry remains unauthorized:

```text
/login?next=<original-path>
```

Do not implement token-refresh logic inside feature hooks or components.

---

# 9. Middleware

Create middleware at:

```text
middleware.ts
```

Middleware protects authenticated routes by checking for the presence of the auth cookie.

It may:

- detect missing auth cookie;
- redirect to `/login`.

It should not become the source of truth for token validity.

Middleware checks cookie presence, not backend token validity.

Expiry and invalid-token handling belong to the BFF refresh flow.

Do not duplicate JWT-validation logic in middleware unless the project architecture explicitly changes.

---

# 10. Tenant Context and RBAC

The authenticated tenant is determined by backend authentication context.

Do not allow the browser to establish authorization by passing arbitrary `tenantId` values.

For normal tenant API calls, use:

```text
/api/proxy/tenant/...
```

The backend resolves the tenant from the authenticated user/token.

This application uses tenant permissions, not platform permissions.

Centralize permission constants under:

```text
shared/constants/
```

using a domain name such as:

```ts
TenantPermission;
```

Frontend permission checks are UX controls only.

The backend remains the actual authorization boundary.

---

# 11. Routing

Use the Next.js App Router only.

Do not add pages under the legacy:

```text
pages/
```

directory.

Target route structure:

```text
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── forceChangePassword/
│       └── page.tsx
│
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── branches/
│   ├── staff/
│   ├── instructors/
│   ├── vehicles/
│   ├── customers/
│   ├── licence-applications/
│   └── ...
│
└── api/
    ├── auth/
    │   ├── login/
    │   ├── refresh/
    │   └── logout/
    └── proxy/
        └── [...path]/
```

This repository is fresh.

These are target conventions, not existing-path assumptions.

Create directories only when the corresponding feature is implemented.

Do not generate empty folders simply to mirror this document.

---

# 12. Dashboard Shell

Pages under:

```text
app/(dashboard)/
```

are authenticated tenant pages.

The dashboard shell should use shared components equivalent to:

```text
SidebarProvider
AppSidebar
SiteHeader
```

Feature routing convention:

```text
<feature>/
├── page.tsx
├── create/
│   └── page.tsx
├── update/
│   └── [id]/
│       └── page.tsx
└── components/
```

For complex workflow features such as licence applications, use a dedicated details/workflow route when that better matches the domain.

---

# 13. Sidebar Navigation

Centralize dashboard navigation in:

```text
components/app-sidebar.tsx
```

Likely top-level sections:

```text
Dashboard

Administration
  Branches
  Staff
  Instructors
  Vehicles

Customers
  Customers
  Licence Applications
```

Later sections may include:

```text
Scheduling
Training
Reports
Settings
```

Do not create separate navigation definitions per feature.

---

# 14. Data Layer

Use TanStack Query for client-side server state.

Target provider:

```text
components/query-provider.tsx
```

Recommended defaults:

```text
staleTime: 5 minutes
retry: 1
```

All feature API access belongs in domain hooks under:

```text
hooks/
```

Do not fetch feature data directly inside page or presentational components when a domain hook should own the request.

---

# 15. Hook Structure

Target structure:

```text
hooks/
├── auth/
├── my-profile/
├── branches/
├── staff/
├── instructors/
├── vehicles/
├── customers/
└── licence-applications/
```

Typical files:

```text
hooks/branches/
├── use-branches.ts
├── use-branch.ts
├── use-create-branch.ts
└── use-update-branch.ts
```

```text
hooks/customers/
├── use-customers.ts
├── use-customer.ts
├── use-create-customer.ts
└── use-update-customer.ts
```

```text
hooks/licence-applications/
├── use-licence-applications.ts
├── use-licence-application.ts
├── use-create-licence-application.ts
└── ...
```

The non-negotiable rule is:

> API calls belong in reusable hooks under `hooks/`, not directly inside UI components.

---

# 16. Query and Mutation Conventions

Reader hooks use `useQuery()`.

Writer hooks use `useMutation()`.

Query keys must include all values affecting results.

Example:

```ts
useQuery({
  queryKey: ["customers", filters],
  queryFn: () => fetchCustomers(filters),
});
```

After mutations:

- invalidate affected list queries;
- invalidate affected detail queries;
- invalidate parent/application queries when workflow child state changes;
- avoid unrelated refetching.

---

# 17. API Helpers

Hooks may use feature-specific helpers under:

```text
lib/api/
```

Examples:

```text
lib/api/
├── branches.ts
├── staff.ts
├── instructors.ts
├── vehicles.ts
├── customers.ts
└── licence-applications.ts
```

These helpers still call:

```text
/api/proxy/tenant/*
```

They must never call `BACKEND_URL` from browser-side code.

Do not create a second competing API-access pattern.

---

# 18. List State

List pages should keep shareable filters and pagination in URL search params.

Use:

```text
useSearchParams
router.replace
```

or the established equivalent.

Examples:

```text
/customers?page=2&status=ACTIVE&search=perera
/licence-applications?page=1&stage=TRAINING&class=B
```

Useful URL state may include:

- page;
- page size;
- search;
- status;
- branch;
- instructor;
- vehicle class;
- workflow stage;
- sort.

---

# 19. Shared Types

Shared API/domain types belong in:

```text
types/
```

Likely examples:

```text
types/
├── auth.ts
├── pagination.ts
├── branch.ts
├── staff.ts
├── instructor.ts
├── vehicle.ts
├── customer.ts
├── licence-application.ts
├── medical-assessment.ts
├── written-test.ts
├── learner-permit.ts
├── training.ts
├── practical-test.ts
└── driving-licence.ts
```

Do not redefine the same API shape in multiple components.

---

# 20. UI System

Use shadcn/ui as the primary component system.

Configuration target:

```text
new-york style
neutral base
lucide icons
```

Primitives belong in:

```text
components/ui/
```

Add them through the shadcn CLI according to `components.json`.

Use Tailwind CSS v4.

Global design tokens and CSS variables belong in:

```text
app/globals.css
```

---

# 21. Forms, Toasts, and Tables

Forms use:

```text
react-hook-form
+
zod
+
@hookform/resolvers
```

Toasts use `sonner`.

Mount `Toaster` in `app/layout.tsx`.

Tables use `@tanstack/react-table`.

Do not embed raw fetch logic inside forms or table components.

---

# 22. Shared Components and Constants

Reusable cross-feature components belong in:

```text
components/
components/common/
```

Shared constants belong in:

```text
shared/constants/
```

Examples:

```text
routes.ts
permissions.ts
query-keys.ts
```

Do not scatter route strings, query keys, or permission strings across the application.

---

# 23. Administration Domain

## Branches

Branches are subdivisions of the authenticated tenant. They are not separate tenants.

Typical UI may support list, search/filter, create, update, status, contact and location details.

## Staff Users

Staff users are authenticated users who operate the tenant.

They are distinct from `Instructor` and `Customer`.

Staff may have role, permissions, branch access, and status.

## Instructors

`Instructor` is a business-domain entity.

An instructor may optionally link to a staff user if backend support exists.

Typical data may include identity/contact, instructor licence, qualified vehicle classes, branch association, status, and availability.

## Vehicles

Vehicles are tenant-owned operational resources.

Typical data may include registration, make/model, vehicle class, branch, operational status, and relevant expiry/document information.

Use backend-defined status values as the actual contract.

---

# 24. Customer Domain

Customer pages focus on the person.

Typical customer data includes identity, contact, address, preferred language, status, and application history.

Do not model workflow-stage data directly on `Customer` unless backend returns it as derived summary information.

Customer documents and application documents may have different ownership. Preserve that distinction.

---

# 25. Licence Workflow Sections

## Medical Assessment

Display operational information such as appointment/reference, assessment date, status, fit/unfit/referred, certificate number, issue date, and expiry date.

Avoid unnecessary clinical-detail UI.

## Written Test

Preserve attempt history.

```text
Attempt 1 → FAILED
Attempt 2 → ABSENT
Attempt 3 → PASSED
```

Do not model this as one mutable pass/fail toggle if backend provides attempts.

## Learner Permit

Display permit number, issued date, valid-from, expiry, status, and document where available.

Support history/replacement if backend exposes it.

## Training

Training primarily belongs to `ApplicationVehicleClass`.

Conceptually:

```text
ApplicationVehicleClass
   ↓
TrainingPlan
   ↓
TrainingSession
```

Sessions may contain instructor, vehicle, schedule, attendance, lesson type, notes, and progress.

## Practical Test

Preserve attempt history.

```text
Class B
  ├── Attempt 1 → FAILED
  └── Attempt 2 → PASSED
```

A failed attempt does not automatically mean the whole application has permanently failed.

## Driving Licence

A persistent driving licence may contain multiple classes.

Later applications may add classes.

Do not assume every application creates an unrelated licence record.

---

# 26. Scheduling

Scheduling may involve:

```text
Student/Application
Instructor
Vehicle
Branch/Location
```

The backend owns final conflict and eligibility validation.

The frontend should show useful options, prevent obvious invalid selections, and surface backend conflict errors clearly.

Do not recreate the full scheduling engine in frontend code.

---

# 27. Backend-Owned Business Rules

The backend is the source of truth for:

- tenant access;
- permissions;
- plan/usage restrictions;
- application eligibility;
- document requirements;
- test eligibility;
- permit rules;
- training requirements;
- practical-test eligibility;
- scheduling conflicts;
- workflow transitions.

Frontend checks are for UX only.

When frontend assumptions and backend results differ, backend wins.

---

# 28. Error, Loading, and Empty States

Provide consistent handling for:

- validation errors;
- unauthenticated;
- unauthorized;
- tenant suspended/restricted;
- not found;
- conflicts;
- invalid workflow state;
- eligibility failure;
- scheduling conflict;
- unexpected server errors.

Every asynchronous feature should handle:

```text
loading
error
empty
success
```

Do not render blank pages while queries are pending.

---

# 29. Pagination and Filtering

Use backend-supported server-side pagination/filtering for large datasets.

Typical resources include customers, licence applications, staff, instructors, vehicles, and training sessions.

Pass supported values such as page, page size, search, status, branch, class, stage, and sort.

Use backend pagination metadata.

Do not fetch all records just to paginate locally unless the dataset is intentionally small.

---

# 30. Environment Configuration

Backend origin must come from server configuration such as:

```text
BACKEND_URL
```

Do not expose the backend URL through a public environment variable solely for browser access.

The BFF is the backend boundary.

---

# 31. Security Rules

Preserve these guarantees:

1. The browser never receives backend access/refresh tokens.
2. The browser never calls backend API directly.
3. Tokens never go to localStorage/sessionStorage.
4. Auth cookies are handled only by server-side auth/proxy code.
5. Normal client data calls go through `/api/proxy/*`.
6. Middleware presence checks do not replace backend authentication.
7. Frontend permission checks do not replace backend authorization.
8. Tenant scope comes from authenticated backend context.
9. Sensitive customer documents remain authorization protected.
10. Tokens/cookies are never logged.
11. Sensitive personal data is not unnecessarily duplicated in client persistence.
12. Backend business rules are never bypassed in UI logic.

---

# 32. Server and Client Components

Use Server Components by default where practical.

Use Client Components when needed for TanStack Query, react-hook-form, interactive tables, `useSearchParams`, client navigation, browser-only UI state, or interactive shadcn components.

Do not mark entire route trees with `'use client'` without a reason.

---

# 33. State Ownership

Use:

```text
TanStack Query
    → remote/server state

URL search params
    → list/filter/pagination state

react-hook-form
    → form state

local React state
    → temporary UI-only state
```

Do not duplicate query data into local state without a clear reason.

---

# 34. New Feature Pattern

When implementing a new feature:

```text
1. Inspect existing feature patterns
2. Define/reuse API types under types/
3. Define query keys/constants where needed
4. Add domain hooks under hooks/
5. Add route under app/(dashboard)/
6. Add feature-local components
7. Use shadcn primitives
8. Add RHF + zod forms where needed
9. Connect mutations through hooks
10. Invalidate relevant queries
11. Add sidebar navigation if top-level
12. Handle loading/error/empty/success
13. Use URL state for list filters/pagination
14. Respect tenant permissions
15. Run project verification
```

Do not begin by putting fetch calls directly into `page.tsx`.

---

# 35. Target Folder Structure

This repository is fresh.

Use this as the target structure as functionality is implemented:

```text
.
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── forceChangePassword/
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── branches/
│   │   ├── staff/
│   │   ├── instructors/
│   │   ├── vehicles/
│   │   ├── customers/
│   │   ├── licence-applications/
│   │   └── ...
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── refresh/
│   │   │   └── logout/
│   │   └── proxy/
│   │       └── [...path]/
│   │
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── common/
│   ├── query-provider.tsx
│   ├── app-sidebar.tsx
│   └── site-header.tsx
│
├── hooks/
│   ├── auth/
│   ├── my-profile/
│   ├── branches/
│   ├── staff/
│   ├── instructors/
│   ├── vehicles/
│   ├── customers/
│   └── licence-applications/
│
├── lib/
│   ├── with-auth-proxy.ts
│   └── api/
│
├── shared/
│   └── constants/
│
├── types/
│
├── middleware.ts
├── components.json
├── CLAUDE.md
└── ...
```

This is a target convention, not a requirement to create empty folders.

Create files and folders only when a feature actually needs them.

---

# 36. Claude Code Setup

Project agents belong under:

```text
.claude/agents/
```

Primary frontend agent:

```text
.claude/agents/frontend-dev.md
```

Project skills belong under:

```text
.claude/skills/
```

Expected skills may include:

```text
nextjs-architecture
frontend-components
frontend-data-state
frontend-ui-system
react-performance
frontend-verification
```

This root `CLAUDE.md` defines the project domain and non-negotiable architecture.

If an agent or skill conflicts with this file, this file takes precedence.

---

# 37. Implementation Principles

Prefer:

- App Router;
- BFF-only backend access;
- server-managed auth tokens;
- domain hooks under `hooks/`;
- TanStack Query for remote state;
- typed API contracts;
- feature-local components;
- shadcn primitives;
- focused client boundaries;
- URL-based list state;
- react-hook-form + zod;
- tenant-domain terminology;
- backend-owned business rules;
- explicit workflow/history UI;
- maintainable, predictable structure.

Avoid:

- direct browser-to-backend calls;
- client-visible tokens;
- resource-specific BFF handlers when generic proxy works;
- fetch calls scattered inside components;
- legacy `pages/`;
- platform-admin concepts in the tenant app;
- client-controlled tenant authorization;
- giant generic user models combining staff/instructors/customers;
- flattening licence workflows into one status;
- overwriting attempt history in UI models;
- unnecessary global state;
- duplicate remote-state stores;
- frontend reimplementation of backend eligibility/scheduling engines;
- speculative abstractions.

---

# 38. Decision Rule

When multiple implementations are possible, prefer the one that:

1. keeps backend tokens server-side;
2. sends backend traffic through the BFF;
3. preserves tenant boundaries;
4. follows existing folder/hook conventions;
5. keeps API access out of UI components;
6. keeps server state in TanStack Query;
7. expresses the driving-school domain clearly;
8. preserves workflow/history distinctions;
9. reuses the shadcn design system;
10. remains simple to test and change;
11. does not duplicate backend business logic.

---

# 39. Before Reporting Completion

For every meaningful feature:

- inspect existing project patterns first;
- confirm the correct tenant-domain concept;
- ensure API calls use `/api/proxy/*`;
- ensure data access is implemented through hooks;
- ensure query keys/invalidation are correct;
- verify permission-driven UI where relevant;
- verify loading/error/empty/success states;
- verify URL state for list/filter/pagination;
- verify no direct backend/token access is introduced;
- run relevant lint/build/tests from actual repository scripts;
- perform a final diff review.

Never claim tests, lint, build, runtime, or feature behavior succeeded unless the corresponding verification was actually performed successfully.
