export type WorkflowsTriggerType = "rule" | "schedule" | "manual" | "api";

/**
 * Represents a row in the workflows table
 * Source: 10_automation.sql
 */
export interface Workflows {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  trigger_type: WorkflowsTriggerType;
  /** JSON field */
  trigger_config: Record<string, unknown> | null;
  is_active: number | null;
  timeout_seconds: number | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for workflows (excludes auto-generated fields) */
export interface WorkflowsInsert {
  tenant_id: string;
  name: string;
  description?: string | null;
  trigger_type: WorkflowsTriggerType;
  trigger_config?: Record<string, unknown> | null;
  is_active?: number | null;
  timeout_seconds?: number | null;
}