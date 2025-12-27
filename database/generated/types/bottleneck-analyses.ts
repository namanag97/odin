export type BottleneckAnalysesMethod = "sojourn_time" | "waiting_time" | "queue_length";

/**
 * Represents a row in the bottleneck_analyses table
 * Source: 07_analytics.sql
 */
export interface BottleneckAnalyses {
  /** Primary key */
  id: string;
  tenant_id: string;
  event_log_id: string | null;
  data_pool_id: string | null;
  name: string;
  analyzed_at: string;
  method: BottleneckAnalysesMethod;
  results: string;
  /** JSON field */
  recommendations: unknown[] | null;
}

/** Insert type for bottleneck_analyses (excludes auto-generated fields) */
export interface BottleneckAnalysesInsert {
  tenant_id: string;
  event_log_id?: string | null;
  data_pool_id?: string | null;
  name: string;
  analyzed_at?: string;
  method: BottleneckAnalysesMethod;
  results: string;
  recommendations?: unknown[] | null;
}