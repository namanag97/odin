/**
 * DataModel Entity - Process Mining Domain
 *
 * OCEL 2.0 compliant data model for object-centric process mining.
 */

import type {
  DataModelId,
  TenantId,
  DataPoolId,
  UserId,
  UUID,
  ISODateTime,
  PositiveInt,
  DataModelType,
  LoadStatus,
  DataType,
  DateRange,
} from '@odin/core-contracts';

// ============================================================================
// Type Definitions
// ============================================================================

/** Attribute aggregation type */
export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'first' | 'last';

// ============================================================================
// Configuration Interfaces
// ============================================================================

/**
 * Case-centric configuration (traditional process mining)
 */
export interface CaseCentricConfig {
  readonly activityTableId: UUID;
  readonly caseIdColumn: string;
  readonly activityColumn: string;
  readonly timestampColumn: string;
  readonly sortingColumn?: string;
  readonly additionalAttributes?: readonly DataModelAttributeMapping[];
}

/**
 * Object-centric configuration (OCEL 2.0)
 */
export interface ObjectCentricConfig {
  readonly eventTableId: UUID;
  readonly eventIdColumn: string;
  readonly activityColumn: string;
  readonly timestampColumn: string;
  readonly objectTypes: readonly ObjectTypeConfig[];
  readonly eventToObjectTableId?: UUID;
}

/**
 * Object type configuration for OCEL
 */
export interface ObjectTypeConfig {
  readonly name: string;
  readonly displayName?: string;
  readonly tableId: UUID;
  readonly objectIdColumn: string;
  readonly attributes: readonly DataModelAttributeMapping[];
  readonly color?: string;
}

/**
 * Attribute mapping configuration for data models
 */
export interface DataModelAttributeMapping {
  readonly name: string;
  readonly displayName?: string;
  readonly columnName: string;
  readonly dataType: DataType;
  readonly aggregation?: AggregationType;
}

/**
 * Data model configuration (case-centric or object-centric)
 */
export interface DataModelConfiguration {
  readonly caseCentric?: CaseCentricConfig;
  readonly objectCentric?: ObjectCentricConfig;
}

/**
 * Data model statistics
 */
export interface DataModelStatistics {
  readonly eventCount: number;
  readonly objectCounts: Record<string, number>;
  readonly activityCount: number;
  readonly uniqueActivities: readonly string[];
  readonly timeRange: DateRange;
  readonly avgEventsPerObject: Record<string, number>;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * DataModel - OCEL 2.0 compliant data model
 */
export interface DataModel {
  readonly id: DataModelId;
  readonly tenantId: TenantId;
  readonly dataPoolId: DataPoolId;
  readonly name: string;
  readonly description?: string;
  readonly type: DataModelType;
  readonly version: PositiveInt;
  readonly status: LoadStatus;
  readonly configuration: DataModelConfiguration;
  readonly statistics?: DataModelStatistics;
  readonly lastLoadedAt?: ISODateTime;
  readonly loadError?: string;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new DataModel
 */
export interface CreateDataModelData {
  readonly tenantId: TenantId;
  readonly dataPoolId: DataPoolId;
  readonly name: string;
  readonly description?: string;
  readonly type: DataModelType;
  readonly configuration: DataModelConfiguration;
  readonly createdBy: UserId;
}

/**
 * Data for updating a DataModel
 */
export interface UpdateDataModelData {
  readonly name?: string;
  readonly description?: string;
  readonly configuration?: Partial<DataModelConfiguration>;
}
