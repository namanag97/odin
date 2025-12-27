/**
 * ProcessModel Repository Interface - Process Mining Layer
 *
 * Data access contract for ProcessModel entities.
 */

import type {
  ProcessModelId,
  TenantId,
  DataModelId,
  AsyncResult,
  QueryOptions,
} from '@odin/core-contracts';

import type {
  ProcessModel,
  ProcessModelContent,
  ModelQualityMetrics,
  ModelFormat,
  CreateProcessModelData,
  UpdateProcessModelData,
} from '../../entities/process-mining/process-model';

/**
 * IProcessModelRepository - ProcessModel data access contract
 */
export interface IProcessModelRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  /**
   * Find a process model by ID
   */
  findById(id: ProcessModelId): AsyncResult<ProcessModel | null>;

  /**
   * Find process models by tenant ID
   */
  findByTenantId(tenantId: TenantId, options?: QueryOptions): AsyncResult<readonly ProcessModel[]>;

  /**
   * Find process models by data model ID
   */
  findByDataModelId(dataModelId: DataModelId): AsyncResult<readonly ProcessModel[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  /**
   * Create a new process model
   */
  create(data: CreateProcessModelData): AsyncResult<ProcessModel>;

  /**
   * Update process model fields
   */
  update(id: ProcessModelId, data: UpdateProcessModelData): AsyncResult<ProcessModel>;

  /**
   * Update process model content
   */
  updateContent(id: ProcessModelId, content: ProcessModelContent): AsyncResult<ProcessModel>;

  /**
   * Update model quality metrics
   */
  updateMetrics(id: ProcessModelId, metrics: ModelQualityMetrics): AsyncResult<ProcessModel>;

  /**
   * Delete a process model
   */
  delete(id: ProcessModelId): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Format Conversion
  // -------------------------------------------------------------------------

  /**
   * Convert process model to a different format
   */
  convertTo(id: ProcessModelId, targetFormat: ModelFormat): AsyncResult<ProcessModelContent>;

  // -------------------------------------------------------------------------
  // Export
  // -------------------------------------------------------------------------

  /**
   * Export model to PNML format
   */
  exportToPNML(id: ProcessModelId): AsyncResult<string>;

  /**
   * Export model to BPMN format
   */
  exportToBPMN(id: ProcessModelId): AsyncResult<string>;

  /**
   * Export model to image
   */
  exportToImage(id: ProcessModelId, format: 'svg' | 'png'): AsyncResult<Uint8Array>;
}
