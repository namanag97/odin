/**
 * Process Mining Domain Events
 *
 * Events for data integration, modeling, and discovery operations.
 */

import type { Event } from '@odin/core-contracts';
import type {
  UUID,
  TenantId,
  UserId,
  DataPoolId,
  DataModelId,
  ProcessModelId,
  ISODateTime,
  Duration,
} from '@odin/core-contracts';
import type { DiscoveryAlgorithm, ConformanceMethod, ProcessModelType } from '@odin/core-contracts';
import type { DataModelStatistics } from '../entities/process-mining';

// ============================================================================
// Event Type Constants
// ============================================================================

export const ProcessMiningEventTypes = {
  // Data Pool events
  DATA_POOL_CREATED: 'data_pool.created',

  // Table events
  TABLE_IMPORTED: 'table.imported',

  // Data Model events
  DATA_MODEL_CREATED: 'data_model.created',
  DATA_MODEL_LOAD_STARTED: 'data_model.load_started',
  DATA_MODEL_LOAD_COMPLETED: 'data_model.load_completed',
  DATA_MODEL_LOAD_FAILED: 'data_model.load_failed',

  // Process Discovery events
  PROCESS_DISCOVERED: 'process.discovered',

  // Conformance events
  CONFORMANCE_CHECKED: 'conformance.checked',
} as const;

// ============================================================================
// Event Payloads
// ============================================================================

/** Payload for data_pool.created event */
export interface DataPoolCreatedPayload {
  readonly poolId: DataPoolId;
  readonly tenantId: TenantId;
  readonly name: string;
}

/** Payload for table.imported event */
export interface TableImportedPayload {
  readonly tableId: UUID;
  readonly poolId: DataPoolId;
  readonly rowCount: number;
  readonly duration: Duration;
}

/** Payload for data_model.created event */
export interface DataModelCreatedPayload {
  readonly modelId: DataModelId;
  readonly poolId: DataPoolId;
  readonly type: 'case_centric' | 'object_centric';
}

/** Payload for data_model.load_started event */
export interface DataModelLoadStartedPayload {
  readonly modelId: DataModelId;
  readonly triggeredBy: UserId | 'system';
}

/** Payload for data_model.load_completed event */
export interface DataModelLoadCompletedPayload {
  readonly modelId: DataModelId;
  readonly eventCount: number;
  readonly duration: Duration;
  readonly statistics: DataModelStatistics;
}

/** Payload for data_model.load_failed event */
export interface DataModelLoadFailedPayload {
  readonly modelId: DataModelId;
  readonly error: string;
  readonly stage: string;
}

/** Payload for process.discovered event */
export interface ProcessDiscoveredPayload {
  readonly modelId: ProcessModelId;
  readonly dataModelId: DataModelId;
  readonly algorithm: DiscoveryAlgorithm;
  readonly format: ProcessModelType;
  readonly duration: Duration;
}

/** Payload for conformance.checked event */
export interface ConformanceCheckedPayload {
  readonly dataModelId: DataModelId;
  readonly processModelId: ProcessModelId;
  readonly method: ConformanceMethod;
  readonly fitness: number;
  readonly duration: Duration;
}

// ============================================================================
// Typed Event Aliases
// ============================================================================

export type DataPoolCreatedEvent = Event<DataPoolCreatedPayload>;
export type TableImportedEvent = Event<TableImportedPayload>;
export type DataModelCreatedEvent = Event<DataModelCreatedPayload>;
export type DataModelLoadStartedEvent = Event<DataModelLoadStartedPayload>;
export type DataModelLoadCompletedEvent = Event<DataModelLoadCompletedPayload>;
export type DataModelLoadFailedEvent = Event<DataModelLoadFailedPayload>;
export type ProcessDiscoveredEvent = Event<ProcessDiscoveredPayload>;
export type ConformanceCheckedEvent = Event<ConformanceCheckedPayload>;
