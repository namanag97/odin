
/**
 * Represents a row in the petri_nets table
 * Source: 05_discovery.sql
 */
export interface PetriNets {
  /** Primary key */
  id: string;
  discovered_model_id: string;
  tenant_id: string;
  name: string | null;
  initial_marking: string;
  final_marking: string;
  /** JSON field */
  properties: Record<string, unknown> | null;
}

/** Insert type for petri_nets (excludes auto-generated fields) */
export interface PetriNetsInsert {
  discovered_model_id: string;
  tenant_id: string;
  name?: string | null;
  initial_marking: string;
  final_marking: string;
  properties?: Record<string, unknown> | null;
}