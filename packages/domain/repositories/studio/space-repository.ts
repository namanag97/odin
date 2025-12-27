import type { AsyncResult, TenantId, UserId, PageRequest, PageResponse } from "@odin/core-contracts";
import type { Space, SpaceId, CreateSpaceData, UpdateSpaceData, SpaceType } from "../../entities/studio/space";

export interface ISpaceRepository {
  findById(id: SpaceId, tenantId: TenantId): AsyncResult<Space | null>;
  findByTenantId(tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Space>>;
  findByOwnerId(ownerId: UserId, tenantId: TenantId): AsyncResult<readonly Space[]>;
  findByType(type: SpaceType, tenantId: TenantId): AsyncResult<readonly Space[]>;

  create(data: CreateSpaceData): AsyncResult<Space>;
  update(id: SpaceId, data: UpdateSpaceData, tenantId: TenantId): AsyncResult<Space>;
  delete(id: SpaceId, tenantId: TenantId): AsyncResult<void>;
}
