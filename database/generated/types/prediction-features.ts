export type PredictionFeaturesFeatureType = "case_attribute" | "event_attribute" | "derived" | "temporal" | "sequence";
export type PredictionFeaturesDataType = "numeric" | "categorical" | "boolean" | "embedding";
export type PredictionFeaturesEncodingMethod = "one_hot" | "label" | "embedding" | "none";
export type PredictionFeaturesNormalization = "standard" | "minmax" | "none";
export type PredictionFeaturesMissingStrategy = "mean" | "median" | "mode" | "zero" | "drop";

/**
 * Represents a row in the prediction_features table
 * Source: 08_prediction.sql
 */
export interface PredictionFeatures {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  feature_type: PredictionFeaturesFeatureType;
  data_type: PredictionFeaturesDataType;
  source_column: string | null;
  derivation_formula: string | null;
  encoding_method: PredictionFeaturesEncodingMethod | null;
  normalization: PredictionFeaturesNormalization | null;
  missing_strategy: PredictionFeaturesMissingStrategy | null;
  /** JSON field */
  statistics: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for prediction_features (excludes auto-generated fields) */
export interface PredictionFeaturesInsert {
  tenant_id: string;
  name: string;
  description?: string | null;
  feature_type: PredictionFeaturesFeatureType;
  data_type: PredictionFeaturesDataType;
  source_column?: string | null;
  derivation_formula?: string | null;
  encoding_method?: PredictionFeaturesEncodingMethod | null;
  normalization?: PredictionFeaturesNormalization | null;
  missing_strategy?: PredictionFeaturesMissingStrategy | null;
  statistics?: Record<string, unknown> | null;
}