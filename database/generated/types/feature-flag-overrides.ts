export type FeatureFlagOverridesTargetType = "tenant" | "user" | "segment";

/**
 * Represents a row in the feature_flag_overrides table
 * Source: 23_operational_layer.sql
 */
export interface FeatureFlagOverrides {
  /** Primary key */
  id: string;
  feature_flag_id: string;
  target_type: FeatureFlagOverridesTargetType;
  target_id: string;
  value: string;
  expires_at: string | null;
  created_at: string;
}

/** Insert type for feature_flag_overrides (excludes auto-generated fields) */
export interface FeatureFlagOverridesInsert {
  feature_flag_id: string;
  target_type: FeatureFlagOverridesTargetType;
  target_id: string;
  value: string;
  expires_at?: string | null;
}