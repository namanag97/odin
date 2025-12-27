/**
 * Zod schemas for plan_limits table
 * Source: 22_commercial_layer.sql
 */

import { z } from "zod";

/** Schema for a plan_limits row */
export const PlanLimitsSchema = z.object({
  id: z.string().uuid(),
  plan_id: z.string().uuid(),
  resource_type: z.string(),
  limit_value: z.number().int(),
  limit_type: z.enum(["hard", "soft", "metered"]),
  reset_interval: z.enum(["never", "daily", "weekly", "monthly", "billing_cycle"]),
  overage_allowed: z.number().int(),
  overage_price: z.number().nullable(),
});

export type PlanLimits = z.infer<typeof PlanLimitsSchema>;

/** Schema for inserting a plan_limits row */
export const PlanLimitsInsertSchema = z.object({
  plan_id: z.string().uuid(),
  resource_type: z.string(),
  limit_value: z.number().int(),
  limit_type: z.enum(["hard", "soft", "metered"]),
  reset_interval: z.enum(["never", "daily", "weekly", "monthly", "billing_cycle"]).optional(),
  overage_allowed: z.number().int().optional(),
  overage_price: z.number().nullable().optional(),
});

export type PlanLimitsInsert = z.infer<typeof PlanLimitsInsertSchema>;

/** Schema for updating a plan_limits row */
export const PlanLimitsUpdateSchema = PlanLimitsInsertSchema.partial();

export type PlanLimitsUpdate = z.infer<typeof PlanLimitsUpdateSchema>;