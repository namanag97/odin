
/**
 * Represents a row in the petri_net_transitions table
 * Source: 05_discovery.sql
 */
export interface PetriNetTransitions {
  /** Primary key */
  id: string;
  petri_net_id: string;
  name: string;
  label: string | null;
  is_silent: number | null;
  activity_id: string | null;
  position_x: number | null;
  position_y: number | null;
  frequency: number | null;
}

/** Insert type for petri_net_transitions (excludes auto-generated fields) */
export interface PetriNetTransitionsInsert {
  petri_net_id: string;
  name: string;
  label?: string | null;
  is_silent?: number | null;
  activity_id?: string | null;
  position_x?: number | null;
  position_y?: number | null;
  frequency?: number | null;
}