# Form Guidelines

Use existing:

```text
react-hook-form
+
zod v4
+
existing UI controls
+
sonner
```

## Before Creating a Form

Inspect a similar existing create/update form.

Reuse:

- layout
- field components
- validation style
- mutation handling
- toast behavior
- button placement

## Validation

Client validation improves UX.

Backend validation remains authoritative.

Keep structural validation in Zod/form schema.

Do not duplicate complex backend business rules unless needed for UX and maintainable.

## Submit Behavior

Handle:

- submitting state
- double-submit prevention
- field validation
- backend/API errors
- success feedback
- navigation/reset after success

## Edit Forms

Handle:

- initial/default values
- async data loading
- reset behavior
- stale record state
- update mutation feedback

## Error Handling

Prefer field-level errors when the backend error maps to a field.

Use toast/global feedback for non-field failures according to project patterns.

Do not use `alert()` when the project uses Sonner/toast patterns.
