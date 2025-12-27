/**
 * Zod schemas for perspectives table
 * Source: 19_ocpm_extended.sql
 */

import { z } from "zod";

/** Schema for a perspectives row */
export const PerspectivesSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  data_model_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  included_object_types: z.array(z.unknown()).nullable(),
  included_event_types: z.array(z.unknown()).nullable(),
  included_relationships: z.array(z.unknown()).nullable(),
  filter_expression: z.string().nullable(),
  is_default: z.number().int(),
  status: z.enum(["draft", "published", "deprecated"]),
  created_by: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
  published_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
});

export type Perspectives = z.infer<typeof PerspectivesSchema>;

/** Schema for inserting a perspectives row */
export const PerspectivesInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  data_model_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  included_object_types: z.array(z.unknown()).nullable().optional(),
  included_event_types: z.array(z.unknown()).nullable().optional(),
  included_relationships: z.array(z.unknown()).nullable().optional(),
  filter_expression: z.string().nullable().optional(),
  is_default: z.number().int().optional(),
  status: z.enum(["draft", "published", "deprecated"]).optional(),
  created_by: z.string().nullable().optional(),
  published_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type PerspectivesInsert = z.infer<typeof PerspectivesInsertSchema>;

/** Schema for updating a perspectives row */
export const PerspectivesUpdateSchema = PerspectivesInsertSchema.partial();

export type PerspectivesUpdate = z.infer<typeof PerspectivesUpdateSchema>;