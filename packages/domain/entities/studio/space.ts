import type { UUID, TenantId, UserId, ISODateTime, DataPoolId } from "@odin/core-contracts";

export type SpaceId = UUID;
export type SpaceVisibility = 'private' | 'team' | 'organization' | 'public';
export type SpaceType = SpaceVisibility; // Alias for compatibility
export type SpaceRole = 'viewer' | 'editor' | 'admin' | 'owner';

export type Permission = string; // Define specific permissions as needed

export interface SpaceSettings {
  readonly defaultPermissions: readonly Permission[];
  readonly allowPublicPackages: boolean;
  readonly dataPoolRestrictions?: readonly DataPoolId[];
}

export interface Space {
  readonly id: SpaceId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly visibility: SpaceVisibility;
  readonly settings: SpaceSettings;
  readonly memberCount: number;
  readonly packageCount: number;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

export interface SpaceMembership {
  readonly spaceId: SpaceId;
  readonly userId: UserId;
  readonly role: SpaceRole;
  readonly joinedAt: ISODateTime;
}

export interface CreateSpaceData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly visibility?: SpaceVisibility;
  readonly settings?: SpaceSettings;
  readonly createdBy: UserId;
}

export interface UpdateSpaceData {
  readonly name?: string;
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly visibility?: SpaceVisibility;
  readonly settings?: Partial<SpaceSettings>;
}
