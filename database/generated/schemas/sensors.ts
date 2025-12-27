/**
 * Zod schemas for sensors table
 * Source: 18_automation_enhanced.sql
 */

import { z } from "zod";

/** Schema for a sensors row */
export const SensorsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  knowledge_model_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  sensor_type: z.enum(["record_based", "data_model_based", "ml_based"]),
  record_id: z.string().uuid().nullable(),
  filter_id: z.string().uuid().nullable(),
  filter_expression: z.string().nullable(),
  identifier_columns: z.array(z.unknown()).nullable(),
  additional_columns: z.array(z.unknown()).nullable(),
  evaluation_trigger: z.enum(["data_model_reload", "km_publish", "scheduled", "manual"]),
  max_signals_per_evaluation: z.number().int().nullable(),
  status: z.enum(["active", "inactive"]),
  last_evaluated_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  last_signal_count: z.number().int().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_by: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Sensors = z.infer<typeof SensorsSchema>;

/** Schema for inserting a sensors row */
export const SensorsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  knowledge_model_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  sensor_type: z.enum(["record_based", "data_model_based", "ml_based"]),
  record_id: z.string().uuid().nullable().optional(),
  filter_id: z.string().uuid().nullable().optional(),
  filter_expression: z.string().nullable().optional(),
  identifier_columns: z.array(z.unknown()).nullable().optional(),
  additional_columns: z.array(z.unknown()).nullable().optional(),
  evaluation_trigger: z.enum(["data_model_reload", "km_publish", "scheduled", "manual"]).optional(),
  max_signals_per_evaluation: z.number().int().nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  last_evaluated_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  last_signal_count: z.number().int().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  created_by: z.string().nullable().optional(),
});

export type SensorsInsert = z.infer<typeof SensorsInsertSchema>;

/** Schema for updating a sensors row */
export const SensorsUpdateSchema = SensorsInsertSchema.partial();

export type SensorsUpdate = z.infer<typeof SensorsUpdateSchema>;