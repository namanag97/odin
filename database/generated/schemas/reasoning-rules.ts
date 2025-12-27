/**
 * Zod schemas for reasoning_rules table
 * Source: 04_ontology.sql
 */

import { z } from "zod";

/** Schema for a reasoning_rules row */
export const ReasoningRulesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  rule_body: z.string(),
  rule_head: z.string(),
  rule_format: z.enum(["swrl", "sparql_construct", "custom"]).nullable(),
  priority: z.number().int().nullable(),
  is_active: z.number().int().nullable(),
  last_executed_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  inferences_count: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ReasoningRules = z.infer<typeof ReasoningRulesSchema>;

/** Schema for inserting a reasoning_rules row */
export const ReasoningRulesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  rule_body: z.string(),
  rule_head: z.string(),
  rule_format: z.enum(["swrl", "sparql_construct", "custom"]).nullable().optional(),
  priority: z.number().int().nullable().optional(),
  is_active: z.number().int().nullable().optional(),
  last_executed_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  inferences_count: z.number().int().nullable().optional(),
});

export type ReasoningRulesInsert = z.infer<typeof ReasoningRulesInsertSchema>;

/** Schema for updating a reasoning_rules row */
export const ReasoningRulesUpdateSchema = ReasoningRulesInsertSchema.partial();

export type ReasoningRulesUpdate = z.infer<typeof ReasoningRulesUpdateSchema>;