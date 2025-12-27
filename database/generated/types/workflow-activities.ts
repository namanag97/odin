export type WorkflowActivitiesStatus = "scheduled" | "running" | "completed" | "failed" | "cancelled" | "timed_out";

/**
 * Represents a row in the workflow_activities table
 * Source: 14_workflow_eventsource.sql
 */
export interface WorkflowActivities {
  /** Primary key */
  id: string;
  execution_id: string;
  tenant_id: string;
  activity_id: string;
  activity_type: string;
  scheduled_event_id: number;
  started_event_id: number | null;
  completed_event_id: number | null;
  status: WorkflowActivitiesStatus;
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
  attempt_number: number | null;
  max_attempts: number | null;
  input: string | null;
  output: string | null;
  error: string | null;
  task_queue: string | null;
}

/** Insert type for workflow_activities (excludes auto-generated fields) */
export interface WorkflowActivitiesInsert {
  execution_id: string;
  tenant_id: string;
  activity_id: string;
  activity_type: string;
  scheduled_event_id: number;
  started_event_id?: number | null;
  completed_event_id?: number | null;
  status?: WorkflowActivitiesStatus;
  scheduled_at?: string;
  started_at?: string | null;
  completed_at?: string | null;
  attempt_number?: number | null;
  max_attempts?: number | null;
  input?: string | null;
  output?: string | null;
  error?: string | null;
  task_queue?: string | null;
}