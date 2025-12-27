
/**
 * Represents a row in the petri_net_arcs table
 * Source: 05_discovery.sql
 */
export interface PetriNetArcs {
  /** Primary key */
  id: string;
  petri_net_id: string;
  source_place_id: string | null;
  source_transition_id: string | null;
  target_place_id: string | null;
  target_transition_id: string | null;
  weight: number | null;
}

/** Insert type for petri_net_arcs (excludes auto-generated fields) */
export interface PetriNetArcsInsert {
  petri_net_id: string;
  source_place_id?: string | null;
  source_transition_id?: string | null;
  target_place_id?: string | null;
  target_transition_id?: string | null;
  weight?: number | null;
}