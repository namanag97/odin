/**
 * Zod schemas for cases table
 * Source: 02_case_centric.sql
 */

import { z } from "zod";

/** Schema for a cases row */
export const CasesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid(),
  case_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable(),
  start_time: z.string(),
  end_time: z.string().nullable(),
  duration_seconds: z.number().int().nullable(),
  event_count: z.number().int().nullable(),
  status: z.enum(["open", "completed", "cancelled"]).nullable(),
  attributes: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Cases = z.infer<typeof CasesSchema>;

/** Schema for inserting a cases row */
export const CasesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid(),
  case_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  start_time: z.string(),
  end_time: z.string().nullable().optional(),
  duration_seconds: z.number().int().nullable().optional(),
  event_count: z.number().int().nullable().optional(),
  status: z.enum(["open", "completed", "cancelled"]).nullable().optional(),
  attributes: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type CasesInsert = z.infer<typeof CasesInsertSchema>;

/** Schema for updating a cases row */
export const CasesUpdateSchema = CasesInsertSchema.partial();

export type CasesUpdate = z.infer<typeof CasesUpdateSchema>;