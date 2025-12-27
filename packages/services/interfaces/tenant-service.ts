import type { AsyncResult, TenantId, DateRange } from "@odin/core-contracts";
import type { Tenant, TenantSettings } from "@odin/domain";
import type { IService, OperationContext } from "./base";

export interface ITenantService extends IService {
  // Queries
  getTenant(id: TenantId, ctx: OperationContext): AsyncResult<Tenant>;
  getTenantBySlug(slug: string, ctx: OperationContext): AsyncResult<Tenant>;
  listTenants(options: ListTenantsInput, ctx: OperationContext): AsyncResult<PaginatedResult<Tenant>>;

  // Commands
  createTenant(input: CreateTenantInput, ctx: OperationContext): AsyncResult<Tenant>;
  updateTenant(input: UpdateTenantInput, ctx: OperationContext): AsyncResult<Tenant>;
  suspendTenant(input: SuspendTenantInput, ctx: OperationContext): AsyncResult<Tenant>;
  reactivateTenant(id: TenantId, ctx: OperationContext): AsyncResult<Tenant>;
  deleteTenant(id: TenantId, ctx: OperationContext): AsyncResult<void>;

  // Settings
  updateSettings(input: UpdateTenantSettingsInput, ctx: OperationContext): AsyncResult<TenantSettings>;

  // Usage
  getUsageSummary(id: TenantId, period: DateRange, ctx: OperationContext): AsyncResult<TenantUsageSummary>;
  checkLimits(id: TenantId, resource: ResourceType, ctx: OperationContext): AsyncResult<LimitCheckResult>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasMore: boolean;
}

export interface Pagination {
  readonly page: number;
  readonly limit: number;
}

export interface SortConfig {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
}

export type TenantTier = 'free' | 'starter' | 'professional' | 'enterprise';
export type TenantStatus = 'active' | 'suspended' | 'deleted';
export type Email = string;
export type TenantMetadata = Record<string, unknown>;

export interface CreateTenantInput {
  readonly slug: string;
  readonly name: string;
  readonly tier: TenantTier;
  readonly adminEmail: Email;
  readonly adminName: string;
  readonly settings?: Partial<TenantSettings>;
  readonly metadata?: TenantMetadata;
}

export interface UpdateTenantInput {
  readonly id: TenantId;
  readonly name?: string;
  readonly metadata?: Partial<TenantMetadata>;
}

export interface SuspendTenantInput {
  readonly id: TenantId;
  readonly reason: string;
  readonly notifyUsers: boolean;
}

export interface UpdateTenantSettingsInput {
  readonly tenantId: TenantId;
  readonly settings: Partial<TenantSettings>;
}

export interface ListTenantsInput {
  readonly status?: TenantStatus;
  readonly tier?: TenantTier;
  readonly search?: string;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

export type ResourceType = 'users' | 'data_pools' | 'storage' | 'api_calls';
export type UsageMetric = 'users' | 'data_pools' | 'storage' | 'api_calls' | 'events_processed';

export interface UsageSummary {
  readonly current: number;
  readonly limit: number;
  readonly unit: string;
}

export interface TenantUsageSummary {
  readonly tenantId: TenantId;
  readonly period: DateRange;
  readonly metrics: Record<UsageMetric, UsageSummary>;
  readonly limitsStatus: Record<string, LimitStatus>;
}

export interface LimitCheckResult {
  readonly allowed: boolean;
  readonly currentUsage: number;
  readonly limit: number;
  readonly remainingQuota: number;
  readonly resetAt?: string;
}

export interface LimitStatus {
  readonly current: number;
  readonly limit: number;
  readonly percentage: number;
  readonly status: 'ok' | 'warning' | 'exceeded';
}
