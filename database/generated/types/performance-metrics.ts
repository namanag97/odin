export type PerformanceMetricsMetricType = "throughput_time" | "waiting_time" | "service_time" | "count" | "cost" | "custom";
export type PerformanceMetricsAggregation = "avg" | "sum" | "min" | "max" | "median" | "p95" | "count";

/**
 * Represents a row in the performance_metrics table
 * Source: 07_analytics.sql
 */
export interface PerformanceMetrics {
  /** Primary key */
  id: string;
  tenant_id: string;
  event_log_id: string | null;
  data_pool_id: string | null;
  name: string;
  description: string | null;
  metric_type: PerformanceMetricsMetricType;
  aggregation: PerformanceMetricsAggregation | null;
  unit: string | null;
  formula: string | null;
  /** JSON field */
  filter_conditions: Record<string, unknown> | null;
  /** JSON field */
  thresholds: Record<string, unknown> | null;
  is_active: number | null;
  created_at: string;
}

/** Insert type for performance_metrics (excludes auto-generated fields) */
export interface PerformanceMetricsInsert {
  tenant_id: string;
  event_log_id?: string | null;
  data_pool_id?: string | null;
  name: string;
  description?: string | null;
  metric_type: PerformanceMetricsMetricType;
  aggregation?: PerformanceMetricsAggregation | null;
  unit?: string | null;
  formula?: string | null;
  filter_conditions?: Record<string, unknown> | null;
  thresholds?: Record<string, unknown> | null;
  is_active?: number | null;
}