/**
 * Table Repository Interface - Process Mining Layer
 *
 * Data access contract for Table entities.
 */

import type {
  UUID,
  DataPoolId,
  AsyncResult,
} from '@odin/core-contracts';

import type {
  Table,
  Column,
  TableImportData,
  ImportResult,
  CreateTableData,
  UpdateTableData,
} from '../../entities/process-mining/table';

/**
 * ITableRepository - Table data access contract
 */
export interface ITableRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  /**
   * Find a table by ID
   */
  findById(id: UUID): AsyncResult<Table | null>;

  /**
   * Find tables by data pool ID
   */
  findByDataPoolId(poolId: DataPoolId): AsyncResult<readonly Table[]>;

  /**
   * Find a table by name within a data pool
   */
  findByName(poolId: DataPoolId, name: string): AsyncResult<Table | null>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  /**
   * Create a new table
   */
  create(data: CreateTableData): AsyncResult<Table>;

  /**
   * Update table fields
   */
  update(id: UUID, data: UpdateTableData): AsyncResult<Table>;

  /**
   * Delete a table
   */
  delete(id: UUID): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Data Operations
  // -------------------------------------------------------------------------

  /**
   * Import data into a table
   */
  importData(tableId: UUID, data: TableImportData): AsyncResult<ImportResult>;

  /**
   * Truncate table data
   */
  truncate(tableId: UUID): AsyncResult<void>;

  /**
   * Preview table data
   */
  preview(tableId: UUID, limit?: number): AsyncResult<readonly Record<string, unknown>[]>;

  // -------------------------------------------------------------------------
  // Schema Operations
  // -------------------------------------------------------------------------

  /**
   * Update table schema
   */
  updateSchema(tableId: UUID, columns: readonly Column[]): AsyncResult<Table>;

  /**
   * Add a column to the table
   */
  addColumn(tableId: UUID, column: Column): AsyncResult<Table>;

  /**
   * Remove a column from the table
   */
  removeColumn(tableId: UUID, columnName: string): AsyncResult<Table>;

  // -------------------------------------------------------------------------
  // Statistics
  // -------------------------------------------------------------------------

  /**
   * Refresh table statistics
   */
  refreshStatistics(tableId: UUID): AsyncResult<Table>;
}
