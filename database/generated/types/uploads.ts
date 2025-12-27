export type UploadsFormat = "xes" | "csv" | "ocel_json" | "ocel_xml" | "parquet";
export type UploadsStatus = "pending" | "processing" | "ready" | "error";

/**
 * Represents a row in the uploads table
 * Source: 00_uploads.sql
 */
export interface Uploads {
  /** Primary key */
  id: string;
  tenant_id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string | null;
  format: UploadsFormat | null;
  status: UploadsStatus | null;
  file_path: string;
  detected_schema: string | null;
  validation_result: string | null;
  created_at: string;
}

/** Insert type for uploads (excludes auto-generated fields) */
export interface UploadsInsert {
  tenant_id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type?: string | null;
  format?: UploadsFormat | null;
  status?: UploadsStatus | null;
  file_path: string;
  detected_schema?: string | null;
  validation_result?: string | null;
}