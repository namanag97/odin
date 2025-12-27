export type GraphSyncLogStatus = "running" | "success" | "failed" | "partial";

/**
 * Represents a row in the graph_sync_log table
 * Source: 11_graph.sql
 */
export interface GraphSyncLog {
  /** Primary key */
  id: string;
  projection_id: string;
  tenant_id: string;
  started_at: string;
  completed_at: string | null;
  status: GraphSyncLogStatus;
  nodes_created: number | null;
  nodes_updated: number | null;
  nodes_deleted: number | null;
  relationships_created: number | null;
  relationships_deleted: number | null;
  error_message: string | null;
  sync_checkpoint: string | null;
}

/** Insert type for graph_sync_log (excludes auto-generated fields) */
export interface GraphSyncLogInsert {
  projection_id: string;
  tenant_id: string;
  started_at?: string;
  completed_at?: string | null;
  status: GraphSyncLogStatus;
  nodes_created?: number | null;
  nodes_updated?: number | null;
  nodes_deleted?: number | null;
  relationships_created?: number | null;
  relationships_deleted?: number | null;
  error_message?: string | null;
  sync_checkpoint?: string | null;
}