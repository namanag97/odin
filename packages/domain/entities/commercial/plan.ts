/**
 * Plan Entity - Commercial Layer
 * 
 * Product tier definition with features and limits.
 */

import type { 
  UUID, 
  ISODateTime, 
  NonNegativeInt,
  Percentage
} from '@odin/core-contracts';

import type { TenantTier } from '../existence/tenant';
import type { DiscoveryAlgorithm } from '@odin/core-contracts';

// ============================================================================
// Status & Visibility Types
// ============================================================================

/** Plan lifecycle status */
export type PlanStatus = 'active' | 'deprecated' | 'archived';

/** Plan visibility */
export type PlanVisibility = 'public' | 'private' | 'enterprise_only';

// ============================================================================
// Pricing Types
// ============================================================================

/** Pricing model type */
export type PricingModel = 'flat' | 'per_seat' | 'usage_based' | 'hybrid';

/** Supported currencies */
export type Currency = 'USD' | 'EUR' | 'GBP';

/** Usage metrics for metered billing */
export type UsageMetric = 
  | 'events_processed'
  | 'active_users'
  | 'data_storage_gb'
  | 'api_calls'
  | 'action_flow_executions';

/** Usage tier for tiered pricing */
export interface UsageTier {
  readonly upTo: number | 'unlimited';
  readonly pricePerUnit: number;
}

/** Usage rate configuration */
export interface UsageRate {
  readonly metric: UsageMetric;
  readonly tiers: readonly UsageTier[];
}

/** Plan pricing configuration */
export interface PlanPricing {
  readonly model: PricingModel;
  readonly basePriceMonthly: number;
  readonly basePriceYearly: number;
  readonly currency: Currency;
  readonly perSeatPrice?: number;
  readonly usageRates?: readonly UsageRate[];
}

// ============================================================================
// Features & Limits Types
// ============================================================================

/** Support level tiers */
export type SupportLevel = 'community' | 'email' | 'priority' | 'dedicated';

/** Plan features configuration */
export interface PlanFeatures {
  readonly maxUsers: number | 'unlimited';
  readonly maxDataPools: number | 'unlimited';
  readonly maxDataModels: number | 'unlimited';
  readonly maxEventLogSize: number;         // millions of events
  readonly discoveryAlgorithms: readonly DiscoveryAlgorithm[];
  readonly conformanceEnabled: boolean;
  readonly ocelEnabled: boolean;
  readonly actionFlowsEnabled: boolean;
  readonly skillsEnabled: boolean;
  readonly apiAccessEnabled: boolean;
  readonly ssoEnabled: boolean;
  readonly auditLogRetentionDays: number;
  readonly supportLevel: SupportLevel;
}

/** Plan limits configuration */
export interface PlanLimits {
  readonly apiRateLimit: number;            // requests per minute
  readonly maxConcurrentJobs: number;
  readonly maxStorageGB: number;
  readonly maxWebhooks: number;
  readonly maxIntegrations: number;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * Plan - Product tier definition
 */
export interface Plan {
  readonly id: UUID;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly tier: TenantTier;
  readonly status: PlanStatus;
  readonly visibility: PlanVisibility;
  readonly pricing: PlanPricing;
  readonly features: PlanFeatures;
  readonly limits: PlanLimits;
  readonly trialDays: NonNegativeInt;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new plan
 */
export interface CreatePlanData {
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly tier: TenantTier;
  readonly visibility: PlanVisibility;
  readonly pricing: PlanPricing;
  readonly features: PlanFeatures;
  readonly limits: PlanLimits;
  readonly trialDays?: NonNegativeInt;
}

/**
 * Data for updating a plan
 */
export interface UpdatePlanData {
  readonly name?: string;
  readonly description?: string;
  readonly visibility?: PlanVisibility;
  readonly pricing?: Partial<PlanPricing>;
  readonly features?: Partial<PlanFeatures>;
  readonly limits?: Partial<PlanLimits>;
  readonly trialDays?: NonNegativeInt;
}

// ============================================================================
// Comparison Types
// ============================================================================

/**
 * Plan comparison result
 */
export interface PlanComparison {
  readonly plans: readonly Plan[];
  readonly featureMatrix: Record<string, Record<UUID, boolean | string | number>>;
  readonly limitMatrix: Record<string, Record<UUID, number | 'unlimited'>>;
}
