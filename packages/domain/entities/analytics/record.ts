import type { UUID } from "@odin/core-contracts";

export type RecordId = UUID;

export interface Record {
  readonly id: RecordId;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly objectType: string;
  readonly identifierAttribute: string;
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
