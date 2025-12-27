
/**
 * Represents a row in the alignments table
 * Source: 06_conformance.sql
 */
export interface Alignments {
  /** Primary key */
  id: string;
  conformance_result_id: string;
  case_id: string;
  tenant_id: string;
  alignment_cost: number;
  fitness_value: number;
  alignment_sequence: string;
  trace_length: number | null;
  model_length: number | null;
  computation_time_ms: number | null;
}

/** Insert type for alignments (excludes auto-generated fields) */
export interface AlignmentsInsert {
  conformance_result_id: string;
  case_id: string;
  tenant_id: string;
  alignment_cost: number;
  fitness_value: number;
  alignment_sequence: string;
  trace_length?: number | null;
  model_length?: number | null;
  computation_time_ms?: number | null;
}