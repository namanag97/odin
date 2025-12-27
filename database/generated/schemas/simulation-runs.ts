/**
 * Zod schemas for simulation_runs table
 * Source: 09_simulation.sql
 */

import { z } from "zod";

/** Schema for a simulation_runs row */
export const SimulationRunsSchema = z.object({
  id: z.string().uuid(),
  simulation_model_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().nullable(),
  scenario_config: z.record(z.string(), z.unknown()).nullable(),
  random_seed: z.number().int().nullable(),
  started_at: z.string().datetime({ offset: true }).or(z.string()),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  status: z.enum(["running", "completed", "failed", "cancelled"]),
  replications: z.number().int().nullable(),
  error_message: z.string().nullable(),
});

export type SimulationRuns = z.infer<typeof SimulationRunsSchema>;

/** Schema for inserting a simulation_runs row */
export const SimulationRunsInsertSchema = z.object({
  simulation_model_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().nullable().optional(),
  scenario_config: z.record(z.string(), z.unknown()).nullable().optional(),
  random_seed: z.number().int().nullable().optional(),
  started_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  status: z.enum(["running", "completed", "failed", "cancelled"]),
  replications: z.number().int().nullable().optional(),
  error_message: z.string().nullable().optional(),
});

export type SimulationRunsInsert = z.infer<typeof SimulationRunsInsertSchema>;

/** Schema for updating a simulation_runs row */
export const SimulationRunsUpdateSchema = SimulationRunsInsertSchema.partial();

export type SimulationRunsUpdate = z.infer<typeof SimulationRunsUpdateSchema>;