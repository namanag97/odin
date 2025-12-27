import type { AsyncResult, TenantId, UUID, PageRequest, PageResponse } from "@odin/core-contracts";
import type { View, ViewId, CreateViewData, UpdateViewData, ViewType } from "../../entities/studio/view";

export interface IViewRepository {
  findById(id: ViewId, tenantId: TenantId): AsyncResult<View | null>;
  findByKey(key: string, tenantId: TenantId): AsyncResult<View | null>;
  findByPackageId(packageId: UUID, tenantId: TenantId): AsyncResult<readonly View[]>;
  findByType(type: ViewType, tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<View>>;

  create(data: CreateViewData): AsyncResult<View>;
  update(id: ViewId, data: UpdateViewData, tenantId: TenantId): AsyncResult<View>;
  delete(id: ViewId, tenantId: TenantId): AsyncResult<void>;
}
