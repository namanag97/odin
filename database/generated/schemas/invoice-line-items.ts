/**
 * Zod schemas for invoice_line_items table
 * Source: 22_commercial_layer.sql
 */

import { z } from "zod";

/** Schema for a invoice_line_items row */
export const InvoiceLineItemsSchema = z.object({
  id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  description: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
  amount: z.number(),
  type: z.enum(["subscription", "usage", "one_time", "adjustment", "tax"]),
  period_start: z.string().nullable(),
  period_end: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
});

export type InvoiceLineItems = z.infer<typeof InvoiceLineItemsSchema>;

/** Schema for inserting a invoice_line_items row */
export const InvoiceLineItemsInsertSchema = z.object({
  invoice_id: z.string().uuid(),
  description: z.string(),
  quantity: z.number().optional(),
  unit_price: z.number(),
  amount: z.number(),
  type: z.enum(["subscription", "usage", "one_time", "adjustment", "tax"]),
  period_start: z.string().nullable().optional(),
  period_end: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type InvoiceLineItemsInsert = z.infer<typeof InvoiceLineItemsInsertSchema>;

/** Schema for updating a invoice_line_items row */
export const InvoiceLineItemsUpdateSchema = InvoiceLineItemsInsertSchema.partial();

export type InvoiceLineItemsUpdate = z.infer<typeof InvoiceLineItemsUpdateSchema>;