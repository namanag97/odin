import type { AsyncResult, TenantId, UUID } from "@odin/core-contracts";
import type { Component, ComponentId, CreateComponentData, UpdateComponentData } from "../../entities/studio/component";

export interface IComponentRepository {
  findById(id: ComponentId, tenantId: TenantId): AsyncResult<Component | null>;
  findByViewId(viewId: UUID, tenantId: TenantId): AsyncResult<readonly Component[]>;

  create(data: CreateComponentData, tenantId: TenantId): AsyncResult<Component>;
  update(id: ComponentId, data: UpdateComponentData, tenantId: TenantId): AsyncResult<Component>;
  delete(id: ComponentId, tenantId: TenantId): AsyncResult<void>;
}
