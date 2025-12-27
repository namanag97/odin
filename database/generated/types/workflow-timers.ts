export type WorkflowTimersStatus = "pending" | "fired" | "cancelled";

/**
 * Represents a row in the workflow_timers table
 * Source: 14_workflow_eventsource.sql
 */
export interface WorkflowTimers {
  /** Primary key */
  id: string;
  execution_id: string;
  tenant_id: string;
  timer_id: string;
  fire_at: string;
  duration_seconds: number | null;
  status: WorkflowTimersStatus | null;
  started_event_id: number;
  fired_event_id: number | null;
  created_at: string;
}

/** Insert type for workflow_timers (excludes auto-generated fields) */
export interface WorkflowTimersInsert {
  execution_id: string;
  tenant_id: string;
  timer_id: string;
  fire_at: string;
  duration_seconds?: number | null;
  status?: WorkflowTimersStatus | null;
  started_event_id: number;
  fired_event_id?: number | null;
}