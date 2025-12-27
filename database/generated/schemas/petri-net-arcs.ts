/**
 * Zod schemas for petri_net_arcs table
 * Source: 05_discovery.sql
 */

import { z } from "zod";

/** Schema for a petri_net_arcs row */
export const PetriNetArcsSchema = z.object({
  id: z.string().uuid(),
  petri_net_id: z.string().uuid(),
  source_place_id: z.string().uuid().nullable(),
  source_transition_id: z.string().uuid().nullable(),
  target_place_id: z.string().uuid().nullable(),
  target_transition_id: z.string().uuid().nullable(),
  weight: z.number().int().nullable(),
});

export type PetriNetArcs = z.infer<typeof PetriNetArcsSchema>;

/** Schema for inserting a petri_net_arcs row */
export const PetriNetArcsInsertSchema = z.object({
  petri_net_id: z.string().uuid(),
  source_place_id: z.string().uuid().nullable().optional(),
  source_transition_id: z.string().uuid().nullable().optional(),
  target_place_id: z.string().uuid().nullable().optional(),
  target_transition_id: z.string().uuid().nullable().optional(),
  weight: z.number().int().nullable().optional(),
});

export type PetriNetArcsInsert = z.infer<typeof PetriNetArcsInsertSchema>;

/** Schema for updating a petri_net_arcs row */
export const PetriNetArcsUpdateSchema = PetriNetArcsInsertSchema.partial();

export type PetriNetArcsUpdate = z.infer<typeof PetriNetArcsUpdateSchema>;