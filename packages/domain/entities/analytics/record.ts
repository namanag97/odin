import type { UUID } from "@odin/core-contracts";

export type RecordId = UUID;
export type RecordAttributeId = UUID;

export type AttributeSourceType = 'column' | 'computed' | 'augmented';

export type DataType =
  | 'string' | 'number' | 'boolean' | 'date' | 'datetime'
  | 'json' | 'array' | 'object';

export type AttributeSource =
  | { type: 'column'; columnName: string }
  | { type: 'computed'; expression: string }
  | { type: 'augmented'; augmentedAttributeId: UUID };

export interface RecordAttribute {
  readonly id: RecordAttributeId;
  readonly recordId: RecordId;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly sourceType: AttributeSourceType;
  readonly source: AttributeSource;
  readonly dataType: DataType;
  readonly format?: string;
  readonly isSearchable: boolean;
  readonly isFilterable: boolean;
  readonly sortOrder: number;
}

export interface Record {
  readonly id: RecordId;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly objectType: string;
  readonly identifierAttribute: string;
  readonly attributes: readonly RecordAttribute[];
  readonly sortOrder: number;
}

export interface CreateRecordData {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly objectType: string;
  readonly identifierAttribute: string;
}

export interface UpdateRecordData {
  readonly name?: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly identifierAttribute?: string;
}

export interface CreateRecordAttributeData {
  readonly recordId: RecordId;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly sourceType: AttributeSourceType;
  readonly source: AttributeSource;
  readonly dataType: DataType;
  readonly format?: string;
  readonly isSearchable?: boolean;
  readonly isFilterable?: boolean;
  readonly sortOrder?: number;
}

export interface UpdateRecordAttributeData {
  readonly name?: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly format?: string;
  readonly isSearchable?: boolean;
  readonly isFilterable?: boolean;
  readonly sortOrder?: number;
}
