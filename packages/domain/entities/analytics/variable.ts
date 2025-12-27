import type { UUID } from "@odin/core-contracts";

export type VariableId = UUID;
export type VariableScopeType = 'knowledge_model' | 'view';

export type VariableType =
  | 'string' | 'number' | 'boolean' | 'date'
  | 'date_range' | 'selection' | 'multi_selection';

export interface VariableOption {
  readonly value: unknown;
  readonly label: string;
}

export interface VariableValidation {
  readonly required?: boolean;
  readonly options?: readonly VariableOption[];
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: string;
}

export interface Variable {
  readonly id: VariableId;
  readonly scopeType: VariableScopeType;
  readonly scopeId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: VariableType;
  readonly defaultValue: unknown;
  readonly currentValue?: unknown;
  readonly validation?: VariableValidation;
}

export interface CreateVariableData {
  readonly scopeType: VariableScopeType;
  readonly scopeId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: VariableType;
  readonly defaultValue: unknown;
  readonly validation?: VariableValidation;
}

export interface UpdateVariableData {
  readonly displayName?: string;
  readonly defaultValue?: unknown;
  readonly currentValue?: unknown;
  readonly validation?: VariableValidation;
}
