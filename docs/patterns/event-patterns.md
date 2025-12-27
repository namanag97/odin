# Event Patterns - Odin Domain Layer

> **Purpose:** Standard patterns for domain events
> **Prevents:** 30 min exploration per new event file

## Quick Reference

**Structure:**
1. Event type constants object
2. Payload interfaces
3. Typed event aliases

**Key Rules:**
- Use `Event<Payload>` from core-contracts
- Payload naming: `{EventName}Payload`
- Event type naming: `{entity}.{action}`
- Constants object: `{Domain}EventTypes`

## Pattern Example

**File:** `/packages/domain/events/commercial-events.ts`

```typescript
import type { Event, UUID, TenantId } from '@odin/core-contracts';

// ============================================================================
// Event Type Constants
// ============================================================================

export const CommercialEventTypes = {
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
} as const;

// ============================================================================
// Payloads
// ============================================================================

export interface SubscriptionCreatedPayload {
  readonly subscriptionId: UUID;
  readonly tenantId: TenantId;
  readonly planId: UUID;
}

export interface SubscriptionCancelledPayload {
  readonly subscriptionId: UUID;
  readonly tenantId: TenantId;
  readonly reason?: string;
}

export interface PaymentSucceededPayload {
  readonly invoiceId: UUID;
  readonly amount: number;
}

// ============================================================================
// Typed Events
// ============================================================================

export type SubscriptionCreatedEvent = Event<SubscriptionCreatedPayload>;
export type SubscriptionCancelledEvent = Event<SubscriptionCancelledPayload>;
export type PaymentSucceededEvent = Event<PaymentSucceededPayload>;
```

## Naming Conventions

**Event constants:** UPPER_SNAKE_CASE
**Event strings:** `{entity}.{past_tense_action}`
**Payloads:** `{EventName}Payload`
**Type aliases:** `{EventName}Event`

## Checklist

- [ ] File header with JSDoc
- [ ] Event constants object
- [ ] Payload interfaces (readonly fields)
- [ ] Type aliases using `Event<Payload>`
- [ ] Updated events/index.ts export

**Reference:** `/packages/domain/events/commercial-events.ts`
