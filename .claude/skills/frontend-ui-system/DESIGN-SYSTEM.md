# Design System

## Inspect First

Before changing theme behavior, inspect:

- `app/globals.css`
- `components.json`
- `components/ui/`
- nearby dashboard pages

Do not invent a parallel theme system.

## Semantic Tokens

Prefer semantic classes/tokens such as:

```text
background
foreground
primary
primary-foreground
secondary
muted
accent
destructive
border
input
ring
card
popover
```

Avoid arbitrary brand colors when a semantic token already expresses the intent.

Prefer:

```tsx
className="bg-primary text-primary-foreground"
```

over:

```tsx
className="bg-blue-600 text-white"
```

when `primary` is the intended semantic role.

## Consistency

Maintain consistent:

- spacing
- radius
- typography
- button hierarchy
- card treatment
- form density
- table density
- dialog sizing
- status presentation

Do not redesign one page in isolation unless requested.

## New Theme Palette

If the project introduces/updates its theme palette:

1. define tokens centrally;
2. preserve shadcn semantic naming;
3. verify contrast/accessibility;
4. migrate components toward semantic tokens;
5. avoid page-local hardcoded brand colors.
