
/**
 * Represents a row in the variants table
 * Source: 02_case_centric.sql
 */
export interface Variants {
  /** Primary key */
  id: string;
  tenant_id: string;
  event_log_id: string;
  sequence: string;
  sequence_hash: string;
  case_count: number | null;
  percentage: number | null;
  avg_duration_seconds: number | null;
  min_duration_seconds: number | null;
  max_duration_seconds: number | null;
  is_happy_path: number | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
  created_at: string;
}

/** Insert type for variants (excludes auto-generated fields) */
export interface VariantsInsert {
  tenant_id: string;
  event_log_id: string;
  sequence: string;
  sequence_hash: string;
  case_count?: number | null;
  percentage?: number | null;
  avg_duration_seconds?: number | null;
  min_duration_seconds?: number | null;
  max_duration_seconds?: number | null;
  is_happy_path?: number | null;
  first_seen_at?: string | null;
  last_seen_at?: string | null;
}