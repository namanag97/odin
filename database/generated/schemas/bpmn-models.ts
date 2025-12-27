/**
 * Zod schemas for bpmn_models table
 * Source: 05_discovery.sql
 */

import { z } from "zod";

/** Schema for a bpmn_models row */
export const BpmnModelsSchema = z.object({
  id: z.string().uuid(),
  discovered_model_id: z.string().uuid().nullable(),
  tenant_id: z.string().uuid(),
  bpmn_xml: z.string(),
  bpmn_json: z.string(),
  process_id: z.string().uuid().nullable(),
  pools: z.array(z.unknown()).nullable(),
  element_count: z.number().int().nullable(),
});

export type BpmnModels = z.infer<typeof BpmnModelsSchema>;

/** Schema for inserting a bpmn_models row */
export const BpmnModelsInsertSchema = z.object({
  discovered_model_id: z.string().uuid().nullable().optional(),
  tenant_id: z.string().uuid(),
  bpmn_xml: z.string(),
  bpmn_json: z.string(),
  process_id: z.string().uuid().nullable().optional(),
  pools: z.array(z.unknown()).nullable().optional(),
  element_count: z.number().int().nullable().optional(),
});

export type BpmnModelsInsert = z.infer<typeof BpmnModelsInsertSchema>;

/** Schema for updating a bpmn_models row */
export const BpmnModelsUpdateSchema = BpmnModelsInsertSchema.partial();

export type BpmnModelsUpdate = z.infer<typeof BpmnModelsUpdateSchema>;