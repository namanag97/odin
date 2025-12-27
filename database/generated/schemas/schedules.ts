/**
 * Zod schemas for schedules table
 * Source: 15_data_model.sql
 */

import { z } from "zod";

/** Schema for a schedules row */
export const SchedulesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  schedule_type: z.enum(["cron", "interval", "once"]),
  cron_expression: z.string().nullable(),
  interval_seconds: z.number().int().nullable(),
  run_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  timezone: z.string(),
  is_enabled: z.number().int(),
  last_triggered_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  next_trigger_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  created_by: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Schedules = z.infer<typeof SchedulesSchema>;

/** Schema for inserting a schedules row */
export const SchedulesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  schedule_type: z.enum(["cron", "interval", "once"]),
  cron_expression: z.string().nullable().optional(),
  interval_seconds: z.number().int().nullable().optional(),
  run_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  timezone: z.string().optional(),
  is_enabled: z.number().int().optional(),
  last_triggered_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  next_trigger_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  created_by: z.string().nullable().optional(),
});

export type SchedulesInsert = z.infer<typeof SchedulesInsertSchema>;

/** Schema for updating a schedules row */
export const SchedulesUpdateSchema = SchedulesInsertSchema.partial();

export type SchedulesUpdate = z.infer<typeof SchedulesUpdateSchema>;