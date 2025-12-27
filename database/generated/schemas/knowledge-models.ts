/**
 * Zod schemas for knowledge_models table
 * Source: 16_semantic.sql
 */

import { z } from "zod";

/** Schema for a knowledge_models row */
export const KnowledgeModelsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  package_id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  data_model_id: z.string().uuid(),
  km_type: z.enum(["base", "extension"]),
  extends_km_id: z.string().uuid().nullable(),
  status: z.enum(["draft", "published"]),
  version: z.number().int(),
  yaml_content: z.string().nullable(),
  published_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  created_by: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type KnowledgeModels = z.infer<typeof KnowledgeModelsSchema>;

/** Schema for inserting a knowledge_models row */
export const KnowledgeModelsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  package_id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  data_model_id: z.string().uuid(),
  km_type: z.enum(["base", "extension"]).optional(),
  extends_km_id: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
  version: z.number().int().optional(),
  yaml_content: z.string().nullable().optional(),
  published_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  created_by: z.string().nullable().optional(),
});

export type KnowledgeModelsInsert = z.infer<typeof KnowledgeModelsInsertSchema>;

/** Schema for updating a knowledge_models row */
export const KnowledgeModelsUpdateSchema = KnowledgeModelsInsertSchema.partial();

export type KnowledgeModelsUpdate = z.infer<typeof KnowledgeModelsUpdateSchema>;