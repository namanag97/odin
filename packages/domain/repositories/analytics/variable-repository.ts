import type { AsyncResult, TenantId, UUID } from "@odin/core-contracts";
import type { Variable, VariableId, CreateVariableData, UpdateVariableData, VariableScopeType } from "../../entities/analytics/variable";

export interface IVariableRepository {
  findById(id: VariableId, tenantId: TenantId): AsyncResult<Variable | null>;
  findByScope(scopeType: VariableScopeType, scopeId: UUID, tenantId: TenantId): AsyncResult<readonly Variable[]>;

  create(data: CreateVariableData, tenantId: TenantId): AsyncResult<Variable>;
  update(id: VariableId, data: UpdateVariableData, tenantId: TenantId): AsyncResult<Variable>;
  delete(id: VariableId, tenantId: TenantId): AsyncResult<void>;
}
