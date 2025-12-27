export type QualityMetricsMetricType = "fitness" | "precision" | "generalization" | "simplicity" | "f_score";

/**
 * Represents a row in the quality_metrics table
 * Source: 06_conformance.sql
 */
export interface QualityMetrics {
  /** Primary key */
  id: string;
  model_id: string;
  tenant_id: string;
  computed_at: string;
  metric_type: QualityMetricsMetricType;
  value: number;
  method: string | null;
  sample_size: number | null;
  confidence_interval: string | null;
}

/** Insert type for quality_metrics (excludes auto-generated fields) */
export interface QualityMetricsInsert {
  model_id: string;
  tenant_id: string;
  computed_at?: string;
  metric_type: QualityMetricsMetricType;
  value: number;
  method?: string | null;
  sample_size?: number | null;
  confidence_interval?: string | null;
}