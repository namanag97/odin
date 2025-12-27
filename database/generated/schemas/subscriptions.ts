/**
 * Zod schemas for subscriptions table
 * Source: 22_commercial_layer.sql
 */

import { z } from "zod";

/** Schema for a subscriptions row */
export const SubscriptionsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  external_id: z.string().uuid().nullable(),
  status: z.enum(["trialing", "active", "past_due", "canceled", "paused", "incomplete"]),
  quantity: z.number().int(),
  billing_anchor_day: z.number().int().nullable(),
  current_period_start: z.string(),
  current_period_end: z.string(),
  trial_start: z.string().nullable(),
  trial_end: z.string().nullable(),
  canceled_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  cancel_at_period_end: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Subscriptions = z.infer<typeof SubscriptionsSchema>;

/** Schema for inserting a subscriptions row */
export const SubscriptionsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  external_id: z.string().uuid().nullable().optional(),
  status: z.enum(["trialing", "active", "past_due", "canceled", "paused", "incomplete"]).optional(),
  quantity: z.number().int().optional(),
  billing_anchor_day: z.number().int().nullable().optional(),
  current_period_start: z.string(),
  current_period_end: z.string(),
  trial_start: z.string().nullable().optional(),
  trial_end: z.string().nullable().optional(),
  canceled_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  cancel_at_period_end: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type SubscriptionsInsert = z.infer<typeof SubscriptionsInsertSchema>;

/** Schema for updating a subscriptions row */
export const SubscriptionsUpdateSchema = SubscriptionsInsertSchema.partial();

export type SubscriptionsUpdate = z.infer<typeof SubscriptionsUpdateSchema>;