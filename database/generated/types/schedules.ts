export type SchedulesScheduleType = "cron" | "interval" | "once";

/**
 * Represents a row in the schedules table
 * Source: 15_data_model.sql
 */
export interface Schedules {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  schedule_type: SchedulesScheduleType;
  cron_expression: string | null;
  interval_seconds: number | null;
  run_at: string | null;
  timezone: string;
  is_enabled: number;
  last_triggered_at: string | null;
  next_trigger_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for schedules (excludes auto-generated fields) */
export interface SchedulesInsert {
  tenant_id: string;
  name: string;
  description?: string | null;
  schedule_type: SchedulesScheduleType;
  cron_expression?: string | null;
  interval_seconds?: number | null;
  run_at?: string | null;
  timezone?: string;
  is_enabled?: number;
  last_triggered_at?: string | null;
  next_trigger_at?: string | null;
  created_by?: string | null;
}