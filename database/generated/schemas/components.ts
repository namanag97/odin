/**
 * Zod schemas for components table
 * Source: 17_studio.sql
 */

import { z } from "zod";

/** Schema for a components row */
export const ComponentsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  view_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable(),
  component_type: z.enum(["chart", "table", "kpi_list", "process_explorer", "variant_explorer", "text", "button", "input", "filter_bar", "tab", "container", "action_button", "image", "custom"]),
  key: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  layout_position: z.string(),
  data_config: z.record(z.string(), z.unknown()).nullable(),
  visual_config: z.record(z.string(), z.unknown()).nullable(),
  interaction_config: z.record(z.string(), z.unknown()).nullable(),
  is_visible: z.number().int(),
  visibility_expression: z.string().nullable(),
  sort_order: z.number().int().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Components = z.infer<typeof ComponentsSchema>;

/** Schema for inserting a components row */
export const ComponentsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  view_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable().optional(),
  component_type: z.enum(["chart", "table", "kpi_list", "process_explorer", "variant_explorer", "text", "button", "input", "filter_bar", "tab", "container", "action_button", "image", "custom"]),
  key: z.string(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  layout_position: z.string(),
  data_config: z.record(z.string(), z.unknown()).nullable().optional(),
  visual_config: z.record(z.string(), z.unknown()).nullable().optional(),
  interaction_config: z.record(z.string(), z.unknown()).nullable().optional(),
  is_visible: z.number().int().optional(),
  visibility_expression: z.string().nullable().optional(),
  sort_order: z.number().int().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ComponentsInsert = z.infer<typeof ComponentsInsertSchema>;

/** Schema for updating a components row */
export const ComponentsUpdateSchema = ComponentsInsertSchema.partial();

export type ComponentsUpdate = z.infer<typeof ComponentsUpdateSchema>;