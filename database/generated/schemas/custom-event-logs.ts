/**
 * Zod schemas for custom_event_logs table
 * Source: 19_ocpm_extended.sql
 */

import { z } from "zod";

/** Schema for a custom_event_logs row */
export const CustomEventLogsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  perspective_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  lead_object_type_id: z.string().uuid(),
  included_event_types: z.array(z.unknown()).nullable(),
  flattening_strategy: z.enum(["simple", "object_propagation", "all_events"]),
  filter_expression: z.string().nullable(),
  is_materialized: z.number().int(),
  last_materialized_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  row_count: z.number().int().nullable(),
  created_by: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type CustomEventLogs = z.infer<typeof CustomEventLogsSchema>;

/** Schema for inserting a custom_event_logs row */
export const CustomEventLogsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  perspective_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  lead_object_type_id: z.string().uuid(),
  included_event_types: z.array(z.unknown()).nullable().optional(),
  flattening_strategy: z.enum(["simple", "object_propagation", "all_events"]).optional(),
  filter_expression: z.string().nullable().optional(),
  is_materialized: z.number().int().optional(),
  last_materialized_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  row_count: z.number().int().nullable().optional(),
  created_by: z.string().nullable().optional(),
});

export type CustomEventLogsInsert = z.infer<typeof CustomEventLogsInsertSchema>;

/** Schema for updating a custom_event_logs row */
export const CustomEventLogsUpdateSchema = CustomEventLogsInsertSchema.partial();

export type CustomEventLogsUpdate = z.infer<typeof CustomEventLogsUpdateSchema>;