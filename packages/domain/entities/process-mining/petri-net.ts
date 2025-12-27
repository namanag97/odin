/**
 * Petri Net Types - Process Mining Domain
 *
 * PM4Py-aligned Petri Net representation (core process model format).
 */

import type { PositiveInt } from '@odin/core-contracts';

// ============================================================================
// Place
// ============================================================================

/**
 * Petri Net place
 */
export interface Place {
  readonly id: string;
  readonly name?: string;
  readonly properties?: Record<string, unknown>;
}

// ============================================================================
// Transition
// ============================================================================

/**
 * Petri Net transition
 */
export interface Transition {
  readonly id: string;
  readonly name?: string;
  readonly label?: string;
  readonly isSilent: boolean;
  readonly properties?: Record<string, unknown>;
}

// ============================================================================
// Arc
// ============================================================================

/**
 * Petri Net arc (edge)
 */
export interface Arc {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly weight: PositiveInt;
}

// ============================================================================
// Marking
// ============================================================================

/**
 * Petri Net marking (token distribution)
 */
export interface Marking {
  readonly tokens: Record<string, number>;
}

// ============================================================================
// Petri Net
// ============================================================================

/**
 * Petri Net - Core PM4Py process model representation
 */
export interface PetriNet {
  readonly places: readonly Place[];
  readonly transitions: readonly Transition[];
  readonly arcs: readonly Arc[];
  readonly initialMarking: Marking;
  readonly finalMarkings: readonly Marking[];
}
