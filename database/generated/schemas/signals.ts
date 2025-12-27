/**
 * Zod schemas for signals table
 * Source: 18_automation_enhanced.sql
 */

import { z } from "zod";

/** Schema for a signals row */
export const SignalsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  sensor_id: z.string().uuid(),
  skill_id: z.string().uuid().nullable(),
  record_key: z.string(),
  signal_data: z.string(),
  status: z.enum(["open", "in_progress", "snoozed", "resolved", "dismissed"]),
  priority: z.enum(["critical", "high", "medium", "low"]),
  assignee_id: z.string().uuid().nullable(),
  assigned_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  snoozed_until: z.string().nullable(),
  resolved_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  resolved_by: z.string().nullable(),
  resolution_notes: z.string().nullable(),
  task_id: z.string().uuid().nullable(),
  source_view_id: z.string().uuid().nullable(),
  detected_at: z.string().datetime({ offset: true }).or(z.string()),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Signals = z.infer<typeof SignalsSchema>;

/** Schema for inserting a signals row */
export const SignalsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  sensor_id: z.string().uuid(),
  skill_id: z.string().uuid().nullable().optional(),
  record_key: z.string(),
  signal_data: z.string(),
  status: z.enum(["open", "in_progress", "snoozed", "resolved", "dismissed"]).optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  assignee_id: z.string().uuid().nullable().optional(),
  assigned_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  snoozed_until: z.string().nullable().optional(),
  resolved_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  resolved_by: z.string().nullable().optional(),
  resolution_notes: z.string().nullable().optional(),
  task_id: z.string().uuid().nullable().optional(),
  source_view_id: z.string().uuid().nullable().optional(),
  detected_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type SignalsInsert = z.infer<typeof SignalsInsertSchema>;

/** Schema for updating a signals row */
export const SignalsUpdateSchema = SignalsInsertSchema.partial();

export type SignalsUpdate = z.infer<typeof SignalsUpdateSchema>;