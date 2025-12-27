import type {
  AsyncResult,
  UUID,
  DataModelId,
  ISODateTime,
  Duration,
  Percentage,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, DateRange, FilterClause } from "./common";

/**
 * Analytics service for KPIs, filters, variables, and knowledge models.
 */
export interface IAnalyticsService extends IService {
  // KPI Management
  createKpi(input: CreateKpiInput, ctx: OperationContext): AsyncResult<Kpi>;
  updateKpi(input: UpdateKpiInput, ctx: OperationContext): AsyncResult<Kpi>;
  deleteKpi(id: KpiId, ctx: OperationContext): AsyncResult<void>;
  getKpi(id: KpiId, ctx: OperationContext): AsyncResult<Kpi>;
  listKpis(input: ListKpisInput, ctx: OperationContext): AsyncResult<PaginatedResult<Kpi>>;

  // KPI Calculation
  calculateKpi(input: CalculateKpiInput, ctx: OperationContext): AsyncResult<KpiResult>;
  calculateMultipleKpis(input: CalculateMultipleKpisInput, ctx: OperationContext): AsyncResult<readonly KpiResult[]>;
  getKpiHistory(id: KpiId, period: DateRange, ctx: OperationContext): AsyncResult<KpiHistory>;

  // Filters
  createFilter(input: CreateAnalyticsFilterInput, ctx: OperationContext): AsyncResult<AnalyticsFilter>;
  updateFilter(input: UpdateAnalyticsFilterInput, ctx: OperationContext): AsyncResult<AnalyticsFilter>;
  deleteFilter(id: FilterId, ctx: OperationContext): AsyncResult<void>;
  getFilter(id: FilterId, ctx: OperationContext): AsyncResult<AnalyticsFilter>;
  listFilters(input: ListFiltersInput, ctx: OperationContext): AsyncResult<PaginatedResult<AnalyticsFilter>>;
  applyFilter(input: ApplyAnalyticsFilterInput, ctx: OperationContext): AsyncResult<AnalyticsFilterResult>;

  // Variables
  createVariable(input: CreateVariableInput, ctx: OperationContext): AsyncResult<AnalyticsVariable>;
  updateVariable(input: UpdateVariableInput, ctx: OperationContext): AsyncResult<AnalyticsVariable>;
  deleteVariable(id: VariableId, ctx: OperationContext): AsyncResult<void>;
  getVariable(id: VariableId, ctx: OperationContext): AsyncResult<AnalyticsVariable>;
  listVariables(input: ListVariablesInput, ctx: OperationContext): AsyncResult<PaginatedResult<AnalyticsVariable>>;

  // Records
  createRecord(input: CreateRecordInput, ctx: OperationContext): AsyncResult<AnalyticsRecord>;
  updateRecord(input: UpdateRecordInput, ctx: OperationContext): AsyncResult<AnalyticsRecord>;
  deleteRecord(id: RecordId, ctx: OperationContext): AsyncResult<void>;
  getRecord(id: RecordId, ctx: OperationContext): AsyncResult<AnalyticsRecord>;
  listRecords(input: ListRecordsInput, ctx: OperationContext): AsyncResult<PaginatedResult<AnalyticsRecord>>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type KpiId = UUID;
export type FilterId = UUID;
export type VariableId = UUID;
export type RecordId = UUID;

export type KpiCategory = 'performance' | 'cost' | 'quality' | 'compliance' | 'custom';
export type KpiStatus = 'excellent' | 'good' | 'warning' | 'critical' | 'unknown';
export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct';

export type LogicalOperator = 'and' | 'or';
export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'duration';
export type RecordType = 'calculated' | 'imported' | 'derived';

// ═══════════════════════════════════════════════════════════════
// Core Types
// ═══════════════════════════════════════════════════════════════

export interface Kpi {
  readonly id: KpiId;
  readonly dataModelId: DataModelId;
  readonly name: string;
  readonly description?: string;
  readonly category: KpiCategory;
  readonly formula: KpiFormula;
  readonly targetValue?: number;
  readonly thresholds?: KpiThresholds;
  readonly unit?: string;
  readonly metadata?: KpiMetadata;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface KpiFormula {
  readonly expression: string;
  readonly aggregation: AggregationType;
  readonly filters?: readonly FilterClause[];
}

export interface KpiThresholds {
  readonly excellent: number;
  readonly good: number;
  readonly warning: number;
  readonly critical: number;
}

export interface KpiMetadata {
  readonly owner?: string;
  readonly tags?: readonly string[];
  readonly refreshInterval?: Duration;
}

export interface AnalyticsFilter {
  readonly id: FilterId;
  readonly dataModelId: DataModelId;
  readonly name: string;
  readonly description?: string;
  readonly conditions: readonly FilterCondition[];
  readonly operator: LogicalOperator;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface FilterCondition {
  readonly field: string;
  readonly operator: string;
  readonly value: unknown;
}

export interface AnalyticsVariable {
  readonly id: VariableId;
  readonly dataModelId: DataModelId;
  readonly name: string;
  readonly description?: string;
  readonly expression: VariableExpression;
  readonly dataType: DataType;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface VariableExpression {
  readonly type: 'formula' | 'lookup' | 'constant';
  readonly value: string;
}

export interface AnalyticsRecord {
  readonly id: RecordId;
  readonly dataModelId: DataModelId;
  readonly type: RecordType;
  readonly data: RecordData;
  readonly metadata?: RecordMetadata;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface RecordData {
  readonly fields: Record<string, unknown>;
}

export interface RecordMetadata {
  readonly source?: string;
  readonly version?: number;
  readonly tags?: readonly string[];
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface CreateKpiInput {
  readonly name: string;
  readonly description?: string;
  readonly formula: KpiFormula;
  readonly dataModelId: DataModelId;
  readonly targetValue?: number;
  readonly thresholds?: KpiThresholds;
  readonly unit?: string;
  readonly metadata?: KpiMetadata;
}

export interface UpdateKpiInput {
  readonly id: KpiId;
  readonly name?: string;
  readonly description?: string;
  readonly formula?: KpiFormula;
  readonly targetValue?: number;
  readonly thresholds?: KpiThresholds;
}

export interface ListKpisInput {
  readonly dataModelId?: DataModelId;
  readonly category?: KpiCategory;
  readonly search?: string;
  readonly pagination?: Pagination;
}

export interface CalculateKpiInput {
  readonly kpiId: KpiId;
  readonly period?: DateRange;
  readonly filters?: readonly FilterClause[];
  readonly aggregation?: AggregationType;
}

export interface CalculateMultipleKpisInput {
  readonly kpiIds: readonly KpiId[];
  readonly period?: DateRange;
  readonly filters?: readonly FilterClause[];
}

export interface KpiResult {
  readonly kpiId: KpiId;
  readonly value: number;
  readonly unit?: string;
  readonly status: KpiStatus;
  readonly trend?: TrendInfo;
  readonly comparisonToPrevious?: ComparisonInfo;
  readonly calculatedAt: ISODateTime;
}

export interface TrendInfo {
  readonly direction: 'up' | 'down' | 'stable';
  readonly percentage: Percentage;
  readonly isPositive: boolean;
}

export interface ComparisonInfo {
  readonly previousValue: number;
  readonly delta: number;
  readonly deltaPercentage: Percentage;
}

export interface KpiHistory {
  readonly kpiId: KpiId;
  readonly period: DateRange;
  readonly dataPoints: readonly KpiDataPoint[];
  readonly summary: KpiHistorySummary;
}

export interface KpiDataPoint {
  readonly timestamp: ISODateTime;
  readonly value: number;
  readonly status: KpiStatus;
}

export interface KpiHistorySummary {
  readonly avg: number;
  readonly min: number;
  readonly max: number;
  readonly trend: TrendInfo;
  readonly volatility: number;
}

export interface CreateAnalyticsFilterInput {
  readonly name: string;
  readonly description?: string;
  readonly dataModelId: DataModelId;
  readonly conditions: readonly FilterCondition[];
  readonly operator: LogicalOperator;
}

export interface UpdateAnalyticsFilterInput {
  readonly id: FilterId;
  readonly name?: string;
  readonly description?: string;
  readonly conditions?: readonly FilterCondition[];
  readonly operator?: LogicalOperator;
}

export interface ListFiltersInput {
  readonly dataModelId?: DataModelId;
  readonly search?: string;
  readonly pagination?: Pagination;
}

export interface ApplyAnalyticsFilterInput {
  readonly filterId: FilterId;
  readonly targetType: 'cases' | 'events' | 'objects';
  readonly returnCount?: boolean;
}

export interface AnalyticsFilterResult {
  readonly filterId: FilterId;
  readonly matchCount: number;
  readonly totalCount: number;
  readonly percentage: Percentage;
  readonly executionTime: Duration;
}

export interface CreateVariableInput {
  readonly name: string;
  readonly description?: string;
  readonly dataModelId: DataModelId;
  readonly expression: VariableExpression;
  readonly dataType: DataType;
}

export interface UpdateVariableInput {
  readonly id: VariableId;
  readonly name?: string;
  readonly description?: string;
  readonly expression?: VariableExpression;
}

export interface ListVariablesInput {
  readonly dataModelId?: DataModelId;
  readonly dataType?: DataType;
  readonly search?: string;
  readonly pagination?: Pagination;
}

export interface CreateRecordInput {
  readonly dataModelId: DataModelId;
  readonly type: RecordType;
  readonly data: RecordData;
  readonly metadata?: RecordMetadata;
}

export interface UpdateRecordInput {
  readonly id: RecordId;
  readonly data?: Partial<RecordData>;
  readonly metadata?: Partial<RecordMetadata>;
}

export interface ListRecordsInput {
  readonly dataModelId?: DataModelId;
  readonly type?: RecordType;
  readonly dateRange?: DateRange;
  readonly search?: string;
  readonly pagination?: Pagination;
}
