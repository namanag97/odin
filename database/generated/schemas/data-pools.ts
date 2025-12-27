/**
 * Zod schemas for data_pools table
 * Source: 01_core.sql
 */

import { z } from "zod";

/** Schema for a data_pools row */
export const DataPoolsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  pool_type: z.enum(["case_centric", "ocel", "hybrid"]),
  status: z.enum(["active", "archived", "error"]).nullable(),
  schema_version: z.number().int().nullable(),
  statistics: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type DataPools = z.infer<typeof DataPoolsSchema>;

/** Schema for inserting a data_pools row */
export const DataPoolsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  pool_type: z.enum(["case_centric", "ocel", "hybrid"]),
  status: z.enum(["active", "archived", "error"]).nullable().optional(),
  schema_version: z.number().int().nullable().optional(),
  statistics: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type DataPoolsInsert = z.infer<typeof DataPoolsInsertSchema>;

/** Schema for updating a data_pools row */
export const DataPoolsUpdateSchema = DataPoolsInsertSchema.partial();

export type DataPoolsUpdate = z.infer<typeof DataPoolsUpdateSchema>;