import type { UUID, ISODateTime } from "@odin/core-contracts";

export type FilterId = UUID;
export type FilterType = 'date_range' | 'attribute' | 'object_type' | 'activity' | 'custom';

export interface Filter {
  readonly id: FilterId;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: FilterType;
  readonly config: Record<string, unknown>;
  readonly isGlobal: boolean;
  readonly isDefault: boolean;
  readonly sortOrder: number;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateFilterData {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: FilterType;
  readonly config: Record<string, unknown>;
  readonly isGlobal?: boolean;
  readonly isDefault?: boolean;
}

export interface UpdateFilterData {
  readonly name?: string;
  readonly displayName?: string;
  readonly config?: Record<string, unknown>;
  readonly isDefault?: boolean;
}
