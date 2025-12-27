import type { UUID, TenantId, UserId, ISODateTime } from "@odin/core-contracts";

export type SpaceId = UUID;
export type SpaceType = 'personal' | 'team' | 'public';

export interface Space {
  readonly id: SpaceId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly type: SpaceType;
  readonly ownerId: UserId;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateSpaceData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly type: SpaceType;
  readonly ownerId: UserId;
}

export interface UpdateSpaceData {
  readonly name?: string;
  readonly description?: string;
}
