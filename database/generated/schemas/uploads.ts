/**
 * Zod schemas for uploads table
 * Source: 00_uploads.sql
 */

import { z } from "zod";

/** Schema for a uploads row */
export const UploadsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  filename: z.string(),
  original_filename: z.string(),
  file_size: z.number().int(),
  mime_type: z.string().nullable(),
  format: z.enum(["xes", "csv", "ocel_json", "ocel_xml", "parquet"]).nullable(),
  status: z.enum(["pending", "processing", "ready", "error"]).nullable(),
  file_path: z.string(),
  detected_schema: z.string().nullable(),
  validation_result: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Uploads = z.infer<typeof UploadsSchema>;

/** Schema for inserting a uploads row */
export const UploadsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  filename: z.string(),
  original_filename: z.string(),
  file_size: z.number().int(),
  mime_type: z.string().nullable().optional(),
  format: z.enum(["xes", "csv", "ocel_json", "ocel_xml", "parquet"]).nullable().optional(),
  status: z.enum(["pending", "processing", "ready", "error"]).nullable().optional(),
  file_path: z.string(),
  detected_schema: z.string().nullable().optional(),
  validation_result: z.string().nullable().optional(),
});

export type UploadsInsert = z.infer<typeof UploadsInsertSchema>;

/** Schema for updating a uploads row */
export const UploadsUpdateSchema = UploadsInsertSchema.partial();

export type UploadsUpdate = z.infer<typeof UploadsUpdateSchema>;