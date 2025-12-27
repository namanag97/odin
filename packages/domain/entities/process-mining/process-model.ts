/**
 * ProcessModel Entity - Process Mining Domain
 *
 * Discovered or imported process model supporting multiple PM4Py formats.
 */

import type {
  ProcessModelId,
  TenantId,
  DataModelId,
  UserId,
  ISODateTime,
  ProcessModelType,
  DiscoveryAlgorithm,
  ConformanceMethod,
} from '@odin/core-contracts';

import type { PetriNet } from './petri-net';
import type { ProcessTree } from './process-tree';
import type { DirectlyFollowsGraph } from './dfg';
import type { BPMNModel } from './bpmn';
import type { OCELPetriNet } from './ocel-petri-net';

// ============================================================================
// Source & Format Types
// ============================================================================

/** Model source type */
export type ModelSource = 'discovered' | 'imported' | 'designed';

/** Model serialization format */
export type ModelFormat =
  | 'petri_net'
  | 'process_tree'
  | 'bpmn'
  | 'dfg'
  | 'ocel_net'
  | 'powl';

// ============================================================================
// Process Model Content
// ============================================================================

/**
 * Process model content (one format per model)
 */
export interface ProcessModelContent {
  readonly petriNet?: PetriNet;
  readonly processTree?: ProcessTree;
  readonly dfg?: DirectlyFollowsGraph;
  readonly bpmn?: BPMNModel;
  readonly ocelNet?: OCELPetriNet;
  readonly serialized?: string;
  readonly serializationFormat?: 'json' | 'pnml' | 'bpmn_xml';
}

// ============================================================================
// Process Model Metadata
// ============================================================================

/**
 * Model quality metrics
 */
export interface ModelQualityMetrics {
  readonly fitness?: number;
  readonly precision?: number;
  readonly generalization?: number;
  readonly simplicity?: number;
}

/**
 * Process model metadata
 */
export interface ProcessModelMetadata {
  readonly discoveryAlgorithm?: DiscoveryAlgorithm;
  readonly discoveryParameters?: Record<string, unknown>;
  readonly sourceEventCount?: number;
  readonly sourceCaseCount?: number;
  readonly discoveredAt?: ISODateTime;
  readonly qualityMetrics?: ModelQualityMetrics;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * ProcessModel - Discovered or imported process model
 */
export interface ProcessModel {
  readonly id: ProcessModelId;
  readonly tenantId: TenantId;
  readonly dataModelId?: DataModelId;
  readonly name: string;
  readonly description?: string;
  readonly type: ProcessModelType;
  readonly source: ModelSource;
  readonly format: ModelFormat;
  readonly content: ProcessModelContent;
  readonly metadata: ProcessModelMetadata;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new ProcessModel
 */
export interface CreateProcessModelData {
  readonly tenantId: TenantId;
  readonly dataModelId?: DataModelId;
  readonly name: string;
  readonly description?: string;
  readonly type: ProcessModelType;
  readonly source: ModelSource;
  readonly format: ModelFormat;
  readonly content: ProcessModelContent;
  readonly metadata?: ProcessModelMetadata;
  readonly createdBy: UserId;
}

/**
 * Data for updating a ProcessModel
 */
export interface UpdateProcessModelData {
  readonly name?: string;
  readonly description?: string;
  readonly content?: ProcessModelContent;
  readonly metadata?: Partial<ProcessModelMetadata>;
}
