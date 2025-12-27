/**
 * FeatureFlag Entity - Operational Layer
 * 
 * Feature flags with rules and conditions for
 * gradual rollouts and targeting.
 */

import type { 
  UUID, 
  TenantId,
  UserId,
  OrganizationId,
  ISODateTime,
  Percentage,
  EntityStatus,
  Email,
  FilterOperator
} from '@odin/core-contracts';

import type { TenantTier } from '../existence/tenant';
import type { EnvironmentType } from '../existence/environment';

// ============================================================================
// Types
// ============================================================================

/** Feature flag type */
export type FeatureFlagType = 'release' | 'experiment' | 'operational' | 'permission';

/** Feature condition attribute */
export type FeatureAttribute = 
  | 'tenantId' 
  | 'tenantTier' 
  | 'userId' 
  | 'userEmail'
  | 'organizationId' 
  | 'environment' 
  | 'planId';

// ============================================================================
// Conditions & Rules
// ============================================================================

/**
 * Single condition for a feature rule
 */
export interface FeatureCondition {
  readonly attribute: FeatureAttribute;
  readonly operator: FilterOperator;
  readonly value: unknown;
}

/**
 * Feature rule with conditions and value
 */
export interface FeatureRule {
  readonly id: UUID;
  readonly priority: number;
  readonly conditions: readonly FeatureCondition[];
  readonly value: boolean;
  readonly rolloutPercentage?: Percentage;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * FeatureFlag - Feature toggle with targeting rules
 */
export interface FeatureFlag {
  readonly id: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: FeatureFlagType;
  readonly defaultValue: boolean;
  readonly rules: readonly FeatureRule[];
  readonly status: EntityStatus;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

// ============================================================================
// Evaluation Context
// ============================================================================

/**
 * Context for evaluating feature flags
 */
export interface FeatureEvaluationContext {
  readonly tenantId: TenantId;
  readonly tenantTier: TenantTier;
  readonly userId?: UserId;
  readonly userEmail?: Email;
  readonly organizationId?: OrganizationId;
  readonly environment?: EnvironmentType;
  readonly planId?: UUID;
  readonly customAttributes?: Record<string, unknown>;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new feature flag
 */
export interface CreateFeatureFlagData {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: FeatureFlagType;
  readonly defaultValue: boolean;
  readonly rules?: readonly Omit<FeatureRule, 'id'>[];
}

/**
 * Data for updating a feature flag
 */
export interface UpdateFeatureFlagData {
  readonly name?: string;
  readonly description?: string;
  readonly defaultValue?: boolean;
  readonly rules?: readonly Omit<FeatureRule, 'id'>[];
  readonly status?: EntityStatus;
}
