
/**
 * Represents a row in the data_retention_policies table
 * Source: 24_temporal_layer.sql
 */
export interface DataRetentionPolicies {
  /** Primary key */
  id: string;
  tenant_id: string | null;
  entity_type: string;
  retention_days: number;
  archive_after_days: number | null;
  delete_after_archive_days: number | null;
  is_active: number;
  last_applied_at: string | null;
  created_at: string;
}

/** Insert type for data_retention_policies (excludes auto-generated fields) */
export interface DataRetentionPoliciesInsert {
  tenant_id?: string | null;
  entity_type: string;
  retention_days: number;
  archive_after_days?: number | null;
  delete_after_archive_days?: number | null;
  is_active?: number;
  last_applied_at?: string | null;
}