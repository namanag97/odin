/**
 * Tenant Entity - Existence Layer
 * 
 * Root isolation boundary for all data.
 * Everything in the system belongs to exactly one Tenant.
 */

import type { 
  TenantId, 
  ISODateTime, 
  PositiveInt 
} from '@odin/core-contracts';

// ============================================================================
// Status & Tier Types
// ============================================================================

/** Tenant lifecycle status */
export type TenantStatus = 'pending' | 'active' | 'suspended' | 'deleted';

/** Subscription tier */
export type TenantTier = 'free' | 'starter' | 'professional' | 'enterprise';

// ============================================================================
// Feature Flags
// ============================================================================

/**
 * Feature toggles available per tenant tier
 */
export interface TenantFeatures {
  readonly ocelSupport: boolean;
  readonly advancedConformance: boolean;
  readonly customIntegrations: boolean;
  readonly sso: boolean;
  readonly auditLogs: boolean;
  readonly apiAccess: boolean;
}

// ============================================================================
// Settings
// ============================================================================

/**
 * Tenant-level configuration
 */
export interface TenantSettings {
  readonly locale: string;
  readonly timezone: string;
  readonly dataRetentionDays: PositiveInt;
  readonly maxUsers: PositiveInt;
  readonly maxDataPools: PositiveInt;
  readonly maxStorageGB: PositiveInt;
  readonly features: TenantFeatures;
}

// ============================================================================
// Metadata
// ============================================================================

/**
 * Optional metadata for tenant profiling
 */
export interface TenantMetadata {
  readonly industry?: string;
  readonly companySize?: string;
  readonly source?: string;
  readonly customFields?: Record<string, unknown>;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * Tenant - Root isolation boundary
 */
export interface Tenant {
  readonly id: TenantId;
  /** URL-safe identifier */
  readonly slug: string;
  readonly name: string;
  readonly status: TenantStatus;
  readonly tier: TenantTier;
  readonly settings: TenantSettings;
  readonly metadata: TenantMetadata;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly suspendedAt?: ISODateTime;
  readonly deletedAt?: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new tenant
 */
export interface CreateTenantData {
  readonly slug: string;
  readonly name: string;
  readonly tier: TenantTier;
  readonly settings?: Partial<TenantSettings>;
  readonly metadata?: TenantMetadata;
}

/**
 * Data for updating a tenant
 */
export interface UpdateTenantData {
  readonly name?: string;
  readonly metadata?: TenantMetadata;
}
