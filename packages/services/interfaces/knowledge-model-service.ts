import type {
  AsyncResult,
  UUID,
  DataModelId,
  ISODateTime,
  Percentage,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, SortConfig, FilterClause, DataType } from "./common";

/**
 * Knowledge model service for KPIs, records, filters, and variables.
 */
export interface IKnowledgeModelService extends IService {
  // Queries
  getKnowledgeModel(id: UUID, ctx: OperationContext): AsyncResult<KnowledgeModel>;
  getKnowledgeModelByKey(key: string, ctx: OperationContext): AsyncResult<KnowledgeModel>;
  getFullKnowledgeModel(id: UUID, ctx: OperationContext): AsyncResult<FullKnowledgeModel>;
  listKnowledgeModels(input: ListKMInput, ctx: OperationContext): AsyncResult<PaginatedResult<KnowledgeModel>>;

  // Commands
  createKnowledgeModel(input: CreateKMInput, ctx: OperationContext): AsyncResult<KnowledgeModel>;
  createExtension(input: CreateExtensionInput, ctx: OperationContext): AsyncResult<KnowledgeModel>;
  updateKnowledgeModel(input: UpdateKMInput, ctx: OperationContext): AsyncResult<KnowledgeModel>;
  deleteKnowledgeModel(id: UUID, ctx: OperationContext): AsyncResult<void>;

  // Publishing
  publishKnowledgeModel(id: UUID, ctx: OperationContext): AsyncResult<KnowledgeModel>;
  deprecateKnowledgeModel(id: UUID, ctx: OperationContext): AsyncResult<KnowledgeModel>;

  // KPIs
  createKPI(input: CreateKMKPIInput, ctx: OperationContext): AsyncResult<KMKPI>;
  updateKPI(input: UpdateKMKPIInput, ctx: OperationContext): AsyncResult<KMKPI>;
  deleteKPI(id: UUID, ctx: OperationContext): AsyncResult<void>;
  evaluateKPI(input: EvaluateKPIInput, ctx: OperationContext): AsyncResult<KMKPIValue>;
  evaluateMultipleKPIs(input: EvaluateMultipleKPIsInput, ctx: OperationContext): AsyncResult<readonly KMKPIValue[]>;

  // Records
  createRecord(input: CreateKMRecordInput, ctx: OperationContext): AsyncResult<KMRecord>;
  updateRecord(input: UpdateKMRecordInput, ctx: OperationContext): AsyncResult<KMRecord>;
  deleteRecord(id: UUID, ctx: OperationContext): AsyncResult<void>;
  addRecordAttribute(input: AddAttributeInput, ctx: OperationContext): AsyncResult<RecordAttribute>;
  updateRecordAttribute(input: UpdateAttributeInput, ctx: OperationContext): AsyncResult<RecordAttribute>;
  deleteRecordAttribute(id: UUID, ctx: OperationContext): AsyncResult<void>;
  queryRecordData(input: QueryRecordInput, ctx: OperationContext): AsyncResult<RecordDataResult>;

  // Filters
  createFilter(input: CreateKMFilterInput, ctx: OperationContext): AsyncResult<KMFilter>;
  updateFilter(input: UpdateKMFilterInput, ctx: OperationContext): AsyncResult<KMFilter>;
  deleteFilter(id: UUID, ctx: OperationContext): AsyncResult<void>;

  // Variables
  createVariable(input: CreateKMVariableInput, ctx: OperationContext): AsyncResult<KMVariable>;
  updateVariable(input: UpdateKMVariableInput, ctx: OperationContext): AsyncResult<KMVariable>;
  deleteVariable(id: UUID, ctx: OperationContext): AsyncResult<void>;
  setVariableValue(input: SetVariableValueInput, ctx: OperationContext): AsyncResult<KMVariable>;

  // Event Logs
  createEventLogConfig(input: CreateEventLogConfigInput, ctx: OperationContext): AsyncResult<EventLogConfig>;
  updateEventLogConfig(input: UpdateEventLogConfigInput, ctx: OperationContext): AsyncResult<EventLogConfig>;
  deleteEventLogConfig(id: UUID, ctx: OperationContext): AsyncResult<void>;

  // Validation
  validateKnowledgeModel(id: UUID, ctx: OperationContext): AsyncResult<KMValidation>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type PackageId = UUID;
export type PublishStatus = 'draft' | 'published' | 'deprecated';
export type FilterType = 'attribute' | 'case' | 'event' | 'object' | 'custom';
export type VariableScopeType = 'global' | 'package' | 'knowledge_model';
export type VariableType = 'string' | 'number' | 'boolean' | 'date' | 'selection' | 'multi_selection';
export type EventLogType = 'ocel' | 'case_centric';
export type AttributeSourceType = 'direct' | 'computed' | 'lookup' | 'aggregated';

// ═══════════════════════════════════════════════════════════════
// Core Types
// ═══════════════════════════════════════════════════════════════

export interface KnowledgeModel {
  readonly id: UUID;
  readonly packageId: PackageId;
  readonly dataModelId: DataModelId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: PublishStatus;
  readonly baseKnowledgeModelId?: UUID;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface FullKnowledgeModel extends KnowledgeModel {
  readonly kpis: readonly KMKPI[];
  readonly records: readonly KMRecord[];
  readonly filters: readonly KMFilter[];
  readonly variables: readonly KMVariable[];
  readonly eventLogConfigs: readonly EventLogConfig[];
}

export interface KMKPI {
  readonly id: UUID;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly category?: string;
  readonly expression: KMKPIExpression;
  readonly format: KMKPIFormat;
  readonly thresholds?: KMKPIThresholds;
  readonly isGlobal: boolean;
}

export interface KMKPIExpression {
  readonly type: 'pql' | 'formula' | 'python';
  readonly value: string;
}

export interface KMKPIFormat {
  readonly type: 'number' | 'percentage' | 'duration' | 'currency' | 'custom';
  readonly decimals?: number;
  readonly prefix?: string;
  readonly suffix?: string;
}

export interface KMKPIThresholds {
  readonly ok: number;
  readonly warning: number;
  readonly critical: number;
}

export interface KMRecord {
  readonly id: UUID;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly objectType: string;
  readonly identifierAttribute: string;
  readonly attributes: readonly RecordAttribute[];
}

export interface RecordAttribute {
  readonly id: UUID;
  readonly recordId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly sourceType: AttributeSourceType;
  readonly source: AttributeSource;
  readonly dataType: DataType;
  readonly format?: string;
  readonly isSearchable: boolean;
  readonly isFilterable: boolean;
}

export interface AttributeSource {
  readonly type: AttributeSourceType;
  readonly expression?: string;
  readonly sourceAttribute?: string;
  readonly aggregation?: string;
}

export interface KMFilter {
  readonly id: UUID;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: FilterType;
  readonly config: KMFilterConfig;
  readonly isGlobal: boolean;
  readonly isDefault: boolean;
}

export interface KMFilterConfig {
  readonly attribute?: string;
  readonly operator?: string;
  readonly defaultValue?: unknown;
  readonly options?: readonly FilterOption[];
}

export interface FilterOption {
  readonly label: string;
  readonly value: unknown;
}

export interface KMVariable {
  readonly id: UUID;
  readonly scopeType: VariableScopeType;
  readonly scopeId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: VariableType;
  readonly defaultValue: unknown;
  readonly currentValue: unknown;
  readonly validation?: VariableValidation;
}

export interface VariableValidation {
  readonly required?: boolean;
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: string;
  readonly options?: readonly unknown[];
}

export interface EventLogConfig {
  readonly id: UUID;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly description?: string;
  readonly type: EventLogType;
  readonly config: EventLogConfigDetails;
  readonly isDefault: boolean;
}

export interface EventLogConfigDetails {
  readonly caseIdAttribute?: string;
  readonly activityAttribute?: string;
  readonly timestampAttribute?: string;
  readonly objectTypes?: readonly string[];
  readonly additionalAttributes?: readonly string[];
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface CreateKMInput {
  readonly packageId: PackageId;
  readonly dataModelId: DataModelId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
}

export interface CreateExtensionInput {
  readonly packageId: PackageId;
  readonly baseKnowledgeModelId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
}

export interface UpdateKMInput {
  readonly id: UUID;
  readonly name?: string;
  readonly description?: string;
}

export interface ListKMInput {
  readonly packageId?: PackageId;
  readonly dataModelId?: DataModelId;
  readonly status?: PublishStatus;
  readonly search?: string;
  readonly pagination?: Pagination;
}

export interface CreateKMKPIInput {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly category?: string;
  readonly expression: KMKPIExpression;
  readonly format: KMKPIFormat;
  readonly thresholds?: KMKPIThresholds;
  readonly isGlobal?: boolean;
}

export interface UpdateKMKPIInput {
  readonly id: UUID;
  readonly name?: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly expression?: KMKPIExpression;
  readonly format?: KMKPIFormat;
  readonly thresholds?: KMKPIThresholds;
}

export interface EvaluateKPIInput {
  readonly kpiId: UUID;
  readonly filters?: readonly UUID[];
  readonly variables?: Record<string, unknown>;
}

export interface KMKPIValue {
  readonly kpiId: UUID;
  readonly kpiName: string;
  readonly value: unknown;
  readonly formattedValue: string;
  readonly thresholdStatus?: 'ok' | 'warning' | 'critical';
  readonly trend?: KMKPITrend;
  readonly computedAt: ISODateTime;
}

export interface KMKPITrend {
  readonly direction: 'up' | 'down' | 'stable';
  readonly percentageChange: Percentage;
  readonly comparedTo: ISODateTime;
}

export interface EvaluateMultipleKPIsInput {
  readonly kpiIds: readonly UUID[];
  readonly filters?: readonly UUID[];
  readonly variables?: Record<string, unknown>;
}

export interface CreateKMRecordInput {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly objectType: string;
  readonly identifierAttribute: string;
}

export interface UpdateKMRecordInput {
  readonly id: UUID;
  readonly name?: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly identifierAttribute?: string;
}

export interface AddAttributeInput {
  readonly recordId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly sourceType: AttributeSourceType;
  readonly source: AttributeSource;
  readonly dataType: DataType;
  readonly format?: string;
  readonly isSearchable?: boolean;
  readonly isFilterable?: boolean;
}

export interface UpdateAttributeInput {
  readonly id: UUID;
  readonly displayName?: string;
  readonly format?: string;
  readonly isSearchable?: boolean;
  readonly isFilterable?: boolean;
}

export interface QueryRecordInput {
  readonly recordId: UUID;
  readonly attributes?: readonly string[];
  readonly filters?: readonly FilterClause[];
  readonly search?: string;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

export interface RecordDataResult {
  readonly recordId: UUID;
  readonly columns: readonly RecordAttribute[];
  readonly rows: PaginatedResult<Record<string, unknown>>;
}

export interface CreateKMFilterInput {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: FilterType;
  readonly config: KMFilterConfig;
  readonly isGlobal?: boolean;
  readonly isDefault?: boolean;
}

export interface UpdateKMFilterInput {
  readonly id: UUID;
  readonly name?: string;
  readonly displayName?: string;
  readonly config?: KMFilterConfig;
  readonly isDefault?: boolean;
}

export interface CreateKMVariableInput {
  readonly scopeType: VariableScopeType;
  readonly scopeId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: VariableType;
  readonly defaultValue: unknown;
  readonly validation?: VariableValidation;
}

export interface UpdateKMVariableInput {
  readonly id: UUID;
  readonly displayName?: string;
  readonly defaultValue?: unknown;
  readonly validation?: VariableValidation;
}

export interface SetVariableValueInput {
  readonly variableId: UUID;
  readonly value: unknown;
}

export interface CreateEventLogConfigInput {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly description?: string;
  readonly type: EventLogType;
  readonly config: EventLogConfigDetails;
  readonly isDefault?: boolean;
}

export interface UpdateEventLogConfigInput {
  readonly id: UUID;
  readonly name?: string;
  readonly config?: Partial<EventLogConfigDetails>;
  readonly isDefault?: boolean;
}

export interface KMValidation {
  readonly valid: boolean;
  readonly errors: readonly KMValidationError[];
  readonly warnings: readonly KMValidationWarning[];
}

export interface KMValidationError {
  readonly code: string;
  readonly message: string;
  readonly component: 'kpi' | 'record' | 'filter' | 'event_log';
  readonly componentId?: UUID;
}

export interface KMValidationWarning {
  readonly code: string;
  readonly message: string;
  readonly recommendation: string;
}
