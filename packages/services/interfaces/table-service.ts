import type { AsyncResult, DataPoolId, Duration, Percentage } from "@odin/core-contracts";
import type { Table, Column } from "@odin/domain";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination } from "./tenant-service";

export interface ITableService extends IService {
  // Queries
  getTable(id: string, ctx: OperationContext): AsyncResult<Table>;
  listTables(input: ListTablesInput, ctx: OperationContext): AsyncResult<PaginatedResult<Table>>;
  getTableSchema(tableId: string, ctx: OperationContext): AsyncResult<readonly Column[]>;
  previewData(input: PreviewDataInput, ctx: OperationContext): AsyncResult<DataPreview>;

  // Commands
  createTable(input: CreateTableInput, ctx: OperationContext): AsyncResult<Table>;
  updateTable(input: UpdateTableInput, ctx: OperationContext): AsyncResult<Table>;
  deleteTable(id: string, ctx: OperationContext): AsyncResult<void>;

  // Import
  importFromFile(input: ImportFromFileInput, ctx: OperationContext): AsyncResult<ImportJob>;
  importFromData(input: ImportFromDataInput, ctx: OperationContext): AsyncResult<ImportResult>;
  getImportStatus(jobId: string, ctx: OperationContext): AsyncResult<ImportJob>;
  cancelImport(jobId: string, ctx: OperationContext): AsyncResult<void>;

  // Schema
  inferSchema(input: InferSchemaInput, ctx: OperationContext): AsyncResult<InferredSchema>;
  updateSchema(input: UpdateSchemaInput, ctx: OperationContext): AsyncResult<Table>;

  // Operations
  truncateTable(tableId: string, ctx: OperationContext): AsyncResult<void>;
  refreshStatistics(tableId: string, ctx: OperationContext): AsyncResult<Table>;
}

// DTOs
export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'json';
export type ImportMode = 'append' | 'replace' | 'upsert';
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like';

export interface ColumnDefinition {
  readonly name: string;
  readonly displayName?: string;
  readonly dataType: DataType;
  readonly nullable?: boolean;
}

export interface CreateTableInput {
  readonly dataPoolId: DataPoolId;
  readonly name: string;
  readonly displayName?: string;
  readonly columns: readonly ColumnDefinition[];
  readonly primaryKey?: readonly string[];
}

export interface UpdateTableInput {
  readonly tableId: string;
  readonly name?: string;
  readonly displayName?: string;
}

export interface ListTablesInput {
  readonly dataPoolId: DataPoolId;
  readonly search?: string;
  readonly pagination?: Pagination;
}

export interface FilterClause {
  readonly field: string;
  readonly operator: FilterOperator;
  readonly value: unknown;
}

export interface PreviewDataInput {
  readonly tableId: string;
  readonly limit?: number;
  readonly offset?: number;
  readonly columns?: readonly string[];
  readonly filters?: readonly FilterClause[];
}

export interface DataPreview {
  readonly columns: readonly Column[];
  readonly rows: readonly Record<string, unknown>[];
  readonly totalRows: number;
  readonly hasMore: boolean;
}

export interface FileImportOptions {
  readonly fileType: 'csv' | 'xlsx' | 'parquet' | 'json';
  readonly mode: ImportMode;
  readonly hasHeader?: boolean;
  readonly delimiter?: string;
  readonly sheetName?: string;
  readonly encoding?: string;
  readonly dateFormat?: string;
  readonly nullValues?: readonly string[];
  readonly columnMapping?: Record<string, string>;
  readonly skipRows?: number;
  readonly maxRows?: number;
}

export interface ImportFromFileInput {
  readonly dataPoolId: DataPoolId;
  readonly fileId: string;
  readonly tableName: string;
  readonly options: FileImportOptions;
}

export interface DataImportOptions {
  readonly mode: ImportMode;
  readonly batchSize?: number;
  readonly validateTypes?: boolean;
  readonly onError?: 'fail' | 'skip' | 'log';
}

export interface ImportFromDataInput {
  readonly tableId: string;
  readonly data: readonly Record<string, unknown>[];
  readonly options: DataImportOptions;
}

export interface ImportResult {
  readonly rowsInserted: number;
  readonly rowsUpdated: number;
  readonly rowsSkipped: number;
  readonly errors?: readonly string[];
  readonly duration: Duration;
}

export interface ImportProgress {
  readonly totalRows: number;
  readonly processedRows: number;
  readonly percentage: Percentage;
  readonly currentBatch: number;
  readonly totalBatches: number;
}

export interface ImportJob {
  readonly id: string;
  readonly tableId: string;
  readonly status: ExecutionStatus;
  readonly progress: ImportProgress;
  readonly result?: ImportResult;
  readonly error?: string;
  readonly startedAt: string;
  readonly completedAt?: string;
}

export interface InferSchemaInput {
  readonly fileId?: string;
  readonly data?: readonly Record<string, unknown>[];
  readonly sampleSize?: number;
}

export interface InferredColumn {
  readonly name: string;
  readonly inferredType: DataType;
  readonly nullable: boolean;
  readonly confidence: Percentage;
  readonly sampleValues: readonly unknown[];
}

export interface InferredSchema {
  readonly columns: readonly InferredColumn[];
  readonly confidence: Percentage;
  readonly warnings?: readonly string[];
}

export type SchemaOperation =
  | { type: 'add_column'; column: ColumnDefinition }
  | { type: 'drop_column'; columnName: string }
  | { type: 'rename_column'; oldName: string; newName: string }
  | { type: 'change_type'; columnName: string; newType: DataType };

export interface UpdateSchemaInput {
  readonly tableId: string;
  readonly operations: readonly SchemaOperation[];
}
