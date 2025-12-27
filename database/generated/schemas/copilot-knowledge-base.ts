/**
 * Zod schemas for copilot_knowledge_base table
 * Source: 13_copilot.sql
 */

import { z } from "zod";

/** Schema for a copilot_knowledge_base row */
export const CopilotKnowledgeBaseSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  title: z.string(),
  category: z.string().nullable(),
  content: z.string(),
  content_type: z.enum(["markdown", "text", "html"]).nullable(),
  version: z.number().int().nullable(),
  is_active: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type CopilotKnowledgeBase = z.infer<typeof CopilotKnowledgeBaseSchema>;

/** Schema for inserting a copilot_knowledge_base row */
export const CopilotKnowledgeBaseInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  title: z.string(),
  category: z.string().nullable().optional(),
  content: z.string(),
  content_type: z.enum(["markdown", "text", "html"]).nullable().optional(),
  version: z.number().int().nullable().optional(),
  is_active: z.number().int().nullable().optional(),
});

export type CopilotKnowledgeBaseInsert = z.infer<typeof CopilotKnowledgeBaseInsertSchema>;

/** Schema for updating a copilot_knowledge_base row */
export const CopilotKnowledgeBaseUpdateSchema = CopilotKnowledgeBaseInsertSchema.partial();

export type CopilotKnowledgeBaseUpdate = z.infer<typeof CopilotKnowledgeBaseUpdateSchema>;