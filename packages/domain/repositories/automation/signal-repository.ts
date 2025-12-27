import type { AsyncResult, TenantId, UUID, PageRequest, PageResponse } from "@odin/core-contracts";
import type { Signal, SignalId, CreateSignalData, UpdateSignalData, SignalStatus } from "../../entities/automation/signal";

export interface ISignalRepository {
  findById(id: SignalId, tenantId: TenantId): AsyncResult<Signal | null>;
  findBySensorId(sensorId: UUID, tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Signal>>;
  findByStatus(status: SignalStatus, tenantId: TenantId): AsyncResult<readonly Signal[]>;

  create(data: CreateSignalData): AsyncResult<Signal>;
  update(id: SignalId, data: UpdateSignalData, tenantId: TenantId): AsyncResult<Signal>;
  delete(id: SignalId, tenantId: TenantId): AsyncResult<void>;
}
