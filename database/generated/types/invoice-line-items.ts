export type InvoiceLineItemsType = "subscription" | "usage" | "one_time" | "adjustment" | "tax";

/**
 * Represents a row in the invoice_line_items table
 * Source: 22_commercial_layer.sql
 */
export interface InvoiceLineItems {
  /** Primary key */
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  type: InvoiceLineItemsType;
  period_start: string | null;
  period_end: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
}

/** Insert type for invoice_line_items (excludes auto-generated fields) */
export interface InvoiceLineItemsInsert {
  invoice_id: string;
  description: string;
  quantity?: number;
  unit_price: number;
  amount: number;
  type: InvoiceLineItemsType;
  period_start?: string | null;
  period_end?: string | null;
  metadata?: Record<string, unknown> | null;
}