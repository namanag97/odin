/**
 * Zod schemas for simulation_parameters table
 * Source: 09_simulation.sql
 */

import { z } from "zod";

/** Schema for a simulation_parameters row */
export const SimulationParametersSchema = z.object({
  id: z.string().uuid(),
  simulation_model_id: z.string().uuid(),
  element_type: z.enum(["activity", "gateway", "resource"]),
  element_name: z.string(),
  parameter_name: z.string(),
  distribution: z.string(),
  distribution_params: z.string(),
  source: z.enum(["mined", "manual", "estimated"]).nullable(),
});

export type SimulationParameters = z.infer<typeof SimulationParametersSchema>;

/** Schema for inserting a simulation_parameters row */
export const SimulationParametersInsertSchema = z.object({
  simulation_model_id: z.string().uuid(),
  element_type: z.enum(["activity", "gateway", "resource"]),
  element_name: z.string(),
  parameter_name: z.string(),
  distribution: z.string(),
  distribution_params: z.string(),
  source: z.enum(["mined", "manual", "estimated"]).nullable().optional(),
});

export type SimulationParametersInsert = z.infer<typeof SimulationParametersInsertSchema>;

/** Schema for updating a simulation_parameters row */
export const SimulationParametersUpdateSchema = SimulationParametersInsertSchema.partial();

export type SimulationParametersUpdate = z.infer<typeof SimulationParametersUpdateSchema>;