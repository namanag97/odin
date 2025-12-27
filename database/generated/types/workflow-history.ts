export type WorkflowHistoryEventType = "workflow_execution_started" | "workflow_execution_completed" | "workflow_execution_failed" | "workflow_execution_timed_out" | "workflow_execution_cancelled" | "workflow_execution_terminated" | "workflow_execution_continued_as_new" | "activity_task_scheduled" | "activity_task_started" | "activity_task_completed" | "activity_task_failed" | "activity_task_timed_out" | "activity_task_cancelled" | "timer_started" | "timer_fired" | "timer_cancelled" | "workflow_execution_signaled" | "signal_external_workflow_execution_initiated" | "start_child_workflow_execution_initiated" | "child_workflow_execution_started" | "child_workflow_execution_completed" | "child_workflow_execution_failed" | "marker_recorded" | "side_effect_recorded" | "local_activity_started" | "local_activity_completed" | "local_activity_failed";

/**
 * Represents a row in the workflow_history table
 * Source: 14_workflow_eventsource.sql
 */
export interface WorkflowHistory {
  /** Primary key */
  id: string;
  execution_id: string;
  tenant_id: string;
  event_sequence: number;
  event_type: WorkflowHistoryEventType;
  event_timestamp: string;
  event_data: string;
  /** JSON field */
  event_metadata: Record<string, unknown> | null;
}

/** Insert type for workflow_history (excludes auto-generated fields) */
export interface WorkflowHistoryInsert {
  execution_id: string;
  tenant_id: string;
  event_sequence: number;
  event_type: WorkflowHistoryEventType;
  event_timestamp?: string;
  event_data: string;
  event_metadata?: Record<string, unknown> | null;
}