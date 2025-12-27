
/**
 * Represents a row in the metric_values table
 * Source: 07_analytics.sql
 */
export interface MetricValues {
  /** Primary key */
  id: string;
  metric_id: string;
  tenant_id: string;
  measured_at: string;
  period_start: string;
  period_end: string;
  value: number;
  sample_count: number | null;
  /** JSON field */
  dimensions: Record<string, unknown> | null;
}

/** Insert type for metric_values (excludes auto-generated fields) */
export interface MetricValuesInsert {
  metric_id: string;
  tenant_id: string;
  measured_at: string;
  period_start: string;
  period_end: string;
  value: number;
  sample_count?: number | null;
  dimensions?: Record<string, unknown> | null;
}