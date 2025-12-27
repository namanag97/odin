export type InvoicesStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

/**
 * Represents a row in the invoices table
 * Source: 22_commercial_layer.sql
 */
export interface Invoices {
  /** Primary key */
  id: string;
  tenant_id: string;
  subscription_id: string | null;
  external_id: string | null;
  number: string;
  status: InvoicesStatus;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  amount_paid: number;
  amount_due: number;
  period_start: string;
  period_end: string;
  due_date: string;
  paid_at: string | null;
  pdf_url: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for invoices (excludes auto-generated fields) */
export interface InvoicesInsert {
  tenant_id: string;
  subscription_id?: string | null;
  external_id?: string | null;
  number: string;
  status?: InvoicesStatus;
  currency?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  amount_paid?: number;
  amount_due?: number;
  period_start: string;
  period_end: string;
  due_date: string;
  paid_at?: string | null;
  pdf_url?: string | null;
  metadata?: Record<string, unknown> | null;
}