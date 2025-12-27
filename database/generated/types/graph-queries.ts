export type GraphQueriesCategory = "process_discovery" | "sna" | "pattern" | "custom";
export type GraphQueriesReturnType = "nodes" | "relationships" | "paths" | "scalar" | "table";

/**
 * Represents a row in the graph_queries table
 * Source: 11_graph.sql
 */
export interface GraphQueries {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  category: GraphQueriesCategory | null;
  cypher_query: string;
  /** JSON field */
  parameters: unknown[] | null;
  return_type: GraphQueriesReturnType | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for graph_queries (excludes auto-generated fields) */
export interface GraphQueriesInsert {
  tenant_id: string;
  name: string;
  description?: string | null;
  category?: GraphQueriesCategory | null;
  cypher_query: string;
  parameters?: unknown[] | null;
  return_type?: GraphQueriesReturnType | null;
}