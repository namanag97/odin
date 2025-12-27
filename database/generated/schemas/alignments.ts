/**
 * Zod schemas for alignments table
 * Source: 06_conformance.sql
 */

import { z } from "zod";

/** Schema for a alignments row */
export const AlignmentsSchema = z.object({
  id: z.string().uuid(),
  conformance_result_id: z.string().uuid(),
  case_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  alignment_cost: z.number(),
  fitness_value: z.number(),
  alignment_sequence: z.string(),
  trace_length: z.number().int().nullable(),
  model_length: z.number().int().nullable(),
  computation_time_ms: z.number().int().nullable(),
});

export type Alignments = z.infer<typeof AlignmentsSchema>;

/** Schema for inserting a alignments row */
export const AlignmentsInsertSchema = z.object({
  conformance_result_id: z.string().uuid(),
  case_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  alignment_cost: z.number(),
  fitness_value: z.number(),
  alignment_sequence: z.string(),
  trace_length: z.number().int().nullable().optional(),
  model_length: z.number().int().nullable().optional(),
  computation_time_ms: z.number().int().nullable().optional(),
});

export type AlignmentsInsert = z.infer<typeof AlignmentsInsertSchema>;

/** Schema for updating a alignments row */
export const AlignmentsUpdateSchema = AlignmentsInsertSchema.partial();

export type AlignmentsUpdate = z.infer<typeof AlignmentsUpdateSchema>;