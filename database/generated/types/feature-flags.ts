export type FeatureFlagsType = "boolean" | "percentage" | "variant" | "json";

/**
 * Represents a row in the feature_flags table
 * Source: 23_operational_layer.sql
 */
export interface FeatureFlags {
  /** Primary key */
  id: string;
  key: string;
  name: string;
  description: string | null;
  type: FeatureFlagsType;
  default_value: string | null;
  is_enabled: number;
  /** JSON field */
  targeting_rules: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for feature_flags (excludes auto-generated fields) */
export interface FeatureFlagsInsert {
  key: string;
  name: string;
  description?: string | null;
  type?: FeatureFlagsType;
  default_value?: string | null;
  is_enabled?: number;
  targeting_rules?: Record<string, unknown> | null;
}