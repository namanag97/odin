/**
 * DataPoolService Implementation
 * Business logic for data pool management and table operations
 */

import type { AsyncResult, DataPoolId } from "@odin/core-contracts";
import { createNotFoundError, createValidationError } from "@odin/core-contracts";
import type {
  IDataPoolRepository,
  ITableRepository,
  DataPool,
  Table,
  CreateDataPoolData,
  UpdateDataPoolData,
  DataPoolStatistics,
} from "@odin/domain";
import type {
  IDataPoolService,
  OperationContext,
  CreateDataPoolInput,
  UpdateDataPoolInput,
  ListDataPoolsInput,
} from "../interfaces";
import type { PaginatedResult } from "../interfaces/common";

export class DataPoolService implements IDataPoolService {
  readonly name = "DataPoolService";

  constructor(
    private readonly dataPoolRepository: IDataPoolRepository,
    private readonly tableRepository?: ITableRepository
  ) {}

  async getDataPool(id: DataPoolId, ctx: OperationContext): AsyncResult<DataPool> {
    const result = await this.dataPoolRepository.findById(id);

    if (!result.success) return result;

    if (!result.data) {
      return {
        success: false,
        error: createNotFoundError("DataPool", id),
      };
    }

    return { success: true, data: result.data };
  }

  async listDataPools(
    input: ListDataPoolsInput,
    ctx: OperationContext
  ): AsyncResult<PaginatedResult<DataPool>> {
    const pageRequest = {
      page: input.pagination?.page || 1,
      limit: input.pagination?.limit || 50,
    };

    const result = await this.dataPoolRepository.findByTenantId(ctx.tenantId, pageRequest);

    if (!result.success) {
      return result as AsyncResult<PaginatedResult<DataPool>>;
    }

    let items = result.data?.items || [];

    // Apply filters
    if (input.status) {
      items = items.filter((p: DataPool) => p.status === input.status);
    }

    if (input.search) {
      const search = input.search.toLowerCase();
      items = items.filter((p: DataPool) =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
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

  async getDataPoolStatistics(
    id: DataPoolId,
    ctx: OperationContext
  ): AsyncResult<DataPoolStatistics> {
    const pool = await this.dataPoolRepository.findById(id);

    if (!pool.success || !pool.data) {
      return {
        success: false,
        error: createNotFoundError("DataPool", id),
      };
    }

    return {
      success: true,
      data: pool.data.statistics,
    };
  }

  async createDataPool(
    input: CreateDataPoolInput,
    ctx: OperationContext
  ): AsyncResult<DataPool> {
    // Validate name
    const nameValidation = await this.validatePoolName(input.name, ctx);
    if (!nameValidation.success) {
      return nameValidation as AsyncResult<DataPool>;
    }

    if (!nameValidation.data?.valid) {
      return {
        success: false,
        error: createValidationError([
          {
            field: "name",
            message: nameValidation.data?.errors?.[0] || "Invalid pool name",
          },
        ]),
      };
    }

    // Check for duplicate name
    const existing = await this.dataPoolRepository.findByName(ctx.tenantId, input.name);
    if (!existing.success) {
      return existing as AsyncResult<DataPool>;
    }

    if (existing.data) {
      return {
        success: false,
        error: createValidationError([
          {
            field: "name",
            message: "A data pool with this name already exists",
          },
        ]),
      };
    }

    const data: CreateDataPoolData = {
      tenantId: ctx.tenantId,
      name: input.name,
      description: input.description,
      settings: input.settings,
      createdBy: ctx.userId,
    };

    return await this.dataPoolRepository.create(data);
  }

  async updateDataPool(
    input: UpdateDataPoolInput,
    ctx: OperationContext
  ): AsyncResult<DataPool> {
    const existing = await this.dataPoolRepository.findById(input.id);

    if (!existing.success) {
      return existing as AsyncResult<DataPool>;
    }

    if (!existing.data) {
      return {
        success: false,
        error: createNotFoundError("DataPool", input.id),
      };
    }

    const data: UpdateDataPoolData = {
      name: input.name,
      description: input.description,
      settings: input.settings,
    };

    return await this.dataPoolRepository.update(input.id, data);
  }

  async archiveDataPool(id: DataPoolId, ctx: OperationContext): AsyncResult<void> {
    return await this.dataPoolRepository.archive(id);
  }

  async deleteDataPool(id: DataPoolId, ctx: OperationContext): AsyncResult<void> {
    return await this.dataPoolRepository.delete(id);
  }

  async getTables(poolId: DataPoolId, ctx: OperationContext): AsyncResult<readonly Table[]> {
    return await this.dataPoolRepository.getTables(poolId);
  }

  async validatePoolName(name: string, ctx: OperationContext): AsyncResult<any> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (name.length < 3) {
      errors.push("Name must be at least 3 characters");
    }

    if (name.length > 100) {
      errors.push("Name must be less than 100 characters");
    }

    if (!/^[a-zA-Z0-9_-\s]+$/.test(name)) {
      errors.push("Name can only contain letters, numbers, spaces, hyphens, and underscores");
    }

    return {
      success: true,
      data: {
        valid: errors.length === 0,
        errors,
        warnings,
      },
    };
  }
}

export function createDataPoolService(
  dataPoolRepository: IDataPoolRepository,
  tableRepository?: ITableRepository
): IDataPoolService {
  return new DataPoolService(dataPoolRepository, tableRepository);
}
