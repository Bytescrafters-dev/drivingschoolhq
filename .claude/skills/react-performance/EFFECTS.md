# Effect Discipline

Use `useEffect` for synchronizing React with an external system.

Do not use it by default for internal data flow.

## Avoid Derived-State Effects

Avoid:

```tsx
const [fullName, setFullName] = useState('');

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

Prefer:

```tsx
const fullName = `${firstName} ${lastName}`;
```

## Avoid Event Effects

If work happens because a user clicked a button, put it in the event handler when practical.

Do not create state solely to trigger an effect for the event.

## Avoid API Fetch Effects

Use existing TanStack Query hooks rather than `useEffect + fetch` for normal application data.

## Effect Dependencies

Do not suppress dependency warnings casually.

Fix unstable dependencies or restructure the effect where appropriate.

## Cleanup

When an effect subscribes to an external system, provide correct cleanup.
