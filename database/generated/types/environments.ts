export type EnvironmentsType = "production" | "staging" | "development" | "sandbox";

/**
 * Represents a row in the environments table
 * Source: 20_existence_layer.sql
 */
export interface Environments {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  type: EnvironmentsType;
  is_default: number;
  /** JSON field */
  config: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for environments (excludes auto-generated fields) */
export interface EnvironmentsInsert {
  tenant_id: string;
  name: string;
  type: EnvironmentsType;
  is_default?: number;
  config?: Record<string, unknown> | null;
}