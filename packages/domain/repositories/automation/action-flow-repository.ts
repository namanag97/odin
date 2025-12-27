import type { AsyncResult, TenantId, PageRequest, PageResponse } from "@odin/core-contracts";
import type { ActionFlow, ActionFlowId, CreateActionFlowData, UpdateActionFlowData, ActionFlowStatus } from "../../entities/automation/action-flow";

export interface IActionFlowRepository {
  findById(id: ActionFlowId, tenantId: TenantId): AsyncResult<ActionFlow | null>;
  findByTenantId(tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<ActionFlow>>;
  findByStatus(status: ActionFlowStatus, tenantId: TenantId): AsyncResult<readonly ActionFlow[]>;

  create(data: CreateActionFlowData): AsyncResult<ActionFlow>;
  update(id: ActionFlowId, data: UpdateActionFlowData, tenantId: TenantId): AsyncResult<ActionFlow>;
  delete(id: ActionFlowId, tenantId: TenantId): AsyncResult<void>;
}
