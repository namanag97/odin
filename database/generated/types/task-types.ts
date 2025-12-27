
/**
 * Represents a row in the task_types table
 * Source: 18_automation_enhanced.sql
 */
export interface TaskTypes {
  /** Primary key */
  id: string;
  tenant_id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  default_priority: string | null;
  /** JSON field */
  attribute_schema: Record<string, unknown> | null;
  /** JSON field */
  workflow_config: Record<string, unknown> | null;
  /** JSON field */
  sla_config: Record<string, unknown> | null;
  is_system: number;
  created_at: string;
  updated_at: string;
}

/** Insert type for task_types (excludes auto-generated fields) */
export interface TaskTypesInsert {
  tenant_id: string;
  key: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  default_priority?: string | null;
  attribute_schema?: Record<string, unknown> | null;
  workflow_config?: Record<string, unknown> | null;
  sla_config?: Record<string, unknown> | null;
  is_system?: number;
}