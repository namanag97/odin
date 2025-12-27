/**
 * Zod schemas for tasks table
 * Source: 18_automation_enhanced.sql
 */

import { z } from "zod";

/** Schema for a tasks row */
export const TasksSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  task_type_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(["open", "in_progress", "resolved", "cancelled"]),
  priority: z.enum(["critical", "high", "medium", "low"]),
  assignee_id: z.string().uuid().nullable(),
  reporter_id: z.string().uuid(),
  due_date: z.string().nullable(),
  started_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  related_signal_id: z.string().uuid().nullable(),
  related_record_type: z.string().nullable(),
  related_record_key: z.string().nullable(),
  source_view_id: z.string().uuid().nullable(),
  source_action_flow_id: z.string().uuid().nullable(),
  attributes: z.record(z.string(), z.unknown()).nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Tasks = z.infer<typeof TasksSchema>;

/** Schema for inserting a tasks row */
export const TasksInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  task_type_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  status: z.enum(["open", "in_progress", "resolved", "cancelled"]).optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  assignee_id: z.string().uuid().nullable().optional(),
  reporter_id: z.string().uuid(),
  due_date: z.string().nullable().optional(),
  started_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  related_signal_id: z.string().uuid().nullable().optional(),
  related_record_type: z.string().nullable().optional(),
  related_record_key: z.string().nullable().optional(),
  source_view_id: z.string().uuid().nullable().optional(),
  source_action_flow_id: z.string().uuid().nullable().optional(),
  attributes: z.record(z.string(), z.unknown()).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type TasksInsert = z.infer<typeof TasksInsertSchema>;

/** Schema for updating a tasks row */
export const TasksUpdateSchema = TasksInsertSchema.partial();

export type TasksUpdate = z.infer<typeof TasksUpdateSchema>;