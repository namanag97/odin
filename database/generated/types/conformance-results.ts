
/**
 * Represents a row in the conformance_results table
 * Source: 06_conformance.sql
 */
export interface ConformanceResults {
  /** Primary key */
  id: string;
  conformance_job_id: string;
  tenant_id: string;
  computed_at: string;
  cases_checked: number;
  conforming_cases: number;
  non_conforming_cases: number;
  fitness: number | null;
  precision: number | null;
  generalization: number | null;
  computation_time_ms: number | null;
  /** JSON field */
  detailed_metrics: Record<string, unknown> | null;
}

/** Insert type for conformance_results (excludes auto-generated fields) */
export interface ConformanceResultsInsert {
  conformance_job_id: string;
  tenant_id: string;
  computed_at?: string;
  cases_checked: number;
  conforming_cases: number;
  non_conforming_cases: number;
  fitness?: number | null;
  precision?: number | null;
  generalization?: number | null;
  computation_time_ms?: number | null;
  detailed_metrics?: Record<string, unknown> | null;
}