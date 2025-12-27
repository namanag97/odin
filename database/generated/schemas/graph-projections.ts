/**
 * Zod schemas for graph_projections table
 * Source: 11_graph.sql
 */

import { z } from "zod";

/** Schema for a graph_projections row */
export const GraphProjectionsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  source_type: z.enum(["event_log", "data_pool", "discovered_model"]),
  source_id: z.string().uuid(),
  projection_config: z.record(z.string(), z.unknown()),
  neo4j_database: z.string().nullable(),
  sync_mode: z.enum(["full", "incremental", "cdc"]).nullable(),
  sync_interval_seconds: z.number().int().nullable(),
  last_sync_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  last_sync_status: z.string().nullable(),
  is_active: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type GraphProjections = z.infer<typeof GraphProjectionsSchema>;

/** Schema for inserting a graph_projections row */
export const GraphProjectionsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  source_type: z.enum(["event_log", "data_pool", "discovered_model"]),
  source_id: z.string().uuid(),
  projection_config: z.record(z.string(), z.unknown()),
  neo4j_database: z.string().nullable().optional(),
  sync_mode: z.enum(["full", "incremental", "cdc"]).nullable().optional(),
  sync_interval_seconds: z.number().int().nullable().optional(),
  last_sync_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  last_sync_status: z.string().nullable().optional(),
  is_active: z.number().int().nullable().optional(),
});

export type GraphProjectionsInsert = z.infer<typeof GraphProjectionsInsertSchema>;

/** Schema for updating a graph_projections row */
export const GraphProjectionsUpdateSchema = GraphProjectionsInsertSchema.partial();

export type GraphProjectionsUpdate = z.infer<typeof GraphProjectionsUpdateSchema>;