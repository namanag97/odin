import type { AsyncResult, TenantId, UUID, PageRequest, PageResponse } from "@odin/core-contracts";
import type { Execution, ExecutionId, CreateExecutionData, UpdateExecutionData, ExecutionStatus } from "../../entities/automation/execution";

export interface IExecutionRepository {
  findById(id: ExecutionId, tenantId: TenantId): AsyncResult<Execution | null>;
  findByActionFlowId(actionFlowId: UUID, tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Execution>>;
  findByStatus(status: ExecutionStatus, tenantId: TenantId): AsyncResult<readonly Execution[]>;

  create(data: CreateExecutionData): AsyncResult<Execution>;
  update(id: ExecutionId, data: UpdateExecutionData, tenantId: TenantId): AsyncResult<Execution>;
  delete(id: ExecutionId, tenantId: TenantId): AsyncResult<void>;
}
