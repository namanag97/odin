/**
 * Zod schemas for variables table
 * Source: 16_semantic.sql
 */

import { z } from "zod";

/** Schema for a variables row */
export const VariablesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  scope_type: z.enum(["knowledge_model", "view", "package"]),
  scope_id: z.string().uuid(),
  key: z.string(),
  display_name: z.string().nullable(),
  description: z.string().nullable(),
  data_type: z.enum(["string", "number", "date", "boolean", "array", "object"]),
  default_value: z.string().nullable(),
  current_value: z.string().nullable(),
  validation_pql: z.string().nullable(),
  is_required: z.number().int(),
  is_user_editable: z.number().int(),
  ui_component: z.enum(["input_box", "dropdown", "date_picker", "checkbox", "slider"]).nullable(),
  options_pql: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Variables = z.infer<typeof VariablesSchema>;

/** Schema for inserting a variables row */
export const VariablesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  scope_type: z.enum(["knowledge_model", "view", "package"]),
  scope_id: z.string().uuid(),
  key: z.string(),
  display_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  data_type: z.enum(["string", "number", "date", "boolean", "array", "object"]),
  default_value: z.string().nullable().optional(),
  current_value: z.string().nullable().optional(),
  validation_pql: z.string().nullable().optional(),
  is_required: z.number().int().optional(),
  is_user_editable: z.number().int().optional(),
  ui_component: z.enum(["input_box", "dropdown", "date_picker", "checkbox", "slider"]).nullable().optional(),
  options_pql: z.string().nullable().optional(),
});

export type VariablesInsert = z.infer<typeof VariablesInsertSchema>;

/** Schema for updating a variables row */
export const VariablesUpdateSchema = VariablesInsertSchema.partial();

export type VariablesUpdate = z.infer<typeof VariablesUpdateSchema>;