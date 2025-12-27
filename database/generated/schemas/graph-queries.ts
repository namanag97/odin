/**
 * Zod schemas for graph_queries table
 * Source: 11_graph.sql
 */

import { z } from "zod";

/** Schema for a graph_queries row */
export const GraphQueriesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.enum(["process_discovery", "sna", "pattern", "custom"]).nullable(),
  cypher_query: z.string(),
  parameters: z.array(z.unknown()).nullable(),
  return_type: z.enum(["nodes", "relationships", "paths", "scalar", "table"]).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type GraphQueries = z.infer<typeof GraphQueriesSchema>;

/** Schema for inserting a graph_queries row */
export const GraphQueriesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  category: z.enum(["process_discovery", "sna", "pattern", "custom"]).nullable().optional(),
  cypher_query: z.string(),
  parameters: z.array(z.unknown()).nullable().optional(),
  return_type: z.enum(["nodes", "relationships", "paths", "scalar", "table"]).nullable().optional(),
});

export type GraphQueriesInsert = z.infer<typeof GraphQueriesInsertSchema>;

/** Schema for updating a graph_queries row */
export const GraphQueriesUpdateSchema = GraphQueriesInsertSchema.partial();

export type GraphQueriesUpdate = z.infer<typeof GraphQueriesUpdateSchema>;