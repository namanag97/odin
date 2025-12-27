/**
 * Zod schemas for invoices table
 * Source: 22_commercial_layer.sql
 */

import { z } from "zod";

/** Schema for a invoices row */
export const InvoicesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  subscription_id: z.string().uuid().nullable(),
  external_id: z.string().uuid().nullable(),
  number: z.string(),
  status: z.enum(["draft", "open", "paid", "void", "uncollectible"]),
  currency: z.string(),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  amount_paid: z.number(),
  amount_due: z.number(),
  period_start: z.string(),
  period_end: z.string(),
  due_date: z.string(),
  paid_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  pdf_url: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Invoices = z.infer<typeof InvoicesSchema>;

/** Schema for inserting a invoices row */
export const InvoicesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  subscription_id: z.string().uuid().nullable().optional(),
  external_id: z.string().uuid().nullable().optional(),
  number: z.string(),
  status: z.enum(["draft", "open", "paid", "void", "uncollectible"]).optional(),
  currency: z.string().optional(),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  total: z.number().optional(),
  amount_paid: z.number().optional(),
  amount_due: z.number().optional(),
  period_start: z.string(),
  period_end: z.string(),
  due_date: z.string(),
  paid_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  pdf_url: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type InvoicesInsert = z.infer<typeof InvoicesInsertSchema>;

/** Schema for updating a invoices row */
export const InvoicesUpdateSchema = InvoicesInsertSchema.partial();

export type InvoicesUpdate = z.infer<typeof InvoicesUpdateSchema>;