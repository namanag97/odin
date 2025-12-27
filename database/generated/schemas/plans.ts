/**
 * Zod schemas for plans table
 * Source: 22_commercial_layer.sql
 */

import { z } from "zod";

/** Schema for a plans row */
export const PlansSchema = z.object({
  id: z.string().uuid(),
  external_id: z.string().uuid().nullable(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  tier: z.enum(["free", "starter", "professional", "enterprise", "custom"]),
  billing_interval: z.enum(["monthly", "quarterly", "annual", "custom"]),
  base_price: z.number(),
  currency: z.string(),
  is_public: z.number().int(),
  is_active: z.number().int(),
  trial_days: z.number().int(),
  features: z.record(z.string(), z.unknown()).nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Plans = z.infer<typeof PlansSchema>;

/** Schema for inserting a plans row */
export const PlansInsertSchema = z.object({
  external_id: z.string().uuid().nullable().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  tier: z.enum(["free", "starter", "professional", "enterprise", "custom"]),
  billing_interval: z.enum(["monthly", "quarterly", "annual", "custom"]),
  base_price: z.number().optional(),
  currency: z.string().optional(),
  is_public: z.number().int().optional(),
  is_active: z.number().int().optional(),
  trial_days: z.number().int().optional(),
  features: z.record(z.string(), z.unknown()).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type PlansInsert = z.infer<typeof PlansInsertSchema>;

/** Schema for updating a plans row */
export const PlansUpdateSchema = PlansInsertSchema.partial();

export type PlansUpdate = z.infer<typeof PlansUpdateSchema>;