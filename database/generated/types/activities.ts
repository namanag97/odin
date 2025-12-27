
/**
 * Represents a row in the activities table
 * Source: 02_case_centric.sql
 */
export interface Activities {
  /** Primary key */
  id: string;
  tenant_id: string;
  event_log_id: string;
  name: string;
  display_name: string | null;
  category: string | null;
  is_automated: number | null;
  avg_duration_seconds: number | null;
  avg_cost: number | null;
  occurrence_count: number | null;
  icon: string | null;
  color: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for activities (excludes auto-generated fields) */
export interface ActivitiesInsert {
  tenant_id: string;
  event_log_id: string;
  name: string;
  display_name?: string | null;
  category?: string | null;
  is_automated?: number | null;
  avg_duration_seconds?: number | null;
  avg_cost?: number | null;
  occurrence_count?: number | null;
  icon?: string | null;
  color?: string | null;
  metadata?: Record<string, unknown> | null;
}