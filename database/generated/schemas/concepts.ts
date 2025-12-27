/**
 * Zod schemas for concepts table
 * Source: 04_ontology.sql
 */

import { z } from "zod";

/** Schema for a concepts row */
export const ConceptsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  ontology_id: z.string().uuid().nullable(),
  iri: z.string(),
  local_name: z.string(),
  label: z.string().nullable(),
  definition: z.string().nullable(),
  concept_type: z.enum(["class", "property", "individual"]),
  parent_concept_id: z.string().uuid().nullable(),
  domain_concept_id: z.string().uuid().nullable(),
  range_concept_id: z.string().uuid().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Concepts = z.infer<typeof ConceptsSchema>;

/** Schema for inserting a concepts row */
export const ConceptsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  ontology_id: z.string().uuid().nullable().optional(),
  iri: z.string(),
  local_name: z.string(),
  label: z.string().nullable().optional(),
  definition: z.string().nullable().optional(),
  concept_type: z.enum(["class", "property", "individual"]),
  parent_concept_id: z.string().uuid().nullable().optional(),
  domain_concept_id: z.string().uuid().nullable().optional(),
  range_concept_id: z.string().uuid().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ConceptsInsert = z.infer<typeof ConceptsInsertSchema>;

/** Schema for updating a concepts row */
export const ConceptsUpdateSchema = ConceptsInsertSchema.partial();

export type ConceptsUpdate = z.infer<typeof ConceptsUpdateSchema>;