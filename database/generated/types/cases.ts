export type CasesStatus = "open" | "completed" | "cancelled";

/**
 * Represents a row in the cases table
 * Source: 02_case_centric.sql
 */
export interface Cases {
  /** Primary key */
  id: string;
  tenant_id: string;
  event_log_id: string;
  case_id: string;
  variant_id: string | null;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  event_count: number | null;
  status: CasesStatus | null;
  /** JSON field */
  attributes: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for cases (excludes auto-generated fields) */
export interface CasesInsert {
  tenant_id: string;
  event_log_id: string;
  case_id: string;
  variant_id?: string | null;
  start_time: string;
  end_time?: string | null;
  duration_seconds?: number | null;
  event_count?: number | null;
  status?: CasesStatus | null;
  attributes?: Record<string, unknown> | null;
}