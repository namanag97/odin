/**
 * TenantService Implementation
 * Business logic for tenant lifecycle management
 */

import type { AsyncResult, TenantId, DateRange } from "@odin/core-contracts";
import { createNotFoundError, createValidationError } from "@odin/core-contracts";
import type {
  ITenantRepository,
  Tenant,
  TenantSettings,
  TenantStatus,
  CreateTenantData,
  UpdateTenantData,
} from "@odin/domain";
import type {
  ITenantService,
  OperationContext,
  CreateTenantInput,
  UpdateTenantInput,
  SuspendTenantInput,
  UpdateTenantSettingsInput,
  ListTenantsInput,
  TenantUsageSummary,
  LimitCheckResult,
  ResourceType,
} from "../interfaces";
import type { PaginatedResult } from "../interfaces/common";

export class TenantService implements ITenantService {
  readonly name = "TenantService";

  constructor(
    private readonly tenantRepository: ITenantRepository
  ) {}

  async getTenant(id: TenantId, ctx: OperationContext): AsyncResult<Tenant> {
    const result = await this.tenantRepository.findById(id);

    if (!result.success) return result;

    if (!result.data) {
      return {
        success: false,
        error: createNotFoundError("Tenant", id),
      };
    }

    return { success: true, data: result.data };
  }

  async getTenantBySlug(slug: string, ctx: OperationContext): AsyncResult<Tenant> {
    const result = await this.tenantRepository.findBySlug(slug);

    if (!result.success) return result;

    if (!result.data) {
      return {
        success: false,
        error: createNotFoundError("Tenant", slug),
      };
    }

    return { success: true, data: result.data };
  }

  async listTenants(
    options: ListTenantsInput,
    ctx: OperationContext
  ): AsyncResult<PaginatedResult<Tenant>> {
    const pageRequest = {
      page: options.pagination?.page || 1,
      limit: options.pagination?.limit || 50,
    };

    const result = await this.tenantRepository.findAll(pageRequest);

    if (!result.success) {
      return result as AsyncResult<PaginatedResult<Tenant>>;
    }

    // Apply additional filters if needed
    let items = result.data?.items || [];

    if (options.status) {
      items = items.filter((t: Tenant) => t.status === options.status);
    }

    if (options.search) {
      const search = options.search.toLowerCase();
      items = items.filter((t: Tenant) =>
        t.name.toLowerCase().includes(search) ||
        t.slug.toLowerCase().includes(search)
      );
    }

    return {
      success: true,
      data: {
        items,
        total: result.data?.total || 0,
        page: result.data?.page || 1,
        limit: result.data?.limit || 50,
        hasMore: result.data?.hasMore || false,
      },
    };
  }

  async createTenant(
    input: CreateTenantInput,
    ctx: OperationContext
  ): AsyncResult<Tenant> {
    // Validate slug is unique
    const slugCheck = await this.tenantRepository.slugExists(input.slug);

    if (!slugCheck.success) {
      return slugCheck as AsyncResult<Tenant>;
    }

    if (slugCheck.data) {
      return {
        success: false,
        error: createValidationError([
          {
            field: "slug",
            message: "Tenant slug already exists",
          },
        ]),
      };
    }

    // Create tenant data
    const data: CreateTenantData = {
      slug: input.slug,
      name: input.name,
      settings: {
        maxUsers: 10,
        maxDataPools: 5,
        maxStorage: 1073741824, // 1GB
        features: {
          processDiscovery: true,
          conformanceChecking: true,
          predictionModels: false,
        },
        ...input.settings,
      },
      createdBy: ctx.userId,
    };

    return await this.tenantRepository.create(data);
  }

  async updateTenant(
    input: UpdateTenantInput,
    ctx: OperationContext
  ): AsyncResult<Tenant> {
    // Check tenant exists
    const existing = await this.tenantRepository.findById(input.id);

    if (!existing.success) {
      return existing as AsyncResult<Tenant>;
    }

    if (!existing.data) {
      return {
        success: false,
        error: createNotFoundError("Tenant", input.id),
      };
    }

    const data: UpdateTenantData = {
      name: input.name,
    };

    return await this.tenantRepository.update(input.id, data);
  }

  async suspendTenant(
    input: SuspendTenantInput,
    ctx: OperationContext
  ): AsyncResult<Tenant> {
    const existing = await this.tenantRepository.findById(input.id);

    if (!existing.success) {
      return existing as AsyncResult<Tenant>;
    }

    if (!existing.data) {
      return {
        success: false,
        error: createNotFoundError("Tenant", input.id),
      };
    }

    return await this.tenantRepository.updateStatus(input.id, 'suspended');
  }

  async reactivateTenant(
    id: TenantId,
    ctx: OperationContext
  ): AsyncResult<Tenant> {
    const existing = await this.tenantRepository.findById(id);

    if (!existing.success) {
      return existing as AsyncResult<Tenant>;
    }

    if (!existing.data) {
      return {
        success: false,
        error: createNotFoundError("Tenant", id),
      };
    }

    return await this.tenantRepository.updateStatus(id, 'active');
  }

  async deleteTenant(id: TenantId, ctx: OperationContext): AsyncResult<void> {
    return await this.tenantRepository.softDelete(id);
  }

  async updateSettings(
    input: UpdateTenantSettingsInput,
    ctx: OperationContext
  ): AsyncResult<TenantSettings> {
    const result = await this.tenantRepository.updateSettings(
      input.tenantId,
      input.settings
    );

    if (!result.success) {
      return result as AsyncResult<TenantSettings>;
    }

    return {
      success: true,
      data: result.data!.settings,
    };
  }

  async getUsageSummary(
    id: TenantId,
    period: DateRange,
    ctx: OperationContext
  ): AsyncResult<TenantUsageSummary> {
    // TODO: Implement usage tracking by querying various repositories
    return {
      success: true,
      data: {
        tenantId: id,
        period,
        metrics: {},
        limitsStatus: {},
      },
    };
  }

  async checkLimits(
    id: TenantId,
    resource: ResourceType,
    ctx: OperationContext
  ): AsyncResult<LimitCheckResult> {
    const tenant = await this.tenantRepository.findById(id);

    if (!tenant.success || !tenant.data) {
      return {
        success: false,
        error: createNotFoundError("Tenant", id),
      };
    }

    // TODO: Implement actual usage checking
    const limit = this.getResourceLimit(tenant.data.settings, resource);
    const currentUsage = 0; // TODO: Query actual usage

    return {
      success: true,
      data: {
        allowed: currentUsage < limit,
        currentUsage,
        limit,
        remainingQuota: limit - currentUsage,
      },
    };
  }

  private getResourceLimit(settings: TenantSettings, resource: ResourceType): number {
    switch (resource) {
      case 'users':
        return settings.maxUsers;
      case 'data_pools':
        return settings.maxDataPools;
      case 'storage':
        return settings.maxStorage;
      default:
        return 0;
    }
  }
}

export function createTenantService(
  tenantRepository: ITenantRepository
): ITenantService {
  return new TenantService(tenantRepository);
}
