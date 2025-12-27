/**
 * Zod schemas for event_logs table
 * Source: 02_case_centric.sql
 */

import { z } from "zod";

/** Schema for a event_logs row */
export const EventLogsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  case_notion: z.string(),
  activity_key: z.string().nullable(),
  timestamp_key: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  resource_key: z.string().nullable(),
  case_attributes: z.array(z.unknown()).nullable(),
  event_attributes: z.array(z.unknown()).nullable(),
  classifiers: z.record(z.string(), z.unknown()).nullable(),
  extensions: z.record(z.string(), z.unknown()).nullable(),
  global_attributes: z.record(z.string(), z.unknown()).nullable(),
  statistics: z.record(z.string(), z.unknown()).nullable(),
  source_file_path: z.string().nullable(),
  source_file_format: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type EventLogs = z.infer<typeof EventLogsSchema>;

/** Schema for inserting a event_logs row */
export const EventLogsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  case_notion: z.string(),
  activity_key: z.string().nullable().optional(),
  timestamp_key: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  resource_key: z.string().nullable().optional(),
  case_attributes: z.array(z.unknown()).nullable().optional(),
  event_attributes: z.array(z.unknown()).nullable().optional(),
  classifiers: z.record(z.string(), z.unknown()).nullable().optional(),
  extensions: z.record(z.string(), z.unknown()).nullable().optional(),
  global_attributes: z.record(z.string(), z.unknown()).nullable().optional(),
  statistics: z.record(z.string(), z.unknown()).nullable().optional(),
  source_file_path: z.string().nullable().optional(),
  source_file_format: z.string().nullable().optional(),
});

export type EventLogsInsert = z.infer<typeof EventLogsInsertSchema>;

/** Schema for updating a event_logs row */
export const EventLogsUpdateSchema = EventLogsInsertSchema.partial();

export type EventLogsUpdate = z.infer<typeof EventLogsUpdateSchema>;