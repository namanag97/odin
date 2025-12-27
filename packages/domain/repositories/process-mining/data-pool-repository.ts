/**
 * DataPool Repository Interface - Process Mining Layer
 *
 * Data access contract for DataPool entities.
 */

import type {
  DataPoolId,
  TenantId,
  AsyncResult,
  QueryOptions,
} from '@odin/core-contracts';

import type {
  DataPool,
  DataPoolStatistics,
  CreateDataPoolData,
  UpdateDataPoolData,
} from '../../entities/process-mining/data-pool';

import type { Table } from '../../entities/process-mining/table';
import type { DataModel } from '../../entities/process-mining/data-model';

/**
 * IDataPoolRepository - DataPool data access contract
 */
export interface IDataPoolRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  /**
   * Find a data pool by ID
   */
  findById(id: DataPoolId): AsyncResult<DataPool | null>;

  /**
   * Find data pools by tenant ID
   */
  findByTenantId(tenantId: TenantId, options?: QueryOptions): AsyncResult<readonly DataPool[]>;

  /**
   * Find a data pool by name within a tenant
   */
  findByName(tenantId: TenantId, name: string): AsyncResult<DataPool | null>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  /**
   * Create a new data pool
   */
  create(data: CreateDataPoolData): AsyncResult<DataPool>;

  /**
   * Update data pool fields
   */
  update(id: DataPoolId, data: UpdateDataPoolData): AsyncResult<DataPool>;

  /**
   * Update data pool statistics
   */
  updateStatistics(id: DataPoolId, stats: Partial<DataPoolStatistics>): AsyncResult<DataPool>;

  /**
   * Archive a data pool
   */
  archive(id: DataPoolId): AsyncResult<void>;

  /**
   * Delete a data pool
   */
  delete(id: DataPoolId): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Domain Operations
  // -------------------------------------------------------------------------

  /**
   * Get all tables in a data pool
   */
  getTables(poolId: DataPoolId): AsyncResult<readonly Table[]>;

  /**
   * Get all data models in a data pool
   */
  getDataModels(poolId: DataPoolId): AsyncResult<readonly DataModel[]>;
}
