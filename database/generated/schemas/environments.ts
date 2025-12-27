/**
 * Zod schemas for environments table
 * Source: 20_existence_layer.sql
 */

import { z } from "zod";

/** Schema for a environments row */
export const EnvironmentsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  type: z.enum(["production", "staging", "development", "sandbox"]),
  is_default: z.number().int(),
  config: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Environments = z.infer<typeof EnvironmentsSchema>;

/** Schema for inserting a environments row */
export const EnvironmentsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  type: z.enum(["production", "staging", "development", "sandbox"]),
  is_default: z.number().int().optional(),
  config: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type EnvironmentsInsert = z.infer<typeof EnvironmentsInsertSchema>;

/** Schema for updating a environments row */
export const EnvironmentsUpdateSchema = EnvironmentsInsertSchema.partial();

export type EnvironmentsUpdate = z.infer<typeof EnvironmentsUpdateSchema>;