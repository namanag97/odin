import type { AsyncResult, TenantId, UUID, PageRequest, PageResponse } from "@odin/core-contracts";
import type { StudioPackage, PackageId, CreatePackageData, UpdatePackageData, PackageStatus } from "../../entities/studio/package";

export interface IPackageRepository {
  findById(id: PackageId, tenantId: TenantId): AsyncResult<StudioPackage | null>;
  findByKey(key: string, tenantId: TenantId): AsyncResult<StudioPackage | null>;
  findBySpaceId(spaceId: UUID, tenantId: TenantId): AsyncResult<readonly StudioPackage[]>;
  findByStatus(status: PackageStatus, tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<StudioPackage>>;

  create(data: CreatePackageData): AsyncResult<StudioPackage>;
  update(id: PackageId, data: UpdatePackageData, tenantId: TenantId): AsyncResult<StudioPackage>;
  delete(id: PackageId, tenantId: TenantId): AsyncResult<void>;
}
