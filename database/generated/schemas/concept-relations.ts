/**
 * Zod schemas for concept_relations table
 * Source: 04_ontology.sql
 */

import { z } from "zod";

/** Schema for a concept_relations row */
export const ConceptRelationsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  source_concept_id: z.string().uuid(),
  target_concept_id: z.string().uuid(),
  relation_type: z.string(),
  relation_iri: z.string().nullable(),
  cardinality: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
});

export type ConceptRelations = z.infer<typeof ConceptRelationsSchema>;

/** Schema for inserting a concept_relations row */
export const ConceptRelationsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  source_concept_id: z.string().uuid(),
  target_concept_id: z.string().uuid(),
  relation_type: z.string(),
  relation_iri: z.string().nullable().optional(),
  cardinality: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ConceptRelationsInsert = z.infer<typeof ConceptRelationsInsertSchema>;

/** Schema for updating a concept_relations row */
export const ConceptRelationsUpdateSchema = ConceptRelationsInsertSchema.partial();

export type ConceptRelationsUpdate = z.infer<typeof ConceptRelationsUpdateSchema>;