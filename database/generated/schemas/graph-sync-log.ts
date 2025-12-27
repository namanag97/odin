/**
 * Zod schemas for graph_sync_log table
 * Source: 11_graph.sql
 */

import { z } from "zod";

/** Schema for a graph_sync_log row */
export const GraphSyncLogSchema = z.object({
  id: z.string().uuid(),
  projection_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  started_at: z.string().datetime({ offset: true }).or(z.string()),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  status: z.enum(["running", "success", "failed", "partial"]),
  nodes_created: z.number().int().nullable(),
  nodes_updated: z.number().int().nullable(),
  nodes_deleted: z.number().int().nullable(),
  relationships_created: z.number().int().nullable(),
  relationships_deleted: z.number().int().nullable(),
  error_message: z.string().nullable(),
  sync_checkpoint: z.string().nullable(),
});

export type GraphSyncLog = z.infer<typeof GraphSyncLogSchema>;

/** Schema for inserting a graph_sync_log row */
export const GraphSyncLogInsertSchema = z.object({
  projection_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  started_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  status: z.enum(["running", "success", "failed", "partial"]),
  nodes_created: z.number().int().nullable().optional(),
  nodes_updated: z.number().int().nullable().optional(),
  nodes_deleted: z.number().int().nullable().optional(),
  relationships_created: z.number().int().nullable().optional(),
  relationships_deleted: z.number().int().nullable().optional(),
  error_message: z.string().nullable().optional(),
  sync_checkpoint: z.string().nullable().optional(),
});

export type GraphSyncLogInsert = z.infer<typeof GraphSyncLogInsertSchema>;

/** Schema for updating a graph_sync_log row */
export const GraphSyncLogUpdateSchema = GraphSyncLogInsertSchema.partial();

export type GraphSyncLogUpdate = z.infer<typeof GraphSyncLogUpdateSchema>;