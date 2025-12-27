/**
 * Zod schemas for petri_net_transitions table
 * Source: 05_discovery.sql
 */

import { z } from "zod";

/** Schema for a petri_net_transitions row */
export const PetriNetTransitionsSchema = z.object({
  id: z.string().uuid(),
  petri_net_id: z.string().uuid(),
  name: z.string(),
  label: z.string().nullable(),
  is_silent: z.number().int().nullable(),
  activity_id: z.string().uuid().nullable(),
  position_x: z.number().nullable(),
  position_y: z.number().nullable(),
  frequency: z.number().int().nullable(),
});

export type PetriNetTransitions = z.infer<typeof PetriNetTransitionsSchema>;

/** Schema for inserting a petri_net_transitions row */
export const PetriNetTransitionsInsertSchema = z.object({
  petri_net_id: z.string().uuid(),
  name: z.string(),
  label: z.string().nullable().optional(),
  is_silent: z.number().int().nullable().optional(),
  activity_id: z.string().uuid().nullable().optional(),
  position_x: z.number().nullable().optional(),
  position_y: z.number().nullable().optional(),
  frequency: z.number().int().nullable().optional(),
});

export type PetriNetTransitionsInsert = z.infer<typeof PetriNetTransitionsInsertSchema>;

/** Schema for updating a petri_net_transitions row */
export const PetriNetTransitionsUpdateSchema = PetriNetTransitionsInsertSchema.partial();

export type PetriNetTransitionsUpdate = z.infer<typeof PetriNetTransitionsUpdateSchema>;