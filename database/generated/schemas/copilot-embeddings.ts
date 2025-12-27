/**
 * Zod schemas for copilot_embeddings table
 * Source: 13_copilot.sql
 */

import { z } from "zod";

/** Schema for a copilot_embeddings row */
export const CopilotEmbeddingsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  source_type: z.enum(["activity", "kpi", "variant", "resource", "documentation", "discovered_model", "conformance_result", "bottleneck"]),
  source_id: z.string().uuid(),
  content: z.string(),
  chunk_index: z.number().int().nullable(),
  embedding: z.string().nullable(),
  embedding_model: z.string().nullable(),
  embedding_dimensions: z.number().int().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type CopilotEmbeddings = z.infer<typeof CopilotEmbeddingsSchema>;

/** Schema for inserting a copilot_embeddings row */
export const CopilotEmbeddingsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  source_type: z.enum(["activity", "kpi", "variant", "resource", "documentation", "discovered_model", "conformance_result", "bottleneck"]),
  source_id: z.string().uuid(),
  content: z.string(),
  chunk_index: z.number().int().nullable().optional(),
  embedding: z.string().nullable().optional(),
  embedding_model: z.string().nullable().optional(),
  embedding_dimensions: z.number().int().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type CopilotEmbeddingsInsert = z.infer<typeof CopilotEmbeddingsInsertSchema>;

/** Schema for updating a copilot_embeddings row */
export const CopilotEmbeddingsUpdateSchema = CopilotEmbeddingsInsertSchema.partial();

export type CopilotEmbeddingsUpdate = z.infer<typeof CopilotEmbeddingsUpdateSchema>;