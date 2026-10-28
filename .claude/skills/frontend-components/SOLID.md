# Pragmatic SOLID for Frontend

SOLID is a design aid, not a target.

## SRP

A component or hook should have one cohesive responsibility.

Do not split a cohesive component solely because it is long.

Split when it mixes distinct concerns such as:

- data orchestration
- form state
- table rendering
- modal workflow
- unrelated business interactions

## OCP

Prefer extension through composition where variation is real.

Do not pre-build strategy systems for imagined variants.

## LSP

Reusable component variants must preserve the expected component contract.

Do not create a "compatible" component whose props behave differently from the abstraction it replaces.

## ISP

Prefer focused props/interfaces over giant configuration objects.

Avoid one mega-component with dozens of optional behavior flags unless the project already uses that pattern successfully.

## DIP

High-level UI behavior should depend on stable hooks/components rather than backend implementation details.

A UI component should not need to know token, proxy, or transport internals.

## Decision Rule

Before adding an abstraction ask:

1. What concrete duplication or coupling does this solve?
2. Does it simplify future maintenance now?
3. Are there at least repeated real cases?
4. Is composition simpler?
5. Does the abstraction hide useful domain meaning?

If the abstraction mostly adds indirection, do not add it.
