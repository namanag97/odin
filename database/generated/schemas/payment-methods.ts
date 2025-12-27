/**
 * Zod schemas for payment_methods table
 * Source: 22_commercial_layer.sql
 */

import { z } from "zod";

/** Schema for a payment_methods row */
export const PaymentMethodsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  external_id: z.string().uuid(),
  type: z.enum(["card", "bank_account", "invoice", "paypal", "other"]),
  provider: z.enum(["stripe", "braintree", "adyen", "manual"]),
  is_default: z.number().int(),
  last_four: z.string().nullable(),
  brand: z.string().nullable(),
  exp_month: z.number().int().nullable(),
  exp_year: z.number().int().nullable(),
  billing_address: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type PaymentMethods = z.infer<typeof PaymentMethodsSchema>;

/** Schema for inserting a payment_methods row */
export const PaymentMethodsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  external_id: z.string().uuid(),
  type: z.enum(["card", "bank_account", "invoice", "paypal", "other"]),
  provider: z.enum(["stripe", "braintree", "adyen", "manual"]),
  is_default: z.number().int().optional(),
  last_four: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  exp_month: z.number().int().nullable().optional(),
  exp_year: z.number().int().nullable().optional(),
  billing_address: z.string().nullable().optional(),
});

export type PaymentMethodsInsert = z.infer<typeof PaymentMethodsInsertSchema>;

/** Schema for updating a payment_methods row */
export const PaymentMethodsUpdateSchema = PaymentMethodsInsertSchema.partial();

export type PaymentMethodsUpdate = z.infer<typeof PaymentMethodsUpdateSchema>;