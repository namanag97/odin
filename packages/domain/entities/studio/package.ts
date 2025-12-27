import type { UUID, TenantId, UserId, ISODateTime } from "@odin/core-contracts";

export type PackageId = UUID;
export type PackageStatus = 'draft' | 'published' | 'deprecated';

export interface StudioPackage {
  readonly id: PackageId;
  readonly tenantId: TenantId;
  readonly spaceId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly version: string;
  readonly status: PackageStatus;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly publishedAt?: ISODateTime;
  readonly createdBy: UserId;
}

// Alias for compatibility
export type Package = StudioPackage;

export interface CreatePackageData {
  readonly tenantId: TenantId;
  readonly spaceId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly createdBy: UserId;
}

export interface UpdatePackageData {
  readonly name?: string;
  readonly description?: string;
  readonly status?: PackageStatus;
}
