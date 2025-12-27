/**
 * Zod schemas for entity_history table
 * Source: 24_temporal_layer.sql
 */

import { z } from "zod";

/** Schema for a entity_history row */
export const EntityHistorySchema = z.object({
  id: z.string().uuid(),
  entity_type: z.string(),
  entity_id: z.string().uuid(),
  version: z.number().int(),
  operation: z.enum(["create", "update", "delete", "restore"]),
  data_before: z.string().nullable(),
  data_after: z.string().nullable(),
  changed_fields: z.string().nullable(),
  changed_by: z.string().nullable(),
  changed_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type EntityHistory = z.infer<typeof EntityHistorySchema>;

/** Schema for inserting a entity_history row */
export const EntityHistoryInsertSchema = z.object({
  entity_type: z.string(),
  entity_id: z.string().uuid(),
  version: z.number().int(),
  operation: z.enum(["create", "update", "delete", "restore"]),
  data_before: z.string().nullable().optional(),
  data_after: z.string().nullable().optional(),
  changed_fields: z.string().nullable().optional(),
  changed_by: z.string().nullable().optional(),
  changed_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
});

export type EntityHistoryInsert = z.infer<typeof EntityHistoryInsertSchema>;

/** Schema for updating a entity_history row */
export const EntityHistoryUpdateSchema = EntityHistoryInsertSchema.partial();

export type EntityHistoryUpdate = z.infer<typeof EntityHistoryUpdateSchema>;