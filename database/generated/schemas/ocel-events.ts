/**
 * Zod schemas for ocel_events table
 * Source: 03_ocel.sql
 */

import { z } from "zod";

/** Schema for a ocel_events row */
export const OcelEventsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  ocel_id: z.string().uuid(),
  event_type_id: z.string().uuid(),
  event_type_name: z.string(),
  timestamp: z.string().datetime({ offset: true }).or(z.string()),
  attributes: z.record(z.string(), z.unknown()).nullable(),
});

export type OcelEvents = z.infer<typeof OcelEventsSchema>;

/** Schema for inserting a ocel_events row */
export const OcelEventsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  ocel_id: z.string().uuid(),
  event_type_id: z.string().uuid(),
  event_type_name: z.string(),
  timestamp: z.string().datetime({ offset: true }).or(z.string()),
  attributes: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type OcelEventsInsert = z.infer<typeof OcelEventsInsertSchema>;

/** Schema for updating a ocel_events row */
export const OcelEventsUpdateSchema = OcelEventsInsertSchema.partial();

export type OcelEventsUpdate = z.infer<typeof OcelEventsUpdateSchema>;