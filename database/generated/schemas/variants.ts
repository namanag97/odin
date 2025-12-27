/**
 * Zod schemas for variants table
 * Source: 02_case_centric.sql
 */

import { z } from "zod";

/** Schema for a variants row */
export const VariantsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid(),
  sequence: z.string(),
  sequence_hash: z.string(),
  case_count: z.number().int().nullable(),
  percentage: z.number().nullable(),
  avg_duration_seconds: z.number().int().nullable(),
  min_duration_seconds: z.number().int().nullable(),
  max_duration_seconds: z.number().int().nullable(),
  is_happy_path: z.number().int().nullable(),
  first_seen_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  last_seen_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Variants = z.infer<typeof VariantsSchema>;

/** Schema for inserting a variants row */
export const VariantsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid(),
  sequence: z.string(),
  sequence_hash: z.string(),
  case_count: z.number().int().nullable().optional(),
  percentage: z.number().nullable().optional(),
  avg_duration_seconds: z.number().int().nullable().optional(),
  min_duration_seconds: z.number().int().nullable().optional(),
  max_duration_seconds: z.number().int().nullable().optional(),
  is_happy_path: z.number().int().nullable().optional(),
  first_seen_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  last_seen_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type VariantsInsert = z.infer<typeof VariantsInsertSchema>;

/** Schema for updating a variants row */
export const VariantsUpdateSchema = VariantsInsertSchema.partial();

export type VariantsUpdate = z.infer<typeof VariantsUpdateSchema>;