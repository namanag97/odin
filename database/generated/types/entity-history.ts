export type EntityHistoryOperation = "create" | "update" | "delete" | "restore";

/**
 * Represents a row in the entity_history table
 * Source: 24_temporal_layer.sql
 */
export interface EntityHistory {
  /** Primary key */
  id: string;
  entity_type: string;
  entity_id: string;
  version: number;
  operation: EntityHistoryOperation;
  data_before: string | null;
  data_after: string | null;
  changed_fields: string | null;
  changed_by: string | null;
  changed_at: string;
}

/** Insert type for entity_history (excludes auto-generated fields) */
export interface EntityHistoryInsert {
  entity_type: string;
  entity_id: string;
  version: number;
  operation: EntityHistoryOperation;
  data_before?: string | null;
  data_after?: string | null;
  changed_fields?: string | null;
  changed_by?: string | null;
  changed_at?: string;
}