/**
 * Invoice Entity - Commercial Layer
 * 
 * Billing invoice with line items.
 */

import type {
  UUID,
  TenantId,
  ISODateTime,
  URL,
  Brand,
} from '@odin/core-contracts';

import type { Currency } from './plan';

// ============================================================================
// Branded IDs
// ============================================================================

/** Branded Invoice ID */
export type InvoiceId = Brand<UUID, 'InvoiceId'>;

/** Cast function for InvoiceId */
export const asInvoiceId = (id: string): InvoiceId => id as unknown as InvoiceId;

// ============================================================================
// Status & Line Item Types
// ============================================================================

/** Invoice status */
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

/** Line item type */
export type LineItemType = 'subscription' | 'seat' | 'usage' | 'adjustment' | 'proration';

// ============================================================================
// Line Item
// ============================================================================

/**
 * Individual line item on an invoice
 */
export interface InvoiceLineItem {
  readonly id: UUID;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly amount: number;
  readonly type: LineItemType;
  readonly periodStart?: ISODateTime;
  readonly periodEnd?: ISODateTime;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * Invoice - Billing document
 */
export interface Invoice {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly subscriptionId: UUID;
  readonly number: string;                  // INV-2024-00001
  readonly status: InvoiceStatus;
  readonly periodStart: ISODateTime;
  readonly periodEnd: ISODateTime;
  readonly dueDate: ISODateTime;
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
  readonly currency: Currency;
  readonly lineItems: readonly InvoiceLineItem[];
  readonly paidAt?: ISODateTime;
  readonly externalId?: string;             // Stripe invoice ID
  readonly pdfUrl?: URL;
  readonly createdAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new invoice
 */
export interface CreateInvoiceData {
  readonly tenantId: TenantId;
  readonly subscriptionId: UUID;
  readonly periodStart: ISODateTime;
  readonly periodEnd: ISODateTime;
  readonly dueDate: ISODateTime;
  readonly currency: Currency;
  readonly lineItems: readonly Omit<InvoiceLineItem, 'id'>[];
  readonly externalId?: string;
}

/**
 * Data for updating an invoice
 */
export interface UpdateInvoiceData {
  readonly status?: InvoiceStatus;
  readonly paidAt?: ISODateTime;
  readonly pdfUrl?: URL;
  readonly externalId?: string;
}
