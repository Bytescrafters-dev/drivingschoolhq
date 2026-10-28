---
name: frontend-components
description: >
  React component design rules for simple, cohesive, loosely coupled,
  functional components using pragmatic SOLID and existing project patterns.
---

# Frontend Components

## Purpose

Use this skill when creating or refactoring React components.

## Principles

### Keep It Simple

Prefer the simplest implementation that clearly satisfies the current requirement.

Do not introduce:

- factories
- engines
- registries
- strategy layers
- generic renderers
- centralized abstractions

for hypothetical future use.

Repeated concrete cases should justify abstraction.

### Functional Components Only

Use functional components for new code.

Do not introduce class components.

### Split by Responsibility

Break large components into cohesive pieces when it improves:

- readability
- reuse
- state ownership
- testability
- coupling

Do not create micro-components merely to reduce line count.

### Loosely Couple Components

Prefer explicit props and stable domain interfaces.

Avoid components that reach into unrelated contexts or global state without need.

### Reuse Before Creation

Before creating a component:

1. search the local route `components/`;
2. search shared `components/`;
3. search `components/ui/`;
4. inspect similar pages.

Extend/reuse an existing component when it remains cohesive.

### Keep UI and Data Responsibilities Separate

Presentational components should focus on rendering and interaction.

Client-side backend data should normally enter through domain hooks, not ad-hoc `fetch` calls inside arbitrary components.

### Pragmatic SOLID

Apply SOLID where it improves responsibility, dependency direction, or reuse.

Do not add abstractions merely to demonstrate SOLID.

## Read When Relevant

- decomposition/coupling → [COMPONENT-BOUNDARIES.md](COMPONENT-BOUNDARIES.md)
- SOLID decisions → [SOLID.md](SOLID.md)
- examples → [EXAMPLES.md](EXAMPLES.md)

## Review Checklist

- component has a cohesive responsibility
- functional component used
- no speculative abstraction
- no duplicated existing component
- props are clear
- data fetching is not embedded casually in UI components
- page-specific components remain local unless genuinely shared
