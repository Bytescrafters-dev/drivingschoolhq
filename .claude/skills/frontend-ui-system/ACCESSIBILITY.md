# Accessibility

Accessibility is required even when using shadcn primitives.

## Basics

Use:

- semantic HTML
- correct button/link semantics
- labels for form inputs
- accessible names for icon-only controls
- meaningful heading hierarchy
- keyboard-operable interactions
- focus-visible behavior
- sufficient contrast

## Dialogs and Menus

Preserve focus management provided by shadcn/Radix primitives.

Do not replace accessible primitives with custom clickable `<div>` elements.

## Forms

Every field should have a programmatic label.

Errors should be associated with the relevant field when practical.

## Color

Do not encode important status only by color.

Use text/icon/label semantics as well.

## Tables

Ensure actions remain keyboard reachable and headers remain meaningful.

For mobile alternatives, preserve the same information and actions.
