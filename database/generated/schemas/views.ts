/**
 * Zod schemas for views table
 * Source: 17_studio.sql
 */

import { z } from "zod";

/** Schema for a views row */
export const ViewsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  package_id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  knowledge_model_id: z.string().uuid(),
  base_view_id: z.string().uuid().nullable(),
  view_type: z.enum(["standard", "profile", "extension"]),
  layout_mode: z.enum(["scale_to_fit", "custom_height"]),
  layout_config: z.record(z.string(), z.unknown()).nullable(),
  icon: z.string().nullable(),
  thumbnail_url: z.string().nullable(),
  is_home: z.number().int(),
  is_published_to_apps: z.number().int(),
  sort_order: z.number().int().nullable(),
  status: z.enum(["draft", "published"]),
  version: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_by: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Views = z.infer<typeof ViewsSchema>;

/** Schema for inserting a views row */
export const ViewsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  package_id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  knowledge_model_id: z.string().uuid(),
  base_view_id: z.string().uuid().nullable().optional(),
  view_type: z.enum(["standard", "profile", "extension"]).optional(),
  layout_mode: z.enum(["scale_to_fit", "custom_height"]).optional(),
  layout_config: z.record(z.string(), z.unknown()).nullable().optional(),
  icon: z.string().nullable().optional(),
  thumbnail_url: z.string().nullable().optional(),
  is_home: z.number().int().optional(),
  is_published_to_apps: z.number().int().optional(),
  sort_order: z.number().int().nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
  version: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  created_by: z.string().nullable().optional(),
});

export type ViewsInsert = z.infer<typeof ViewsInsertSchema>;

/** Schema for updating a views row */
export const ViewsUpdateSchema = ViewsInsertSchema.partial();

export type ViewsUpdate = z.infer<typeof ViewsUpdateSchema>;