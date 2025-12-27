import type { AsyncResult, DataPoolId, DataModelId, Duration, Percentage } from "@odin/core-contracts";
import type { DataModel } from "@odin/domain";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination } from "./tenant-service";

export interface IDataModelService extends IService {
  // Queries
  getDataModel(id: DataModelId, ctx: OperationContext): AsyncResult<DataModel>;
  listDataModels(input: ListDataModelsInput, ctx: OperationContext): AsyncResult<PaginatedResult<DataModel>>;
  getDataModelStatistics(id: DataModelId, ctx: OperationContext): AsyncResult<DataModelStatistics>;
  getLoadStatus(id: DataModelId, ctx: OperationContext): AsyncResult<LoadStatusInfo>;

  // Commands
  createDataModel(input: CreateDataModelInput, ctx: OperationContext): AsyncResult<DataModel>;
  updateDataModel(input: UpdateDataModelInput, ctx: OperationContext): AsyncResult<DataModel>;
  deleteDataModel(id: DataModelId, ctx: OperationContext): AsyncResult<void>;

  // Configuration
  configureObjectType(input: ConfigureObjectTypeInput, ctx: OperationContext): AsyncResult<DataModel>;
  removeObjectType(input: RemoveObjectTypeInput, ctx: OperationContext): AsyncResult<DataModel>;
  configureCaseCentric(input: ConfigureCaseCentricInput, ctx: OperationContext): AsyncResult<DataModel>;

  // Loading
  loadDataModel(input: LoadDataModelInput, ctx: OperationContext): AsyncResult<LoadJob>;
  reloadDataModel(id: DataModelId, ctx: OperationContext): AsyncResult<LoadJob>;
  cancelLoad(id: DataModelId, ctx: OperationContext): AsyncResult<void>;

  // Validation
  validateConfiguration(id: DataModelId, ctx: OperationContext): AsyncResult<ConfigurationValidation>;
}

// DTOs
export type DataModelType = 'case_centric' | 'object_centric';
export type LoadStatus = 'not_loaded' | 'loading' | 'loaded' | 'failed' | 'stale';
export type LoadType = 'full' | 'incremental';
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type LoadPhase =
  | 'initializing' | 'loading_events' | 'loading_objects'
  | 'building_relations' | 'computing_statistics' | 'finalizing';

export interface ObjectTypeConfig {
  readonly name: string;
  readonly table: string;
  readonly idColumn: string;
  readonly attributes?: readonly AttributeMapping[];
}

export interface AttributeMapping {
  readonly name: string;
  readonly column: string;
  readonly type: string;
}

export interface CaseCentricConfig {
  readonly caseTable: string;
  readonly caseIdColumn: string;
  readonly activityColumn: string;
  readonly timestampColumn: string;
}

export interface DateRange {
  readonly start: string;
  readonly end: string;
}

export interface DataModelStatistics {
  readonly eventCount: number;
  readonly objectCount: number;
  readonly caseCount?: number;
  readonly activityCount: number;
  readonly variantCount: number;
  readonly timeRange?: DateRange;
}

export interface CreateDataModelInput {
  readonly dataPoolId: DataPoolId;
  readonly name: string;
  readonly description?: string;
  readonly type: DataModelType;
}

export interface UpdateDataModelInput {
  readonly id: DataModelId;
  readonly name?: string;
  readonly description?: string;
}

export interface ListDataModelsInput {
  readonly dataPoolId?: DataPoolId;
  readonly type?: DataModelType;
  readonly status?: LoadStatus;
  readonly search?: string;
  readonly pagination?: Pagination;
}

export interface ConfigureObjectTypeInput {
  readonly dataModelId: DataModelId;
  readonly objectType: ObjectTypeConfig;
}

export interface RemoveObjectTypeInput {
  readonly dataModelId: DataModelId;
  readonly objectTypeName: string;
}

export interface ConfigureCaseCentricInput {
  readonly dataModelId: DataModelId;
  readonly config: CaseCentricConfig;
}

export interface LoadOptions {
  readonly validateData?: boolean;
  readonly computeStatistics?: boolean;
  readonly buildIndexes?: boolean;
  readonly dateRange?: DateRange;
}

export interface LoadDataModelInput {
  readonly dataModelId: DataModelId;
  readonly loadType: LoadType;
  readonly options?: LoadOptions;
}

export interface LoadProgress {
  readonly phase: LoadPhase;
  readonly percentage: Percentage;
  readonly eventsProcessed: number;
  readonly objectsProcessed: Record<string, number>;
  readonly currentTable?: string;
}

export interface LoadJob {
  readonly id: string;
  readonly dataModelId: DataModelId;
  readonly status: ExecutionStatus;
  readonly loadType: LoadType;
  readonly progress: LoadProgress;
  readonly statistics?: DataModelStatistics;
  readonly error?: string;
  readonly startedAt: string;
  readonly completedAt?: string;
}

export interface LoadStatusInfo {
  readonly status: LoadStatus;
  readonly lastLoadedAt?: string;
  readonly lastLoadDuration?: Duration;
  readonly staleSince?: string;
  readonly nextScheduledLoad?: string;
  readonly error?: string;
}

export interface ConfigurationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly objectType?: string;
}

export interface ConfigurationWarning {
  readonly code: string;
  readonly message: string;
  readonly recommendation?: string;
}

export interface ConfigurationValidation {
  readonly valid: boolean;
  readonly errors: readonly ConfigurationError[];
  readonly warnings: readonly ConfigurationWarning[];
}
