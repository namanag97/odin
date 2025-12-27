export type SignalsStatus = "open" | "in_progress" | "snoozed" | "resolved" | "dismissed";
export type SignalsPriority = "critical" | "high" | "medium" | "low";

/**
 * Represents a row in the signals table
 * Source: 18_automation_enhanced.sql
 */
export interface Signals {
  /** Primary key */
  id: string;
  tenant_id: string;
  sensor_id: string;
  skill_id: string | null;
  record_key: string;
  signal_data: string;
  status: SignalsStatus;
  priority: SignalsPriority;
  assignee_id: string | null;
  assigned_at: string | null;
  snoozed_until: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  task_id: string | null;
  source_view_id: string | null;
  detected_at: string;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for signals (excludes auto-generated fields) */
export interface SignalsInsert {
  tenant_id: string;
  sensor_id: string;
  skill_id?: string | null;
  record_key: string;
  signal_data: string;
  status?: SignalsStatus;
  priority?: SignalsPriority;
  assignee_id?: string | null;
  assigned_at?: string | null;
  snoozed_until?: string | null;
  resolved_at?: string | null;
  resolved_by?: string | null;
  resolution_notes?: string | null;
  task_id?: string | null;
  source_view_id?: string | null;
  detected_at?: string;
  metadata?: Record<string, unknown> | null;
}