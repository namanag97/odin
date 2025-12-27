import type { AsyncResult, TenantId, UUID, PageRequest, PageResponse } from "@odin/core-contracts";
import type { KnowledgeModel, KnowledgeModelId, CreateKnowledgeModelData, UpdateKnowledgeModelData, PublishStatus } from "../../entities/analytics/knowledge-model";

export interface IKnowledgeModelRepository {
  findById(id: KnowledgeModelId, tenantId: TenantId): AsyncResult<KnowledgeModel | null>;
  findByKey(key: string, tenantId: TenantId): AsyncResult<KnowledgeModel | null>;
  findByPackageId(packageId: UUID, tenantId: TenantId): AsyncResult<readonly KnowledgeModel[]>;
  findByDataModelId(dataModelId: UUID, tenantId: TenantId): AsyncResult<readonly KnowledgeModel[]>;
  findByStatus(status: PublishStatus, tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<KnowledgeModel>>;

  create(data: CreateKnowledgeModelData): AsyncResult<KnowledgeModel>;
  update(id: KnowledgeModelId, data: UpdateKnowledgeModelData, tenantId: TenantId): AsyncResult<KnowledgeModel>;
  delete(id: KnowledgeModelId, tenantId: TenantId): AsyncResult<void>;

  publish(id: KnowledgeModelId, tenantId: TenantId): AsyncResult<KnowledgeModel>;
  unpublish(id: KnowledgeModelId, tenantId: TenantId): AsyncResult<KnowledgeModel>;
}
