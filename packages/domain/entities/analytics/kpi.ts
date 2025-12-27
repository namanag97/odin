import type { UUID, ISODateTime, ProcessModelId } from "@odin/core-contracts";

export type KpiId = UUID;

export type KPIExpressionType =
  | 'aggregate'          // Simple aggregation
  | 'time_metric'        // Throughput, waiting time, etc.
  | 'conformance'        // Fitness, precision
  | 'custom_python'      // PM4Py custom expression
  | 'ratio';             // Calculated ratio

export type AggregationType =
  | 'count' | 'sum' | 'avg' | 'min' | 'max'
  | 'distinct_count' | 'median' | 'stddev';

export type TimeMetricType =
  | 'throughput_time' | 'waiting_time' | 'processing_time'
  | 'lead_time' | 'cycle_time' | 'service_time';

export type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks';

export type ConformanceMethod =
  | 'token_based' | 'alignments' | 'footprint';

export type MetricType = 'fitness' | 'precision' | 'generalization' | 'simplicity';

export type FormatType = 'number' | 'percentage' | 'currency' | 'duration' | 'date';

export interface KPIExpression {
  readonly type: KPIExpressionType;
  readonly config: KPIExpressionConfig;
}

export interface KPIExpressionConfig {
  // For aggregate
  readonly aggregation?: AggregationType;
  readonly field?: string;
  readonly objectType?: string;

  // For time_metric
  readonly timeMetric?: TimeMetricType;
  readonly startActivity?: string;
  readonly endActivity?: string;
  readonly unit?: TimeUnit;

  // For conformance
  readonly processModelId?: ProcessModelId;
  readonly conformanceMethod?: ConformanceMethod;
  readonly metric?: MetricType;

  // For ratio
  readonly numerator?: string;              // KPI reference
  readonly denominator?: string;

  // For custom
  readonly pythonExpression?: string;
}

export interface KPIFormat {
  readonly type: FormatType;
  readonly decimals?: number;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly locale?: string;
}

export interface KPIThresholds {
  readonly warning?: number;
  readonly critical?: number;
  readonly target?: number;
  readonly direction: 'higher_is_better' | 'lower_is_better';
}

export interface KPI {
  readonly id: KpiId;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly category?: string;
  readonly expression: KPIExpression;
  readonly format: KPIFormat;
  readonly thresholds?: KPIThresholds;
  readonly isGlobal: boolean;
  readonly sortOrder: number;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateKPIData {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly category?: string;
  readonly expression: KPIExpression;
  readonly format: KPIFormat;
  readonly thresholds?: KPIThresholds;
  readonly isGlobal?: boolean;
  readonly sortOrder?: number;
}

export interface UpdateKPIData {
  readonly name?: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly category?: string;
  readonly expression?: KPIExpression;
  readonly format?: KPIFormat;
  readonly thresholds?: KPIThresholds;
  readonly sortOrder?: number;
}
