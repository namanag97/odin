/**
 * Zod schemas for workflow_history table
 * Source: 14_workflow_eventsource.sql
 */

import { z } from "zod";

/** Schema for a workflow_history row */
export const WorkflowHistorySchema = z.object({
  id: z.string().uuid(),
  execution_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_sequence: z.number().int(),
  event_type: z.enum(["workflow_execution_started", "workflow_execution_completed", "workflow_execution_failed", "workflow_execution_timed_out", "workflow_execution_cancelled", "workflow_execution_terminated", "workflow_execution_continued_as_new", "activity_task_scheduled", "activity_task_started", "activity_task_completed", "activity_task_failed", "activity_task_timed_out", "activity_task_cancelled", "timer_started", "timer_fired", "timer_cancelled", "workflow_execution_signaled", "signal_external_workflow_execution_initiated", "start_child_workflow_execution_initiated", "child_workflow_execution_started", "child_workflow_execution_completed", "child_workflow_execution_failed", "marker_recorded", "side_effect_recorded", "local_activity_started", "local_activity_completed", "local_activity_failed"]),
  event_timestamp: z.string().datetime({ offset: true }).or(z.string()),
  event_data: z.string(),
  event_metadata: z.record(z.string(), z.unknown()).nullable(),
});

export type WorkflowHistory = z.infer<typeof WorkflowHistorySchema>;

/** Schema for inserting a workflow_history row */
export const WorkflowHistoryInsertSchema = z.object({
  execution_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_sequence: z.number().int(),
  event_type: z.enum(["workflow_execution_started", "workflow_execution_completed", "workflow_execution_failed", "workflow_execution_timed_out", "workflow_execution_cancelled", "workflow_execution_terminated", "workflow_execution_continued_as_new", "activity_task_scheduled", "activity_task_started", "activity_task_completed", "activity_task_failed", "activity_task_timed_out", "activity_task_cancelled", "timer_started", "timer_fired", "timer_cancelled", "workflow_execution_signaled", "signal_external_workflow_execution_initiated", "start_child_workflow_execution_initiated", "child_workflow_execution_started", "child_workflow_execution_completed", "child_workflow_execution_failed", "marker_recorded", "side_effect_recorded", "local_activity_started", "local_activity_completed", "local_activity_failed"]),
  event_timestamp: z.string().datetime({ offset: true }).or(z.string()).optional(),
  event_data: z.string(),
  event_metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type WorkflowHistoryInsert = z.infer<typeof WorkflowHistoryInsertSchema>;

/** Schema for updating a workflow_history row */
export const WorkflowHistoryUpdateSchema = WorkflowHistoryInsertSchema.partial();

export type WorkflowHistoryUpdate = z.infer<typeof WorkflowHistoryUpdateSchema>;