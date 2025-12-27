/**
 * Zod schemas for deviations table
 * Source: 06_conformance.sql
 */

import { z } from "zod";

/** Schema for a deviations row */
export const DeviationsSchema = z.object({
  id: z.string().uuid(),
  conformance_result_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  case_id: z.string().uuid().nullable(),
  event_id: z.string().uuid().nullable(),
  deviation_type: z.enum(["missing", "unexpected", "wrong_order"]),
  expected_activity: z.string().nullable(),
  actual_activity: z.string().nullable(),
  position_in_trace: z.number().int().nullable(),
  severity: z.enum(["low", "medium", "high", "critical"]).nullable(),
  cost: z.number().nullable(),
  details: z.record(z.string(), z.unknown()).nullable(),
  detected_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Deviations = z.infer<typeof DeviationsSchema>;

/** Schema for inserting a deviations row */
export const DeviationsInsertSchema = z.object({
  conformance_result_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  case_id: z.string().uuid().nullable().optional(),
  event_id: z.string().uuid().nullable().optional(),
  deviation_type: z.enum(["missing", "unexpected", "wrong_order"]),
  expected_activity: z.string().nullable().optional(),
  actual_activity: z.string().nullable().optional(),
  position_in_trace: z.number().int().nullable().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).nullable().optional(),
  cost: z.number().nullable().optional(),
  details: z.record(z.string(), z.unknown()).nullable().optional(),
  detected_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
});

export type DeviationsInsert = z.infer<typeof DeviationsInsertSchema>;

/** Schema for updating a deviations row */
export const DeviationsUpdateSchema = DeviationsInsertSchema.partial();

export type DeviationsUpdate = z.infer<typeof DeviationsUpdateSchema>;