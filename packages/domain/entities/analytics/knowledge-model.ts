import type { UUID, TenantId, UserId, ISODateTime, PositiveInt } from "@odin/core-contracts";

export type KnowledgeModelId = UUID;
export type KnowledgeModelType = 'base' | 'extension';
export type PublishStatus = 'draft' | 'published' | 'deprecated';

export interface KnowledgeModel {
  readonly id: KnowledgeModelId;
  readonly tenantId: TenantId;
  readonly packageId: UUID;
  readonly dataModelId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: KnowledgeModelType;
  readonly baseKnowledgeModelId?: KnowledgeModelId;
  readonly status: PublishStatus;
  readonly version: PositiveInt;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly publishedAt?: ISODateTime;
  readonly createdBy: UserId;
}

export interface CreateKnowledgeModelData {
  readonly tenantId: TenantId;
  readonly packageId: UUID;
  readonly dataModelId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type?: KnowledgeModelType;
  readonly baseKnowledgeModelId?: KnowledgeModelId;
  readonly createdBy: UserId;
}

export interface UpdateKnowledgeModelData {
  readonly name?: string;
  readonly description?: string;
  readonly status?: PublishStatus;
}
