/**
 * Zod schemas for view_tabs table
 * Source: 17_studio.sql
 */

import { z } from "zod";

/** Schema for a view_tabs row */
export const ViewTabsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  view_id: z.string().uuid(),
  key: z.string(),
  title: z.string(),
  icon: z.string().nullable(),
  is_default: z.number().int(),
  sort_order: z.number().int(),
  visibility_expression: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ViewTabs = z.infer<typeof ViewTabsSchema>;

/** Schema for inserting a view_tabs row */
export const ViewTabsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  view_id: z.string().uuid(),
  key: z.string(),
  title: z.string(),
  icon: z.string().nullable().optional(),
  is_default: z.number().int().optional(),
  sort_order: z.number().int(),
  visibility_expression: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ViewTabsInsert = z.infer<typeof ViewTabsInsertSchema>;

/** Schema for updating a view_tabs row */
export const ViewTabsUpdateSchema = ViewTabsInsertSchema.partial();

export type ViewTabsUpdate = z.infer<typeof ViewTabsUpdateSchema>;