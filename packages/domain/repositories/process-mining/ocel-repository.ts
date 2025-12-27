/**
 * OCEL Repository Interface - Process Mining Layer
 *
 * Data access contract for OCEL event and object queries.
 */

import type {
  DataModelId,
  EventId,
  ObjectId,
  AsyncResult,
  PageRequest,
  PageResponse,
  QueryOptions,
  FilterOperator,
  DateRange,
  Duration,
} from '@odin/core-contracts';

import type {
  OCELEvent,
  EventObject,
} from '../../entities/process-mining/ocel-event';

import type {
  OCELObject,
  ObjectLifecycle,
  ObjectRelation,
} from '../../entities/process-mining/ocel-object';

/**
 * IOCELRepository - OCEL data access contract
 */
export interface IOCELRepository {
  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------

  /**
   * Get OCEL events with filtering and pagination
   */
  getEvents(
    modelId: DataModelId,
    options?: OCELQueryOptions
  ): AsyncResult<PageResponse<OCELEvent>>;

  /**
   * Get a single event by ID
   */
  getEventById(
    modelId: DataModelId,
    eventId: EventId
  ): AsyncResult<OCELEvent | null>;

  /**
   * Get events for a specific object
   */
  getEventsByObject(
    modelId: DataModelId,
    objectType: string,
    objectId: ObjectId,
    options?: QueryOptions
  ): AsyncResult<readonly OCELEvent[]>;

  /**
   * Get events by activity
   */
  getEventsByActivity(
    modelId: DataModelId,
    activity: string,
    options?: QueryOptions
  ): AsyncResult<PageResponse<OCELEvent>>;

  // -------------------------------------------------------------------------
  // Objects
  // -------------------------------------------------------------------------

  /**
   * Get OCEL objects by type
   */
  getObjects(
    modelId: DataModelId,
    objectType: string,
    options?: QueryOptions
  ): AsyncResult<PageResponse<OCELObject>>;

  /**
   * Get a single object by ID
   */
  getObjectById(
    modelId: DataModelId,
    objectType: string,
    objectId: ObjectId
  ): AsyncResult<OCELObject | null>;

  /**
   * Get all object types in the model
   */
  getObjectTypes(modelId: DataModelId): AsyncResult<readonly string[]>;

  /**
   * Get object lifecycle information
   */
  getObjectLifecycle(
    modelId: DataModelId,
    objectType: string,
    objectId: ObjectId
  ): AsyncResult<ObjectLifecycle>;

  // -------------------------------------------------------------------------
  // Relations
  // -------------------------------------------------------------------------

  /**
   * Get all relations for an object
   */
  getObjectRelations(
    modelId: DataModelId,
    objectId: ObjectId
  ): AsyncResult<readonly ObjectRelation[]>;

  /**
   * Get related objects
   */
  getRelatedObjects(
    modelId: DataModelId,
    objectId: ObjectId,
    qualifier?: string
  ): AsyncResult<readonly OCELObject[]>;

  // -------------------------------------------------------------------------
  // Aggregations
  // -------------------------------------------------------------------------

  /**
   * Get activity statistics
   */
  getActivityStatistics(
    modelId: DataModelId,
    filters?: readonly OCELFilter[]
  ): AsyncResult<readonly ActivityStatistic[]>;

  /**
   * Get object type statistics
   */
  getObjectTypeStatistics(
    modelId: DataModelId
  ): AsyncResult<readonly ObjectTypeStatistic[]>;
}

// ============================================================================
// Supporting Types
// ============================================================================

/**
 * OCEL query options
 */
export interface OCELQueryOptions extends QueryOptions {
  readonly objectTypes?: readonly string[];
  readonly activities?: readonly string[];
  readonly dateRange?: DateRange;
  readonly objectFilters?: readonly OCELFilter[];
}

/**
 * OCEL filter for events or objects
 */
export interface OCELFilter {
  readonly type: 'event' | 'object';
  readonly objectType?: string;
  readonly field: string;
  readonly operator: FilterOperator;
  readonly value: unknown;
}

/**
 * Activity statistics
 */
export interface ActivityStatistic {
  readonly activity: string;
  readonly eventCount: number;
  readonly objectTypeCounts: Record<string, number>;
  readonly avgDuration?: Duration;
  readonly firstOccurrence: string;
  readonly lastOccurrence: string;
}

/**
 * Object type statistics
 */
export interface ObjectTypeStatistic {
  readonly objectType: string;
  readonly objectCount: number;
  readonly totalEvents: number;
  readonly avgEventsPerObject: number;
  readonly uniqueActivities: number;
}
