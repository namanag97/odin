export type DataPoolsPoolType = "case_centric" | "ocel" | "hybrid";
export type DataPoolsStatus = "active" | "archived" | "error";

/**
 * Represents a row in the data_pools table
 * Source: 01_core.sql
 */
export interface DataPools {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  pool_type: DataPoolsPoolType;
  status: DataPoolsStatus | null;
  schema_version: number | null;
  /** JSON field */
  statistics: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for data_pools (excludes auto-generated fields) */
export interface DataPoolsInsert {
  tenant_id: string;
  name: string;
  description?: string | null;
  pool_type: DataPoolsPoolType;
  status?: DataPoolsStatus | null;
  schema_version?: number | null;
  statistics?: Record<string, unknown> | null;
}