export type ObjectRelationshipsCardinality = "one_to_one" | "one_to_many" | "many_to_one" | "many_to_many";

/**
 * Represents a row in the object_relationships table
 * Source: 19_ocpm_extended.sql
 */
export interface ObjectRelationships {
  /** Primary key */
  id: string;
  tenant_id: string;
  perspective_id: string;
  name: string;
  source_object_type_id: string;
  target_object_type_id: string;
  cardinality: ObjectRelationshipsCardinality;
  join_columns: string;
  is_embedded: number;
  display_name: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for object_relationships (excludes auto-generated fields) */
export interface ObjectRelationshipsInsert {
  tenant_id: string;
  perspective_id: string;
  name: string;
  source_object_type_id: string;
  target_object_type_id: string;
  cardinality: ObjectRelationshipsCardinality;
  join_columns: string;
  is_embedded?: number;
  display_name?: string | null;
  metadata?: Record<string, unknown> | null;
}