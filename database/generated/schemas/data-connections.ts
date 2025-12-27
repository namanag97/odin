/**
 * Zod schemas for data_connections table
 * Source: 01_core.sql
 */

import { z } from "zod";

/** Schema for a data_connections row */
export const DataConnectionsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid().nullable(),
  name: z.string(),
  connector_type: z.string(),
  connection_config: z.record(z.string(), z.unknown()),
  extraction_config: z.record(z.string(), z.unknown()).nullable(),
  status: z.enum(["connected", "disconnected", "error"]).nullable(),
  last_tested_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  last_sync_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type DataConnections = z.infer<typeof DataConnectionsSchema>;

/** Schema for inserting a data_connections row */
export const DataConnectionsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid().nullable().optional(),
  name: z.string(),
  connector_type: z.string(),
  connection_config: z.record(z.string(), z.unknown()),
  extraction_config: z.record(z.string(), z.unknown()).nullable().optional(),
  status: z.enum(["connected", "disconnected", "error"]).nullable().optional(),
  last_tested_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  last_sync_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type DataConnectionsInsert = z.infer<typeof DataConnectionsInsertSchema>;

/** Schema for updating a data_connections row */
export const DataConnectionsUpdateSchema = DataConnectionsInsertSchema.partial();

export type DataConnectionsUpdate = z.infer<typeof DataConnectionsUpdateSchema>;