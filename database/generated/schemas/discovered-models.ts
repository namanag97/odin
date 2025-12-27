/**
 * Zod schemas for discovered_models table
 * Source: 05_discovery.sql
 */

import { z } from "zod";

/** Schema for a discovered_models row */
export const DiscoveredModelsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid().nullable(),
  data_pool_id: z.string().uuid().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  algorithm: z.string(),
  algorithm_params: z.record(z.string(), z.unknown()).nullable(),
  model_type: z.enum(["petri_net", "bpmn", "dfg", "process_tree", "ocel_ocdfg"]),
  model_data: z.string(),
  model_file_path: z.string().nullable(),
  quality_metrics: z.record(z.string(), z.unknown()).nullable(),
  statistics: z.record(z.string(), z.unknown()).nullable(),
  perspective: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type DiscoveredModels = z.infer<typeof DiscoveredModelsSchema>;

/** Schema for inserting a discovered_models row */
export const DiscoveredModelsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  event_log_id: z.string().uuid().nullable().optional(),
  data_pool_id: z.string().uuid().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  algorithm: z.string(),
  algorithm_params: z.record(z.string(), z.unknown()).nullable().optional(),
  model_type: z.enum(["petri_net", "bpmn", "dfg", "process_tree", "ocel_ocdfg"]),
  model_data: z.string(),
  model_file_path: z.string().nullable().optional(),
  quality_metrics: z.record(z.string(), z.unknown()).nullable().optional(),
  statistics: z.record(z.string(), z.unknown()).nullable().optional(),
  perspective: z.string().nullable().optional(),
});

export type DiscoveredModelsInsert = z.infer<typeof DiscoveredModelsInsertSchema>;

/** Schema for updating a discovered_models row */
export const DiscoveredModelsUpdateSchema = DiscoveredModelsInsertSchema.partial();

export type DiscoveredModelsUpdate = z.infer<typeof DiscoveredModelsUpdateSchema>;