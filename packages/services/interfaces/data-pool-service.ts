import type { AsyncResult, DataPoolId } from "@odin/core-contracts";
import type { DataPool, Table } from "@odin/domain";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, SortConfig } from "./tenant-service";

export interface IDataPoolService extends IService {
  // Queries
  getDataPool(id: DataPoolId, ctx: OperationContext): AsyncResult<DataPool>;
  listDataPools(input: ListDataPoolsInput, ctx: OperationContext): AsyncResult<PaginatedResult<DataPool>>;
  getDataPoolStatistics(id: DataPoolId, ctx: OperationContext): AsyncResult<DataPoolStatistics>;

  // Commands
  createDataPool(input: CreateDataPoolInput, ctx: OperationContext): AsyncResult<DataPool>;
  updateDataPool(input: UpdateDataPoolInput, ctx: OperationContext): AsyncResult<DataPool>;
  archiveDataPool(id: DataPoolId, ctx: OperationContext): AsyncResult<void>;
  deleteDataPool(id: DataPoolId, ctx: OperationContext): AsyncResult<void>;

  // Tables
  getTables(poolId: DataPoolId, ctx: OperationContext): AsyncResult<readonly Table[]>;

  // Validation
  validatePoolName(name: string, ctx: OperationContext): AsyncResult<ValidationResult>;
}

// DTOs
export type DataPoolStatus = 'active' | 'archived';

export interface DataPoolSettings {
  readonly retentionDays?: number;
  readonly compressionEnabled?: boolean;
  readonly [key: string]: unknown;
}

export interface DataPoolStatistics {
  readonly tableCount: number;
  readonly totalRows: number;
  readonly totalSize: number;
  readonly lastUpdated?: string;
}

export interface CreateDataPoolInput {
  readonly name: string;
  readonly description?: string;
  readonly settings?: Partial<DataPoolSettings>;
}

export interface UpdateDataPoolInput {
  readonly id: DataPoolId;
  readonly name?: string;
  readonly description?: string;
  readonly settings?: Partial<DataPoolSettings>;
}

export interface ListDataPoolsInput {
  readonly status?: DataPoolStatus;
  readonly search?: string;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
}
