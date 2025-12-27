/**
 * Zod schemas for coupons table
 * Source: 22_commercial_layer.sql
 */

import { z } from "zod";

/** Schema for a coupons row */
export const CouponsSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  discount_type: z.enum(["percentage", "fixed_amount"]),
  discount_value: z.number(),
  currency: z.string().nullable(),
  duration: z.enum(["once", "repeating", "forever"]),
  duration_months: z.number().int().nullable(),
  max_redemptions: z.number().int().nullable(),
  times_redeemed: z.number().int(),
  valid_from: z.string(),
  valid_until: z.string().nullable(),
  is_active: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Coupons = z.infer<typeof CouponsSchema>;

/** Schema for inserting a coupons row */
export const CouponsInsertSchema = z.object({
  code: z.string(),
  name: z.string(),
  discount_type: z.enum(["percentage", "fixed_amount"]),
  discount_value: z.number(),
  currency: z.string().nullable().optional(),
  duration: z.enum(["once", "repeating", "forever"]),
  duration_months: z.number().int().nullable().optional(),
  max_redemptions: z.number().int().nullable().optional(),
  times_redeemed: z.number().int().optional(),
  valid_from: z.string(),
  valid_until: z.string().nullable().optional(),
  is_active: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type CouponsInsert = z.infer<typeof CouponsInsertSchema>;

/** Schema for updating a coupons row */
export const CouponsUpdateSchema = CouponsInsertSchema.partial();

export type CouponsUpdate = z.infer<typeof CouponsUpdateSchema>;