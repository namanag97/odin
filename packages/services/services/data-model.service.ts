/**
 * DataModelService Implementation
 * Business logic for OCEL 2.0 and case-centric data model configuration
 */

import type { AsyncResult, DataModelId, DataPoolId, UUID } from "@odin/core-contracts";
import { createNotFoundError, createValidationError } from "@odin/core-contracts";
import type {
  IDataModelRepository,
  IDataPoolRepository,
  DataModel,
  CreateDataModelData,
  UpdateDataModelData,
  DataModelConfiguration,
  ObjectTypeConfig,
  CaseCentricConfig,
  DataModelStatistics,
} from "@odin/domain";
import type {
  IDataModelService,
  OperationContext,
  CreateDataModelInput,
  UpdateDataModelInput,
  ListDataModelsInput,
  ConfigureObjectTypeInput,
  RemoveObjectTypeInput,
  ConfigureCaseCentricInput,
  LoadDataModelInput,
} from "../interfaces";
import type { PaginatedResult } from "../interfaces/common";

export class DataModelService implements IDataModelService {
  readonly name = "DataModelService";

  constructor(
    private readonly dataModelRepository: IDataModelRepository,
    private readonly dataPoolRepository: IDataPoolRepository
  ) {}

  async getDataModel(id: DataModelId, ctx: OperationContext): AsyncResult<DataModel> {
    const result = await this.dataModelRepository.findById(id);

    if (!result.success) return result;

    if (!result.data) {
      return {
        success: false,
        error: createNotFoundError("DataModel", id),
      };
    }

    return { success: true, data: result.data };
  }

  async listDataModels(
    input: ListDataModelsInput,
    ctx: OperationContext
  ): AsyncResult<PaginatedResult<DataModel>> {
    let models: readonly DataModel[];

    if (input.dataPoolId) {
      const result = await this.dataModelRepository.findByDataPoolId(input.dataPoolId);
      if (!result.success) {
        return result as AsyncResult<PaginatedResult<DataModel>>;
      }
      models = result.data || [];
    } else {
      const result = await this.dataModelRepository.findByTenantId(ctx.tenantId);
      if (!result.success) {
        return result as AsyncResult<PaginatedResult<DataModel>>;
      }
      models = result.data || [];
    }

    // Apply filters
    let filtered = models;

    if (input.type) {
      filtered = filtered.filter((m: DataModel) => m.type === input.type);
    }

    if (input.status) {
      filtered = filtered.filter((m: DataModel) => m.status === input.status);
    }

    if (input.search) {
      const search = input.search.toLowerCase();
      filtered = filtered.filter((m: DataModel) =>
        m.name.toLowerCase().includes(search) ||
        m.description?.toLowerCase().includes(search)
      );
    }

    // Pagination
    const page = input.pagination?.page || 1;
    const limit = input.pagination?.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return {
      success: true,
      data: {
        items: paginated,
        total: filtered.length,
        page,
        limit,
        hasMore: end < filtered.length,
      },
    };
  }

  async getDataModelStatistics(
    id: DataModelId,
    ctx: OperationContext
  ): AsyncResult<DataModelStatistics> {
    const model = await this.dataModelRepository.findById(id);

    if (!model.success || !model.data) {
      return {
        success: false,
        error: createNotFoundError("DataModel", id),
      };
    }

    if (!model.data.statistics) {
      return {
        success: false,
        error: createValidationError([
          {
            field: "statistics",
            message: "Data model has not been loaded yet",
          },
        ]),
      };
    }

    return {
      success: true,
      data: model.data.statistics,
    };
  }

  async getLoadStatus(id: DataModelId, ctx: OperationContext): AsyncResult<any> {
    const result = await this.dataModelRepository.findById(id);

    if (!result.success) return result;

    if (!result.data) {
      return {
        success: false,
        error: createNotFoundError("DataModel", id),
      };
    }

    return {
      success: true,
      data: {
        status: result.data.status,
        lastLoadedAt: result.data.lastLoadedAt,
        error: result.data.loadError,
      },
    };
  }

  async createDataModel(
    input: CreateDataModelInput,
    ctx: OperationContext
  ): AsyncResult<DataModel> {
    // Validate data pool exists
    const poolResult = await this.dataPoolRepository.findById(input.dataPoolId);

    if (!poolResult.success) {
      return poolResult as AsyncResult<DataModel>;
    }

    if (!poolResult.data) {
      return {
        success: false,
        error: createNotFoundError("DataPool", input.dataPoolId),
      };
    }

    // Initialize empty configuration based on type
    const configuration: DataModelConfiguration = {};

    const data: CreateDataModelData = {
      tenantId: ctx.tenantId,
      dataPoolId: input.dataPoolId,
      name: input.name,
      description: input.description,
      type: input.type,
      configuration,
      createdBy: ctx.userId,
    };

    return await this.dataModelRepository.create(data);
  }

  async updateDataModel(
    input: UpdateDataModelInput,
    ctx: OperationContext
  ): AsyncResult<DataModel> {
    const existing = await this.dataModelRepository.findById(input.id);

    if (!existing.success) {
      return existing as AsyncResult<DataModel>;
    }

    if (!existing.data) {
      return {
        success: false,
        error: createNotFoundError("DataModel", input.id),
      };
    }

    const data: UpdateDataModelData = {
      name: input.name,
      description: input.description,
      configuration: input.configuration,
    };

    return await this.dataModelRepository.update(input.id, data);
  }

  async deleteDataModel(id: DataModelId, ctx: OperationContext): AsyncResult<void> {
    return await this.dataModelRepository.delete(id);
  }

  async configureObjectType(
    input: ConfigureObjectTypeInput,
    ctx: OperationContext
  ): AsyncResult<DataModel> {
    return await this.dataModelRepository.addObjectType(
      input.dataModelId,
      input.objectType
    );
  }

  async removeObjectType(
    input: RemoveObjectTypeInput,
    ctx: OperationContext
  ): AsyncResult<DataModel> {
    return await this.dataModelRepository.removeObjectType(
      input.dataModelId,
      input.objectTypeName
    );
  }

  async configureCaseCentric(
    input: ConfigureCaseCentricInput,
    ctx: OperationContext
  ): AsyncResult<DataModel> {
    const existing = await this.dataModelRepository.findById(input.dataModelId);

    if (!existing.success) {
      return existing as AsyncResult<DataModel>;
    }

    if (!existing.data) {
      return {
        success: false,
        error: createNotFoundError("DataModel", input.dataModelId),
      };
    }

    return await this.dataModelRepository.updateConfiguration(
      input.dataModelId,
      { caseCentric: input.config }
    );
  }

  async loadDataModel(
    input: LoadDataModelInput,
    ctx: OperationContext
  ): AsyncResult<any> {
    // TODO: Implement data model loading logic
    // This would involve:
    // 1. Reading data from tables
    // 2. Applying configuration
    // 3. Building in-memory representation
    // 4. Updating statistics
    throw new Error("loadDataModel not yet implemented");
  }

  async reloadDataModel(id: DataModelId, ctx: OperationContext): AsyncResult<any> {
    return await this.loadDataModel(
      { dataModelId: id, loadType: 'full' },
      ctx
    );
  }

  async cancelLoad(id: DataModelId, ctx: OperationContext): AsyncResult<void> {
    // TODO: Implement load cancellation
    throw new Error("cancelLoad not yet implemented");
  }

  async validateConfiguration(
    id: DataModelId,
    ctx: OperationContext
  ): AsyncResult<any> {
    const result = await this.dataModelRepository.findById(id);

    if (!result.success) return result;

    if (!result.data) {
      return {
        success: false,
        error: createNotFoundError("DataModel", id),
      };
    }

    const errors: any[] = [];
    const warnings: any[] = [];
    const model = result.data;

    // Validate based on type
    if (model.type === 'object_centric') {
      if (!model.configuration.objectCentric) {
        errors.push({
          code: "NO_OBJECT_CONFIG",
          message: "Object-centric model must have object-centric configuration",
        });
      } else if (!model.configuration.objectCentric.objectTypes ||
                 model.configuration.objectCentric.objectTypes.length === 0) {
        errors.push({
          code: "NO_OBJECT_TYPES",
          message: "Object-centric model must have at least one object type configured",
        });
      }
    } else if (model.type === 'case_centric') {
      if (!model.configuration.caseCentric) {
        errors.push({
          code: "NO_CASE_CONFIG",
          message: "Case-centric model must have case-centric configuration",
        });
      }
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

export function createDataModelService(
  dataModelRepository: IDataModelRepository,
  dataPoolRepository: IDataPoolRepository
): IDataModelService {
  return new DataModelService(dataModelRepository, dataPoolRepository);
}
