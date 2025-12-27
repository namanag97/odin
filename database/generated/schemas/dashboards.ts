/**
 * Zod schemas for dashboards table
 * Source: 07_analytics.sql
 */

import { z } from "zod";

/** Schema for a dashboards row */
export const DashboardsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  layout: z.string(),
  widgets: z.string(),
  filters: z.array(z.unknown()).nullable(),
  refresh_interval_seconds: z.number().int().nullable(),
  is_public: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Dashboards = z.infer<typeof DashboardsSchema>;

/** Schema for inserting a dashboards row */
export const DashboardsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  layout: z.string(),
  widgets: z.string(),
  filters: z.array(z.unknown()).nullable().optional(),
  refresh_interval_seconds: z.number().int().nullable().optional(),
  is_public: z.number().int().nullable().optional(),
});

export type DashboardsInsert = z.infer<typeof DashboardsInsertSchema>;

/** Schema for updating a dashboards row */
export const DashboardsUpdateSchema = DashboardsInsertSchema.partial();

export type DashboardsUpdate = z.infer<typeof DashboardsUpdateSchema>;