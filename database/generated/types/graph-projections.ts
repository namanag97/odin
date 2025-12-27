export type GraphProjectionsSourceType = "event_log" | "data_pool" | "discovered_model";
export type GraphProjectionsSyncMode = "full" | "incremental" | "cdc";

/**
 * Represents a row in the graph_projections table
 * Source: 11_graph.sql
 */
export interface GraphProjections {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  source_type: GraphProjectionsSourceType;
  source_id: string;
  /** JSON field */
  projection_config: Record<string, unknown>;
  neo4j_database: string | null;
  sync_mode: GraphProjectionsSyncMode | null;
  sync_interval_seconds: number | null;
  last_sync_at: string | null;
  last_sync_status: string | null;
  is_active: number | null;
  created_at: string;
}

/** Insert type for graph_projections (excludes auto-generated fields) */
export interface GraphProjectionsInsert {
  tenant_id: string;
  name: string;
  description?: string | null;
  source_type: GraphProjectionsSourceType;
  source_id: string;
  projection_config: Record<string, unknown>;
  neo4j_database?: string | null;
  sync_mode?: GraphProjectionsSyncMode | null;
  sync_interval_seconds?: number | null;
  last_sync_at?: string | null;
  last_sync_status?: string | null;
  is_active?: number | null;
}