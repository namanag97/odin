import type { UUID, TenantId, UserId, ISODateTime, PositiveInt, PackageId, DataModelId } from "@odin/core-contracts";
import type { KPI } from "./kpi";
import type { Record } from "./record";
import type { Filter } from "./filter";
import type { Variable } from "./variable";
import type { EventLogConfig } from "./event-log-config";

export type KnowledgeModelId = UUID;
export type KnowledgeModelType = 'base' | 'extension';
export type PublishStatus = 'draft' | 'published' | 'deprecated';

export interface KnowledgeModel {
  readonly id: KnowledgeModelId;
  readonly tenantId: TenantId;
  readonly packageId: PackageId;
  readonly dataModelId: DataModelId;
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

export interface FullKnowledgeModel extends KnowledgeModel {
  readonly kpis: readonly KPI[];
  readonly records: readonly Record[];
  readonly filters: readonly Filter[];
  readonly variables: readonly Variable[];
  readonly eventLogs: readonly EventLogConfig[];
}

export interface CreateKnowledgeModelData {
  readonly tenantId: TenantId;
  readonly packageId: PackageId;
  readonly dataModelId: DataModelId;
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
