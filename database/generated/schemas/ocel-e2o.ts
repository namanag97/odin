/**
 * Zod schemas for ocel_e2o table
 * Source: 03_ocel.sql
 */

import { z } from "zod";

/** Schema for a ocel_e2o row */
export const OcelE2oSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  event_id: z.string().uuid(),
  object_id: z.string().uuid(),
  qualifier: z.string().nullable(),
  qualifier_value: z.string().nullable(),
});

export type OcelE2o = z.infer<typeof OcelE2oSchema>;

/** Schema for inserting a ocel_e2o row */
export const OcelE2oInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_pool_id: z.string().uuid(),
  event_id: z.string().uuid(),
  object_id: z.string().uuid(),
  qualifier: z.string().nullable().optional(),
  qualifier_value: z.string().nullable().optional(),
});

export type OcelE2oInsert = z.infer<typeof OcelE2oInsertSchema>;

/** Schema for updating a ocel_e2o row */
export const OcelE2oUpdateSchema = OcelE2oInsertSchema.partial();

export type OcelE2oUpdate = z.infer<typeof OcelE2oUpdateSchema>;