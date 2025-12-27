/**
 * Zod schemas for annotations table
 * Source: 04_ontology.sql
 */

import { z } from "zod";

/** Schema for a annotations row */
export const AnnotationsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  concept_id: z.string().uuid(),
  entity_type: z.string(),
  entity_id: z.string().uuid(),
  confidence: z.number().nullable(),
  annotation_type: z.enum(["manual", "automatic", "inferred"]).nullable(),
  reasoning_chain: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Annotations = z.infer<typeof AnnotationsSchema>;

/** Schema for inserting a annotations row */
export const AnnotationsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  concept_id: z.string().uuid(),
  entity_type: z.string(),
  entity_id: z.string().uuid(),
  confidence: z.number().nullable().optional(),
  annotation_type: z.enum(["manual", "automatic", "inferred"]).nullable().optional(),
  reasoning_chain: z.string().nullable().optional(),
});

export type AnnotationsInsert = z.infer<typeof AnnotationsInsertSchema>;

/** Schema for updating a annotations row */
export const AnnotationsUpdateSchema = AnnotationsInsertSchema.partial();

export type AnnotationsUpdate = z.infer<typeof AnnotationsUpdateSchema>;