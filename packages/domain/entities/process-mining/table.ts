/**
 * Table Entity - Process Mining Domain
 * 
 * Data table within a DataPool with schema and import capabilities.
 */

import type {
  UUID,
  DataPoolId,
  ISODateTime,
  NonNegativeInt,
  Duration,
  DataType,
  TenantId,
  Brand,
} from '@odin/core-contracts';

// ============================================================================
// Branded IDs
// ============================================================================

/** Branded Table ID */
export type TableId = Brand<UUID, 'TableId'>;

/** Cast function for TableId */
export const asTableId = (id: string): TableId => id as unknown as TableId;

// ============================================================================
// Source Types
// ============================================================================

/** Supported table source types */
export type TableSourceType = 'csv' | 'xlsx' | 'parquet' | 'json' | 'database' | 'api';

/** Table type (alias for source type, used in repositories) */
export type TableType = TableSourceType;

/**
 * Configuration for table data source
 */
export interface TableSourceConfig {
  readonly connectionId?: UUID;
  readonly query?: string;
  readonly filePath?: string;
  readonly sheetName?: string;
  readonly options?: Record<string, unknown>;
}

// ============================================================================
// Column Types
// ============================================================================

/**
 * Column statistics
 */
export interface ColumnStatistics {
  readonly distinctCount: number;
  readonly nullCount: number;
  readonly minValue?: unknown;
  readonly maxValue?: unknown;
  readonly sampleValues?: readonly unknown[];
}

/**
 * Column definition
 */
export interface Column {
  readonly name: string;
  readonly displayName?: string;
  readonly dataType: DataType;
  readonly nullable: boolean;
  readonly isPrimaryKey: boolean;
  readonly isIndexed: boolean;
  readonly statistics?: ColumnStatistics;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * Table - Data table within a DataPool
 */
export interface Table {
  readonly id: TableId;
  readonly tenantId: TenantId;
  readonly dataPoolId: DataPoolId;
  readonly name: string;
  readonly displayName?: string;
  readonly sourceType: TableSourceType;
  readonly sourceConfig?: TableSourceConfig;
  readonly columns: readonly Column[];
  readonly primaryKey?: readonly string[];
  readonly rowCount: NonNegativeInt;
  readonly sizeBytes: NonNegativeInt;
  readonly lastLoadedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

// ============================================================================
// Import Types
// ============================================================================

/** Import source type */
export type ImportSource =
  | { readonly type: 'file'; readonly fileId: UUID }
  | { readonly type: 'raw'; readonly data: readonly Record<string, unknown>[] }
  | { readonly type: 'query'; readonly connectionId: UUID; readonly query: string };

/** Import mode */
export type ImportMode = 'replace' | 'append' | 'upsert';

/**
 * Column transformation during import
 */
export interface ColumnTransformation {
  readonly sourceColumn: string;
  readonly targetColumn: string;
  readonly transformation?: string;
  readonly defaultValue?: unknown;
}

/**
 * Import options
 */
export interface ImportOptions {
  readonly mode: ImportMode;
  readonly batchSize?: number;
  readonly skipErrors?: boolean;
  readonly validateTypes?: boolean;
  readonly transformations?: readonly ColumnTransformation[];
}

/**
 * Data for table import operation
 */
export interface TableImportData {
  readonly source: ImportSource;
  readonly options: ImportOptions;
}

/**
 * Import error detail
 */
export interface ImportError {
  readonly row: number;
  readonly column?: string;
  readonly message: string;
  readonly value?: unknown;
}

/**
 * Import operation result
 */
export interface ImportResult {
  readonly rowsImported: number;
  readonly rowsSkipped: number;
  readonly errors: readonly ImportError[];
  readonly duration: Duration;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new Table
 */
export interface CreateTableData {
  readonly dataPoolId: DataPoolId;
  readonly name: string;
  readonly displayName?: string;
  readonly sourceType: TableSourceType;
  readonly sourceConfig?: TableSourceConfig;
  readonly columns: readonly Column[];
  readonly primaryKey?: readonly string[];
}

/**
 * Data for updating a Table
 */
export interface UpdateTableData {
  readonly name?: string;
  readonly displayName?: string;
  readonly sourceConfig?: TableSourceConfig;
}
