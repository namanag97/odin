/**
 * Organization Entity - Existence Layer
 * 
 * Logical grouping within a Tenant.
 * Supports enterprise multi-org structures with hierarchies.
 */

import type { 
  TenantId, 
  OrganizationId, 
  SpaceId,
  ISODateTime, 
  PositiveInt,
  EntityStatus 
} from '@odin/core-contracts';

// ============================================================================
// Settings
// ============================================================================

/**
 * Organization-level configuration
 */
export interface OrganizationSettings {
  readonly defaultSpaceId?: SpaceId;
  readonly memberLimit?: PositiveInt;
  readonly inheritParentPermissions: boolean;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * Organization - Logical grouping within a Tenant
 */
export interface Organization {
  readonly id: OrganizationId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly slug: string;
  /** Parent organization for hierarchies */
  readonly parentId?: OrganizationId;
  readonly status: EntityStatus;
  readonly settings: OrganizationSettings;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new organization
 */
export interface CreateOrganizationData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly slug: string;
  readonly parentId?: OrganizationId;
  readonly settings?: Partial<OrganizationSettings>;
}

/**
 * Data for updating an organization
 */
export interface UpdateOrganizationData {
  readonly name?: string;
  readonly settings?: Partial<OrganizationSettings>;
}
