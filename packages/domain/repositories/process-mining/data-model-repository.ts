/**
 * DataModel Repository Interface - Process Mining Layer
 *
 * Data access contract for DataModel entities.
 */

import type {
  DataModelId,
  TenantId,
  DataPoolId,
  AsyncResult,
  QueryOptions,
  LoadStatus,
} from '@odin/core-contracts';

import type {
  DataModel,
  DataModelConfiguration,
  DataModelStatistics,
  ObjectTypeConfig,
  CreateDataModelData,
  UpdateDataModelData,
} from '../../entities/process-mining/data-model';

/**
 * IDataModelRepository - DataModel data access contract
 */
export interface IDataModelRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  /**
   * Find a data model by ID
   */
  findById(id: DataModelId): AsyncResult<DataModel | null>;

  /**
   * Find data models by tenant ID
   */
  findByTenantId(tenantId: TenantId, options?: QueryOptions): AsyncResult<readonly DataModel[]>;

  /**
   * Find data models by data pool ID
   */
  findByDataPoolId(poolId: DataPoolId): AsyncResult<readonly DataModel[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  /**
   * Create a new data model
   */
  create(data: CreateDataModelData): AsyncResult<DataModel>;

  /**
   * Update data model fields
   */
  update(id: DataModelId, data: UpdateDataModelData): AsyncResult<DataModel>;

  /**
   * Delete a data model
   */
  delete(id: DataModelId): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Configuration
  // -------------------------------------------------------------------------

  /**
   * Update data model configuration
   */
  updateConfiguration(id: DataModelId, config: Partial<DataModelConfiguration>): AsyncResult<DataModel>;

  /**
   * Add an object type to OCEL configuration
   */
  addObjectType(id: DataModelId, objectType: ObjectTypeConfig): AsyncResult<DataModel>;

  /**
   * Remove an object type from OCEL configuration
   */
  removeObjectType(id: DataModelId, objectTypeName: string): AsyncResult<DataModel>;

  // -------------------------------------------------------------------------
  // Loading
  // -------------------------------------------------------------------------

  /**
   * Update data model load status
   */
  updateStatus(id: DataModelId, status: LoadStatus, error?: string): AsyncResult<DataModel>;

  /**
   * Update data model statistics
   */
  updateStatistics(id: DataModelId, stats: DataModelStatistics): AsyncResult<DataModel>;
}
