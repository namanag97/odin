export type SystemConfigsType = "string" | "number" | "boolean" | "json" | "secret";

/**
 * Represents a row in the system_configs table
 * Source: 23_operational_layer.sql
 */
export interface SystemConfigs {
  /** Primary key */
  id: string;
  key: string;
  value: string;
  type: SystemConfigsType;
  description: string | null;
  is_sensitive: number;
  updated_by: string | null;
  updated_at: string;
}

/** Insert type for system_configs (excludes auto-generated fields) */
export interface SystemConfigsInsert {
  key: string;
  value: string;
  type: SystemConfigsType;
  description?: string | null;
  is_sensitive?: number;
  updated_by?: string | null;
}