# Component Boundaries

## Split by Cohesive Responsibility

Good:

```text
OrderPage
├── OrderHeader
├── OrderSummary
├── OrderItemsTable
├── PaymentSummary
└── OrderActions
```

Each component owns a meaningful UI responsibility.

Avoid splitting every primitive:

```text
OrderName
OrderDateText
OrderStatusText
OrderAmountText
```

unless those components have actual reusable behavior or styling semantics.

## State Ownership

Keep state as close as practical to the interaction that owns it.

Avoid lifting state solely to make it "centralized".

Lift state when:

- siblings genuinely need coordinated access;
- the parent owns the workflow;
- persistence/navigation requires it.

## Local vs Shared

Use route-local components when only one feature needs them.

Promote to shared `components/` when reuse is real.

Use `components/ui/` for shadcn/primitives, not feature-specific business components.

## Coupling

Prefer:

```tsx
<ProductTable products={products} onEdit={onEdit} />
```

over components that implicitly read unrelated global context when explicit inputs are practical.

Do not pass huge "god objects" if the child needs only a few values.
