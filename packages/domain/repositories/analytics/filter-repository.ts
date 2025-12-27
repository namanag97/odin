import type { AsyncResult, TenantId, UUID } from "@odin/core-contracts";
import type { Filter, FilterId, CreateFilterData, UpdateFilterData } from "../../entities/analytics/filter";

export interface IFilterRepository {
  findById(id: FilterId, tenantId: TenantId): AsyncResult<Filter | null>;
  findByKnowledgeModelId(knowledgeModelId: UUID, tenantId: TenantId): AsyncResult<readonly Filter[]>;
  findGlobal(tenantId: TenantId): AsyncResult<readonly Filter[]>;
  findDefault(knowledgeModelId: UUID, tenantId: TenantId): AsyncResult<readonly Filter[]>;

  create(data: CreateFilterData, tenantId: TenantId): AsyncResult<Filter>;
  update(id: FilterId, data: UpdateFilterData, tenantId: TenantId): AsyncResult<Filter>;
  delete(id: FilterId, tenantId: TenantId): AsyncResult<void>;
}
