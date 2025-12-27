export type SnaResultsAnalysisType = "handover" | "working_together" | "subcontracting" | "similar_activities";

/**
 * Represents a row in the sna_results table
 * Source: 07_analytics.sql
 */
export interface SnaResults {
  /** Primary key */
  id: string;
  tenant_id: string;
  event_log_id: string;
  name: string;
  analyzed_at: string;
  analysis_type: SnaResultsAnalysisType;
  network_data: string;
  /** JSON field */
  metrics: Record<string, unknown> | null;
}

/** Insert type for sna_results (excludes auto-generated fields) */
export interface SnaResultsInsert {
  tenant_id: string;
  event_log_id: string;
  name: string;
  analyzed_at?: string;
  analysis_type: SnaResultsAnalysisType;
  network_data: string;
  metrics?: Record<string, unknown> | null;
}