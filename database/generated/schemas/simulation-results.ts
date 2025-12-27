/**
 * Zod schemas for simulation_results table
 * Source: 09_simulation.sql
 */

import { z } from "zod";

/** Schema for a simulation_results row */
export const SimulationResultsSchema = z.object({
  id: z.string().uuid(),
  simulation_run_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  replication_number: z.number().int().nullable(),
  summary_statistics: z.string(),
  activity_statistics: z.string(),
  resource_statistics: z.string(),
  queue_statistics: z.record(z.string(), z.unknown()).nullable(),
  cost_analysis: z.record(z.string(), z.unknown()).nullable(),
  raw_output_path: z.string().nullable(),
});

export type SimulationResults = z.infer<typeof SimulationResultsSchema>;

/** Schema for inserting a simulation_results row */
export const SimulationResultsInsertSchema = z.object({
  simulation_run_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  replication_number: z.number().int().nullable().optional(),
  summary_statistics: z.string(),
  activity_statistics: z.string(),
  resource_statistics: z.string(),
  queue_statistics: z.record(z.string(), z.unknown()).nullable().optional(),
  cost_analysis: z.record(z.string(), z.unknown()).nullable().optional(),
  raw_output_path: z.string().nullable().optional(),
});

export type SimulationResultsInsert = z.infer<typeof SimulationResultsInsertSchema>;

/** Schema for updating a simulation_results row */
export const SimulationResultsUpdateSchema = SimulationResultsInsertSchema.partial();

export type SimulationResultsUpdate = z.infer<typeof SimulationResultsUpdateSchema>;