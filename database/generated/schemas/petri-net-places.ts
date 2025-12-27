/**
 * Zod schemas for petri_net_places table
 * Source: 05_discovery.sql
 */

import { z } from "zod";

/** Schema for a petri_net_places row */
export const PetriNetPlacesSchema = z.object({
  id: z.string().uuid(),
  petri_net_id: z.string().uuid(),
  name: z.string(),
  label: z.string().nullable(),
  is_initial: z.number().int().nullable(),
  is_final: z.number().int().nullable(),
  position_x: z.number().nullable(),
  position_y: z.number().nullable(),
});

export type PetriNetPlaces = z.infer<typeof PetriNetPlacesSchema>;

/** Schema for inserting a petri_net_places row */
export const PetriNetPlacesInsertSchema = z.object({
  petri_net_id: z.string().uuid(),
  name: z.string(),
  label: z.string().nullable().optional(),
  is_initial: z.number().int().nullable().optional(),
  is_final: z.number().int().nullable().optional(),
  position_x: z.number().nullable().optional(),
  position_y: z.number().nullable().optional(),
});

export type PetriNetPlacesInsert = z.infer<typeof PetriNetPlacesInsertSchema>;

/** Schema for updating a petri_net_places row */
export const PetriNetPlacesUpdateSchema = PetriNetPlacesInsertSchema.partial();

export type PetriNetPlacesUpdate = z.infer<typeof PetriNetPlacesUpdateSchema>;