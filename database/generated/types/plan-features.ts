
/**
 * Represents a row in the plan_features table
 * Source: 22_commercial_layer.sql
 */
export interface PlanFeatures {
  /** Primary key */
  id: string;
  plan_id: string;
  feature_key: string;
  is_enabled: number;
  /** JSON field */
  config: Record<string, unknown> | null;
}

/** Insert type for plan_features (excludes auto-generated fields) */
export interface PlanFeaturesInsert {
  plan_id: string;
  feature_key: string;
  is_enabled?: number;
  config?: Record<string, unknown> | null;
}