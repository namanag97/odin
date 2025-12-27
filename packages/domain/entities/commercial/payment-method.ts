/**
 * PaymentMethod Entity - Commercial Layer
 * 
 * Payment methods for billing.
 */

import type {
  UUID,
  TenantId,
  ISODateTime,
  Brand,
} from '@odin/core-contracts';

// ============================================================================
// Branded IDs
// ============================================================================

/** Branded PaymentMethod ID */
export type PaymentMethodId = Brand<UUID, 'PaymentMethodId'>;

/** Cast function for PaymentMethodId */
export const asPaymentMethodId = (id: string): PaymentMethodId => id as unknown as PaymentMethodId;

// ============================================================================
// Types
// ============================================================================

/** Payment method type */
export type PaymentMethodType = 'card' | 'bank_account' | 'invoice';

/** Payment provider (Stripe, etc.) */
export type PaymentProvider = 'stripe' | 'paypal' | 'manual';

/**
 * Payment method details (card or bank)
 */
export interface PaymentDetails {
  readonly brand?: string;                  // visa, mastercard
  readonly last4: string;
  readonly expiryMonth?: number;
  readonly expiryYear?: number;
  readonly bankName?: string;
}

/**
 * Billing address for payment method
 */
export interface BillingAddress {
  readonly name: string;
  readonly company?: string;
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly state?: string;
  readonly postalCode: string;
  readonly country: string;
  readonly taxId?: string;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * PaymentMethod - Stored payment method
 */
export interface PaymentMethod {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly type: PaymentMethodType;
  readonly isDefault: boolean;
  readonly details: PaymentDetails;
  readonly billingAddress: BillingAddress;
  readonly externalId?: string;             // Stripe payment method ID
  readonly createdAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new payment method
 */
export interface CreatePaymentMethodData {
  readonly tenantId: TenantId;
  readonly type: PaymentMethodType;
  readonly isDefault?: boolean;
  readonly details: PaymentDetails;
  readonly billingAddress: BillingAddress;
  readonly externalId?: string;
}

/**
 * Data for updating a payment method
 */
export interface UpdatePaymentMethodData {
  readonly isDefault?: boolean;
  readonly billingAddress?: Partial<BillingAddress>;
  readonly externalId?: string;
}
