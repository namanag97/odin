export type KpisReturnType = "number" | "string" | "date" | "boolean" | "array";
export type KpisUnitPosition = "prefix" | "suffix";
export type KpisAggregationType = "sum" | "avg" | "min" | "max" | "count" | "count_distinct" | "custom";

/**
 * Represents a row in the kpis table
 * Source: 16_semantic.sql
 */
export interface Kpis {
  /** Primary key */
  id: string;
  tenant_id: string;
  knowledge_model_id: string;
  key: string;
  display_name: string | null;
  description: string | null;
  pql_expression: string;
  return_type: KpisReturnType;
  format_string: string | null;
  unit: string | null;
  unit_position: KpisUnitPosition | null;
  aggregation_type: KpisAggregationType | null;
  is_global: number;
  category: string | null;
  /** JSON field */
  parameters: unknown[] | null;
  /** JSON field */
  thresholds: unknown[] | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for kpis (excludes auto-generated fields) */
export interface KpisInsert {
  tenant_id: string;
  knowledge_model_id: string;
  key: string;
  display_name?: string | null;
  description?: string | null;
  pql_expression: string;
  return_type?: KpisReturnType;
  format_string?: string | null;
  unit?: string | null;
  unit_position?: KpisUnitPosition | null;
  aggregation_type?: KpisAggregationType | null;
  is_global?: number;
  category?: string | null;
  parameters?: unknown[] | null;
  thresholds?: unknown[] | null;
  metadata?: Record<string, unknown> | null;
}