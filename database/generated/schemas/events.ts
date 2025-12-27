/**
 * Zod schemas for events table
 * Source: 02_case_centric.sql
 */

import { z } from "zod";

/** Schema for a events row */
export const EventsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid(),
  case_id: z.string().uuid(),
  activity_id: z.string().uuid().nullable(),
  activity_name: z.string(),
  timestamp: z.string().datetime({ offset: true }).or(z.string()),
  sort_key: z.number().int().nullable(),
  resource_id: z.string().uuid().nullable(),
  resource_name: z.string().nullable(),
  lifecycle: z.enum(["start", "complete", "suspend", "resume", "abort"]).nullable(),
  cost: z.number().nullable(),
  attributes: z.record(z.string(), z.unknown()).nullable(),
});

export type Events = z.infer<typeof EventsSchema>;

/** Schema for inserting a events row */
export const EventsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid(),
  case_id: z.string().uuid(),
  activity_id: z.string().uuid().nullable().optional(),
  activity_name: z.string(),
  timestamp: z.string().datetime({ offset: true }).or(z.string()),
  sort_key: z.number().int().nullable().optional(),
  resource_id: z.string().uuid().nullable().optional(),
  resource_name: z.string().nullable().optional(),
  lifecycle: z.enum(["start", "complete", "suspend", "resume", "abort"]).nullable().optional(),
  cost: z.number().nullable().optional(),
  attributes: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type EventsInsert = z.infer<typeof EventsInsertSchema>;

/** Schema for updating a events row */
export const EventsUpdateSchema = EventsInsertSchema.partial();

export type EventsUpdate = z.infer<typeof EventsUpdateSchema>;