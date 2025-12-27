
/**
 * Represents a row in the ocel_object_changes table
 * Source: 03_ocel.sql
 */
export interface OcelObjectChanges {
  /** Primary key */
  id: string;
  tenant_id: string;
  object_id: string;
  event_id: string | null;
  attribute_name: string;
  old_value: string | null;
  new_value: string;
  changed_at: string;
}

/** Insert type for ocel_object_changes (excludes auto-generated fields) */
export interface OcelObjectChangesInsert {
  tenant_id: string;
  object_id: string;
  event_id?: string | null;
  attribute_name: string;
  old_value?: string | null;
  new_value: string;
  changed_at: string;
}