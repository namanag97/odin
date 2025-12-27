import type { UUID, ISODateTime, FilterOperator } from "@odin/core-contracts";

export type FilterId = UUID;

export type FilterType =
  | 'attribute' | 'time_range' | 'variant'
  | 'activity' | 'object_type' | 'custom';

export interface FilterConfig {
  readonly objectType?: string;
  readonly field?: string;
  readonly operator?: FilterOperator;
  readonly value?: unknown;
  readonly values?: readonly unknown[];
  readonly dateField?: string;
  readonly activities?: readonly string[];
  readonly variantIds?: readonly string[];
  readonly pythonFilter?: string;
}

export interface Filter {
  readonly id: FilterId;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly type: FilterType;
  readonly config: FilterConfig;
  readonly isGlobal: boolean;
  readonly isDefault: boolean;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateFilterData {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly type: FilterType;
  readonly config: FilterConfig;
  readonly isGlobal?: boolean;
  readonly isDefault?: boolean;
}

export interface UpdateFilterData {
  readonly name?: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly config?: FilterConfig;
  readonly isDefault?: boolean;
}
