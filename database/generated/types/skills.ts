export type SkillsStatus = "draft" | "active" | "inactive";

/**
 * Represents a row in the skills table
 * Source: 18_automation_enhanced.sql
 */
export interface Skills {
  /** Primary key */
  id: string;
  tenant_id: string;
  package_id: string;
  key: string;
  name: string;
  description: string | null;
  sensor_id: string;
  action_flow_id: string | null;
  status: SkillsStatus;
  signal_count: number | null;
  last_evaluated_at: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for skills (excludes auto-generated fields) */
export interface SkillsInsert {
  tenant_id: string;
  package_id: string;
  key: string;
  name: string;
  description?: string | null;
  sensor_id: string;
  action_flow_id?: string | null;
  status?: SkillsStatus;
  signal_count?: number | null;
  last_evaluated_at?: string | null;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
}