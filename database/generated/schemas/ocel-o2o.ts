/**
 * Zod schemas for ocel_o2o table
 * Source: 03_ocel.sql
 */

import { z } from "zod";

/** Schema for a ocel_o2o row */
export const OcelO2oSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  source_object_id: z.string().uuid(),
  target_object_id: z.string().uuid(),
  relationship_type: z.string(),
  attributes: z.record(z.string(), z.unknown()).nullable(),
  valid_from: z.string().nullable(),
  valid_to: z.string().nullable(),
});

export type OcelO2o = z.infer<typeof OcelO2oSchema>;

/** Schema for inserting a ocel_o2o row */
export const OcelO2oInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  source_object_id: z.string().uuid(),
  target_object_id: z.string().uuid(),
  relationship_type: z.string(),
  attributes: z.record(z.string(), z.unknown()).nullable().optional(),
  valid_from: z.string().nullable().optional(),
  valid_to: z.string().nullable().optional(),
});

export type OcelO2oInsert = z.infer<typeof OcelO2oInsertSchema>;

/** Schema for updating a ocel_o2o row */
export const OcelO2oUpdateSchema = OcelO2oInsertSchema.partial();

export type OcelO2oUpdate = z.infer<typeof OcelO2oUpdateSchema>;