export type ForeignKeysCardinality = "1:1" | "1:N" | "N:1" | "N:M";

/**
 * Represents a row in the foreign_keys table
 * Source: 15_data_model.sql
 */
export interface ForeignKeys {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_model_id: string;
  name: string | null;
  source_table_id: string;
  source_columns: string;
  target_table_id: string;
  target_columns: string;
  cardinality: ForeignKeysCardinality;
  is_enforced: number;
  created_at: string;
}

/** Insert type for foreign_keys (excludes auto-generated fields) */
export interface ForeignKeysInsert {
  tenant_id: string;
  data_model_id: string;
  name?: string | null;
  source_table_id: string;
  source_columns: string;
  target_table_id: string;
  target_columns: string;
  cardinality?: ForeignKeysCardinality;
  is_enforced?: number;
}