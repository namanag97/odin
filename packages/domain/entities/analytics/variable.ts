import type { UUID, ISODateTime } from "@odin/core-contracts";

export type VariableId = UUID;
export type VariableScopeType = 'knowledge_model' | 'view' | 'component';
export type VariableType = 'string' | 'number' | 'boolean' | 'date' | 'list';

export interface Variable {
  readonly id: VariableId;
  readonly scopeType: VariableScopeType;
  readonly scopeId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: VariableType;
  readonly defaultValue: unknown;
  readonly currentValue?: unknown;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateVariableData {
  readonly scopeType: VariableScopeType;
  readonly scopeId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: VariableType;
  readonly defaultValue: unknown;
}

export interface UpdateVariableData {
  readonly displayName?: string;
  readonly defaultValue?: unknown;
  readonly currentValue?: unknown;
}
