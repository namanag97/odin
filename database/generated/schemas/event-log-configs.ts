/**
 * Zod schemas for event_log_configs table
 * Source: 16_semantic.sql
 */

import { z } from "zod";

/** Schema for a event_log_configs row */
export const EventLogConfigsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  knowledge_model_id: z.string().uuid(),
  key: z.string(),
  display_name: z.string().nullable(),
  description: z.string().nullable(),
  activity_table: z.string(),
  case_id_column: z.string(),
  activity_column: z.string(),
  timestamp_column: z.string().datetime({ offset: true }).or(z.string()),
  sorting_column: z.string().nullable(),
  resource_column: z.string().nullable(),
  cost_column: z.string().nullable(),
  included_activities: z.array(z.unknown()).nullable(),
  excluded_activities: z.array(z.unknown()).nullable(),
  filter_expression: z.string().nullable(),
  is_default: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type EventLogConfigs = z.infer<typeof EventLogConfigsSchema>;

/** Schema for inserting a event_log_configs row */
export const EventLogConfigsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  knowledge_model_id: z.string().uuid(),
  key: z.string(),
  display_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  activity_table: z.string(),
  case_id_column: z.string(),
  activity_column: z.string(),
  timestamp_column: z.string().datetime({ offset: true }).or(z.string()),
  sorting_column: z.string().nullable().optional(),
  resource_column: z.string().nullable().optional(),
  cost_column: z.string().nullable().optional(),
  included_activities: z.array(z.unknown()).nullable().optional(),
  excluded_activities: z.array(z.unknown()).nullable().optional(),
  filter_expression: z.string().nullable().optional(),
  is_default: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type EventLogConfigsInsert = z.infer<typeof EventLogConfigsInsertSchema>;

/** Schema for updating a event_log_configs row */
export const EventLogConfigsUpdateSchema = EventLogConfigsInsertSchema.partial();

export type EventLogConfigsUpdate = z.infer<typeof EventLogConfigsUpdateSchema>;