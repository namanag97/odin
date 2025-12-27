
/**
 * Represents a row in the object_relationship_instances table
 * Source: 19_ocpm_extended.sql
 */
export interface ObjectRelationshipInstances {
  /** Primary key */
  id: string;
  tenant_id: string;
  relationship_id: string;
  source_object_id: string;
  target_object_id: string;
  valid_from: string | null;
  valid_to: string | null;
  /** JSON field */
  attributes: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for object_relationship_instances (excludes auto-generated fields) */
export interface ObjectRelationshipInstancesInsert {
  tenant_id: string;
  relationship_id: string;
  source_object_id: string;
  target_object_id: string;
  valid_from?: string | null;
  valid_to?: string | null;
  attributes?: Record<string, unknown> | null;
}