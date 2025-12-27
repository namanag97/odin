/**
 * Zod schemas for conformance_results table
 * Source: 06_conformance.sql
 */

import { z } from "zod";

/** Schema for a conformance_results row */
export const ConformanceResultsSchema = z.object({
  id: z.string().uuid(),
  conformance_job_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  computed_at: z.string().datetime({ offset: true }).or(z.string()),
  cases_checked: z.number().int(),
  conforming_cases: z.number().int(),
  non_conforming_cases: z.number().int(),
  fitness: z.number().nullable(),
  precision: z.number().nullable(),
  generalization: z.number().nullable(),
  computation_time_ms: z.number().int().nullable(),
  detailed_metrics: z.record(z.string(), z.unknown()).nullable(),
});

export type ConformanceResults = z.infer<typeof ConformanceResultsSchema>;

/** Schema for inserting a conformance_results row */
export const ConformanceResultsInsertSchema = z.object({
  conformance_job_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  computed_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  cases_checked: z.number().int(),
  conforming_cases: z.number().int(),
  non_conforming_cases: z.number().int(),
  fitness: z.number().nullable().optional(),
  precision: z.number().nullable().optional(),
  generalization: z.number().nullable().optional(),
  computation_time_ms: z.number().int().nullable().optional(),
  detailed_metrics: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ConformanceResultsInsert = z.infer<typeof ConformanceResultsInsertSchema>;

/** Schema for updating a conformance_results row */
export const ConformanceResultsUpdateSchema = ConformanceResultsInsertSchema.partial();

export type ConformanceResultsUpdate = z.infer<typeof ConformanceResultsUpdateSchema>;