export type DeviationsDeviationType = "missing" | "unexpected" | "wrong_order";
export type DeviationsSeverity = "low" | "medium" | "high" | "critical";

/**
 * Represents a row in the deviations table
 * Source: 06_conformance.sql
 */
export interface Deviations {
  /** Primary key */
  id: string;
  conformance_result_id: string;
  tenant_id: string;
  case_id: string | null;
  event_id: string | null;
  deviation_type: DeviationsDeviationType;
  expected_activity: string | null;
  actual_activity: string | null;
  position_in_trace: number | null;
  severity: DeviationsSeverity | null;
  cost: number | null;
  /** JSON field */
  details: Record<string, unknown> | null;
  detected_at: string;
}

/** Insert type for deviations (excludes auto-generated fields) */
export interface DeviationsInsert {
  conformance_result_id: string;
  tenant_id: string;
  case_id?: string | null;
  event_id?: string | null;
  deviation_type: DeviationsDeviationType;
  expected_activity?: string | null;
  actual_activity?: string | null;
  position_in_trace?: number | null;
  severity?: DeviationsSeverity | null;
  cost?: number | null;
  details?: Record<string, unknown> | null;
  detected_at?: string;
}