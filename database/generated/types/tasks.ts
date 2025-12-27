export type TasksStatus = "open" | "in_progress" | "resolved" | "cancelled";
export type TasksPriority = "critical" | "high" | "medium" | "low";

/**
 * Represents a row in the tasks table
 * Source: 18_automation_enhanced.sql
 */
export interface Tasks {
  /** Primary key */
  id: string;
  tenant_id: string;
  task_type_id: string;
  title: string;
  description: string | null;
  status: TasksStatus;
  priority: TasksPriority;
  assignee_id: string | null;
  reporter_id: string;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  related_signal_id: string | null;
  related_record_type: string | null;
  related_record_key: string | null;
  source_view_id: string | null;
  source_action_flow_id: string | null;
  /** JSON field */
  attributes: Record<string, unknown> | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for tasks (excludes auto-generated fields) */
export interface TasksInsert {
  tenant_id: string;
  task_type_id: string;
  title: string;
  description?: string | null;
  status?: TasksStatus;
  priority?: TasksPriority;
  assignee_id?: string | null;
  reporter_id: string;
  due_date?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  related_signal_id?: string | null;
  related_record_type?: string | null;
  related_record_key?: string | null;
  source_view_id?: string | null;
  source_action_flow_id?: string | null;
  attributes?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}