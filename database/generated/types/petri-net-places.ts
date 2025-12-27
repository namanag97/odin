
/**
 * Represents a row in the petri_net_places table
 * Source: 05_discovery.sql
 */
export interface PetriNetPlaces {
  /** Primary key */
  id: string;
  petri_net_id: string;
  name: string;
  label: string | null;
  is_initial: number | null;
  is_final: number | null;
  position_x: number | null;
  position_y: number | null;
}

/** Insert type for petri_net_places (excludes auto-generated fields) */
export interface PetriNetPlacesInsert {
  petri_net_id: string;
  name: string;
  label?: string | null;
  is_initial?: number | null;
  is_final?: number | null;
  position_x?: number | null;
  position_y?: number | null;
}