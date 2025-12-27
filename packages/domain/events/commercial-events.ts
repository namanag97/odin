/**
 * Commercial Domain Events
 * 
 * Events for subscription, payment, and usage domains.
 */

import type { Event } from '@odin/core-contracts';
import type { UUID, TenantId, UserId, ISODateTime, Percentage } from '@odin/core-contracts';
import type { SubscriptionStatus, Currency, UsageMetric } from '../entities/commercial';

// ============================================================================
// Event Type Constants
// ============================================================================

export const CommercialEventTypes = {
  // Subscription events
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPGRADED: 'subscription.upgraded',
  SUBSCRIPTION_DOWNGRADED: 'subscription.downgraded',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_REACTIVATED: 'subscription.reactivated',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  SUBSCRIPTION_EXPIRED: 'subscription.expired',
  
  // Payment events
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  
  // Invoice events
  INVOICE_CREATED: 'invoice.created',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_OVERDUE: 'invoice.overdue',
  
  // Usage events
  USAGE_RECORDED: 'usage.recorded',
  USAGE_THRESHOLD_REACHED: 'usage.threshold_reached',
  USAGE_LIMIT_EXCEEDED: 'usage.limit_exceeded',
  
  // Coupon events
  COUPON_REDEEMED: 'coupon.redeemed',
  COUPON_EXPIRED: 'coupon.expired',
} as const;

// ============================================================================
// Subscription Event Payloads
// ============================================================================

/** Payload for subscription.created event */
export interface SubscriptionCreatedPayload {
  readonly subscriptionId: UUID;
  readonly tenantId: TenantId;
  readonly planId: UUID;
  readonly status: SubscriptionStatus;
}

/** Payload for subscription.upgraded event */
export interface SubscriptionUpgradedPayload {
  readonly subscriptionId: UUID;
  readonly tenantId: TenantId;
  readonly previousPlanId: UUID;
  readonly newPlanId: UUID;
  readonly effectiveAt: ISODateTime;
}

/** Payload for subscription.downgraded event */
export interface SubscriptionDowngradedPayload {
  readonly subscriptionId: UUID;
  readonly tenantId: TenantId;
  readonly previousPlanId: UUID;
  readonly newPlanId: UUID;
  readonly effectiveAt: ISODateTime;
}

/** Payload for subscription.cancelled event */
export interface SubscriptionCancelledPayload {
  readonly subscriptionId: UUID;
  readonly tenantId: TenantId;
  readonly reason?: string;
  readonly cancelledBy: UserId;
}

/** Payload for subscription.reactivated event */
export interface SubscriptionReactivatedPayload {
  readonly subscriptionId: UUID;
  readonly tenantId: TenantId;
  readonly reactivatedBy: UserId;
}

// ============================================================================
// Payment Event Payloads
// ============================================================================

/** Payload for payment.succeeded event */
export interface PaymentSucceededPayload {
  readonly invoiceId: UUID;
  readonly tenantId: TenantId;
  readonly amount: number;
  readonly currency: Currency;
}

/** Payload for payment.failed event */
export interface PaymentFailedPayload {
  readonly invoiceId: UUID;
  readonly tenantId: TenantId;
  readonly failureReason: string;
  readonly attemptCount: number;
}

/** Payload for payment.refunded event */
export interface PaymentRefundedPayload {
  readonly invoiceId: UUID;
  readonly tenantId: TenantId;
  readonly amount: number;
  readonly currency: Currency;
  readonly reason?: string;
}

// ============================================================================
// Usage Event Payloads
// ============================================================================

/** Payload for usage.threshold_reached event */
export interface UsageThresholdReachedPayload {
  readonly tenantId: TenantId;
  readonly metric: UsageMetric;
  readonly currentUsage: number;
  readonly limit: number;
  readonly thresholdPercent: Percentage;
}

/** Payload for usage.limit_exceeded event */
export interface UsageLimitExceededPayload {
  readonly tenantId: TenantId;
  readonly metric: UsageMetric;
  readonly currentUsage: number;
  readonly limit: number;
}

// ============================================================================
// Typed Event Aliases
// ============================================================================

export type SubscriptionCreatedEvent = Event<SubscriptionCreatedPayload>;
export type SubscriptionUpgradedEvent = Event<SubscriptionUpgradedPayload>;
export type SubscriptionDowngradedEvent = Event<SubscriptionDowngradedPayload>;
export type SubscriptionCancelledEvent = Event<SubscriptionCancelledPayload>;
export type SubscriptionReactivatedEvent = Event<SubscriptionReactivatedPayload>;

export type PaymentSucceededEvent = Event<PaymentSucceededPayload>;
export type PaymentFailedEvent = Event<PaymentFailedPayload>;
export type PaymentRefundedEvent = Event<PaymentRefundedPayload>;

export type UsageThresholdReachedEvent = Event<UsageThresholdReachedPayload>;
export type UsageLimitExceededEvent = Event<UsageLimitExceededPayload>;
