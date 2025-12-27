/**
 * Object-Centric Petri Net (OC-PN) Types - Process Mining Domain
 *
 * OCEL 2.0 Petri Net for object-centric process modeling.
 */

// ============================================================================
// OC Place
// ============================================================================

/**
 * Object-centric place
 */
export interface OCPlace {
  readonly id: string;
  readonly name?: string;
  readonly objectType: string;
  readonly isInitial: boolean;
  readonly isFinal: boolean;
}

// ============================================================================
// OC Transition
// ============================================================================

/**
 * Object-centric transition
 */
export interface OCTransition {
  readonly id: string;
  readonly name?: string;
  readonly label?: string;
  readonly isSilent: boolean;
  readonly consumedObjectTypes: readonly string[];
  readonly producedObjectTypes: readonly string[];
}

// ============================================================================
// OC Arc
// ============================================================================

/**
 * Object-centric arc
 */
export interface OCArc {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly objectType: string;
  readonly isVariable: boolean;
}

// ============================================================================
// OCEL Petri Net
// ============================================================================

/**
 * OCELPetriNet - Object-Centric Petri Net
 */
export interface OCELPetriNet {
  readonly objectTypes: readonly string[];
  readonly places: readonly OCPlace[];
  readonly transitions: readonly OCTransition[];
  readonly arcs: readonly OCArc[];
}
