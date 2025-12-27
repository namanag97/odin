export type DataConnectionsStatus = "connected" | "disconnected" | "error";

/**
 * Represents a row in the data_connections table
 * Source: 01_core.sql
 */
export interface DataConnections {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_pool_id: string | null;
  name: string;
  connector_type: string;
  /** JSON field */
  connection_config: Record<string, unknown>;
  /** JSON field */
  extraction_config: Record<string, unknown> | null;
  status: DataConnectionsStatus | null;
  last_tested_at: string | null;
  last_sync_at: string | null;
  created_at: string;
}

/** Insert type for data_connections (excludes auto-generated fields) */
export interface DataConnectionsInsert {
  tenant_id: string;
  data_pool_id?: string | null;
  name: string;
  connector_type: string;
  connection_config: Record<string, unknown>;
  extraction_config?: Record<string, unknown> | null;
  status?: DataConnectionsStatus | null;
  last_tested_at?: string | null;
  last_sync_at?: string | null;
}