/**
 * OCEL Event Entity - Process Mining Domain
 *
 * OCEL 2.0 Event - can relate to multiple objects of different types.
 */

import type {
  EventId,
  DataModelId,
  ObjectId,
  ISODateTime,
} from '@odin/core-contracts';

// ============================================================================
// Event Object Reference
// ============================================================================

/**
 * Reference to an object involved in an event
 */
export interface EventObject {
  readonly objectType: string;
  readonly objectId: ObjectId;
  readonly qualifier?: string;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * OCELEvent - OCEL 2.0 Event entity
 */
export interface OCELEvent {
  readonly id: EventId;
  readonly dataModelId: DataModelId;
  readonly activity: string;
  readonly timestamp: ISODateTime;
  readonly objects: readonly EventObject[];
  readonly attributes: Record<string, unknown>;
}
