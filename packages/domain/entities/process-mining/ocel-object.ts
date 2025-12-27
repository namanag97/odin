/**
 * OCEL Object Entity - Process Mining Domain
 *
 * OCEL 2.0 Object - lifecycle entity tracked across events.
 */

import type {
  ObjectId,
  DataModelId,
  ObjectTypeId,
  ISODateTime,
} from '@odin/core-contracts';

// ============================================================================
// Object Lifecycle
// ============================================================================

/**
 * Object lifecycle tracking
 */
export interface ObjectLifecycle {
  readonly createdAt: ISODateTime;
  readonly lastEventAt: ISODateTime;
  readonly eventCount: number;
  readonly activities: readonly string[];
}

// ============================================================================
// Entity
// ============================================================================

/**
 * OCELObject - OCEL 2.0 Object entity
 */
export interface OCELObject {
  readonly id: ObjectId;
  readonly dataModelId: DataModelId;
  readonly type: ObjectTypeId;
  readonly attributes: Record<string, unknown>;
  readonly lifecycle: ObjectLifecycle;
}

// ============================================================================
// Object Relationships
// ============================================================================

/**
 * Relationship between objects (O2O in OCEL 2.0)
 */
export interface ObjectRelation {
  readonly sourceObjectId: ObjectId;
  readonly targetObjectId: ObjectId;
  readonly qualifier: string;
  readonly timestamp?: ISODateTime;
}
