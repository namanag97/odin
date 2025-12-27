/**
 * Zod schemas for petri_nets table
 * Source: 05_discovery.sql
 */

import { z } from "zod";

/** Schema for a petri_nets row */
export const PetriNetsSchema = z.object({
  id: z.string().uuid(),
  discovered_model_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().nullable(),
  initial_marking: z.string(),
  final_marking: z.string(),
  properties: z.record(z.string(), z.unknown()).nullable(),
});

export type PetriNets = z.infer<typeof PetriNetsSchema>;

/** Schema for inserting a petri_nets row */
export const PetriNetsInsertSchema = z.object({
  discovered_model_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().nullable().optional(),
  initial_marking: z.string(),
  final_marking: z.string(),
  properties: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type PetriNetsInsert = z.infer<typeof PetriNetsInsertSchema>;

/** Schema for updating a petri_nets row */
export const PetriNetsUpdateSchema = PetriNetsInsertSchema.partial();

export type PetriNetsUpdate = z.infer<typeof PetriNetsUpdateSchema>;