# Rendering Guidelines

## State Locality

Keep frequently changing state close to the component that owns it.

Moving input state into a smaller child can be more effective than memoizing a huge page.

## Props

Avoid creating unstable object/function props only when they actually cause a meaningful render problem.

Do not stabilize every inline value by default.

## Component Identity

Use stable keys based on domain identifiers.

Do not use array index as key when items can be reordered/inserted/removed.

## Pure Render

Do not perform side effects during render.

Derive UI from props/state predictably.

## Expensive Calculations

Use `useMemo` only when the calculation is genuinely expensive or referential stability matters.

Profile or reason from actual cost, not habit.
