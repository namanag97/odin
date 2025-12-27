/**
 * Zod schemas for event_types table
 * Source: 19_ocpm_extended.sql
 */

import { z } from "zod";

/** Schema for a event_types row */
export const EventTypesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  perspective_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable(),
  description: z.string().nullable(),
  source_table: z.string().nullable(),
  timestamp_column: z.string().datetime({ offset: true }).or(z.string()),
  sorting_column: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  status: z.enum(["draft", "published", "deprecated"]),
  attribute_schema: z.record(z.string(), z.unknown()).nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_by: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type EventTypes = z.infer<typeof EventTypesSchema>;

/** Schema for inserting a event_types row */
export const EventTypesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  perspective_id: z.string().uuid(),
  name: z.string(),
  display_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  source_table: z.string().nullable().optional(),
  timestamp_column: z.string().datetime({ offset: true }).or(z.string()),
  sorting_column: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  status: z.enum(["draft", "published", "deprecated"]).optional(),
  attribute_schema: z.record(z.string(), z.unknown()).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  created_by: z.string().nullable().optional(),
});

export type EventTypesInsert = z.infer<typeof EventTypesInsertSchema>;

/** Schema for updating a event_types row */
export const EventTypesUpdateSchema = EventTypesInsertSchema.partial();

export type EventTypesUpdate = z.infer<typeof EventTypesUpdateSchema>;