/**
 * Zod schemas for ontologies table
 * Source: 04_ontology.sql
 */

import { z } from "zod";

/** Schema for a ontologies row */
export const OntologiesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  version: z.string(),
  iri: z.string(),
  description: z.string().nullable(),
  format: z.enum(["owl/xml", "turtle", "rdf/xml", "jsonld"]).nullable(),
  content: z.string(),
  imported_iris: z.array(z.unknown()).nullable(),
  statistics: z.record(z.string(), z.unknown()).nullable(),
  is_active: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Ontologies = z.infer<typeof OntologiesSchema>;

/** Schema for inserting a ontologies row */
export const OntologiesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  version: z.string(),
  iri: z.string(),
  description: z.string().nullable().optional(),
  format: z.enum(["owl/xml", "turtle", "rdf/xml", "jsonld"]).nullable().optional(),
  content: z.string(),
  imported_iris: z.array(z.unknown()).nullable().optional(),
  statistics: z.record(z.string(), z.unknown()).nullable().optional(),
  is_active: z.number().int().nullable().optional(),
});

export type OntologiesInsert = z.infer<typeof OntologiesInsertSchema>;

/** Schema for updating a ontologies row */
export const OntologiesUpdateSchema = OntologiesInsertSchema.partial();

export type OntologiesUpdate = z.infer<typeof OntologiesUpdateSchema>;