/**
 * Zod schemas for simulation_models table
 * Source: 09_simulation.sql
 */

import { z } from "zod";

/** Schema for a simulation_models row */
export const SimulationModelsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  discovered_model_id: z.string().uuid().nullable(),
  event_log_id: z.string().uuid().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  simulation_type: z.enum(["discrete_event", "monte_carlo", "agent_based"]),
  base_configuration: z.record(z.string(), z.unknown()),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type SimulationModels = z.infer<typeof SimulationModelsSchema>;

/** Schema for inserting a simulation_models row */
export const SimulationModelsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  discovered_model_id: z.string().uuid().nullable().optional(),
  event_log_id: z.string().uuid().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  simulation_type: z.enum(["discrete_event", "monte_carlo", "agent_based"]),
  base_configuration: z.record(z.string(), z.unknown()),
});

export type SimulationModelsInsert = z.infer<typeof SimulationModelsInsertSchema>;

/** Schema for updating a simulation_models row */
export const SimulationModelsUpdateSchema = SimulationModelsInsertSchema.partial();

export type SimulationModelsUpdate = z.infer<typeof SimulationModelsUpdateSchema>;