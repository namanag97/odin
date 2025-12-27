/**
 * Subscription Entity - Commercial Layer
 * 
 * Tenant subscription to a plan with billing cycle tracking.
 */

import type {
  UUID,
  TenantId,
  ISODateTime,
  PositiveInt,
  Brand,
} from '@odin/core-contracts';

// ============================================================================
// Branded IDs
// ============================================================================

/** Branded Subscription ID */
export type SubscriptionId = Brand<UUID, 'SubscriptionId'>;

/** Cast function for SubscriptionId */
export const asSubscriptionId = (id: string): SubscriptionId => id as unknown as SubscriptionId;

// ============================================================================
// Status & Cycle Types
// ============================================================================

/** Subscription lifecycle status */
export type SubscriptionStatus = 
  | 'trialing' 
  | 'active' 
  | 'past_due' 
  | 'cancelled' 
  | 'unpaid' 
  | 'paused';

/** Billing cycle frequency */
export type BillingCycle = 'monthly' | 'yearly';

/** Subscription change type */
export type ChangeType = 'upgrade' | 'downgrade' | 'seat_change' | 'cancel' | 'reactivate';

// ============================================================================
// Entity
// ============================================================================

/**
 * Subscription - Tenant's subscription to a plan
 */
export interface Subscription {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly planId: UUID;
  readonly status: SubscriptionStatus;
  readonly billingCycle: BillingCycle;
  readonly currentPeriodStart: ISODateTime;
  readonly currentPeriodEnd: ISODateTime;
  readonly seats: PositiveInt;
  readonly trialEndsAt?: ISODateTime;
  readonly cancelledAt?: ISODateTime;
  readonly cancellationReason?: string;
  readonly externalId?: string;             // Stripe subscription ID
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

/**
 * SubscriptionChange - Tracks subscription modifications
 */
export interface SubscriptionChange {
  readonly id: UUID;
  readonly subscriptionId: UUID;
  readonly type: ChangeType;
  readonly previousPlanId?: UUID;
  readonly newPlanId?: UUID;
  readonly previousSeats?: number;
  readonly newSeats?: number;
  readonly effectiveAt: ISODateTime;
  readonly processedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new subscription
 */
export interface CreateSubscriptionData {
  readonly tenantId: TenantId;
  readonly planId: UUID;
  readonly billingCycle: BillingCycle;
  readonly seats: PositiveInt;
  readonly externalId?: string;
  readonly trialEndsAt?: ISODateTime;
}

/**
 * Data for updating a subscription
 */
export interface UpdateSubscriptionData {
  readonly planId?: UUID;
  readonly billingCycle?: BillingCycle;
  readonly seats?: PositiveInt;
  readonly externalId?: string;
}

/**
 * Data for scheduling a subscription change
 */
export interface ScheduleChangeData {
  readonly type: ChangeType;
  readonly newPlanId?: UUID;
  readonly newSeats?: number;
  readonly effectiveAt: ISODateTime;
}
