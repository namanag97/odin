import type { AsyncResult, TenantId, PageRequest, PageResponse } from "@odin/core-contracts";
import type { Sensor, SensorId, CreateSensorData, UpdateSensorData, SensorType } from "../../entities/automation/sensor";

export interface ISensorRepository {
  findById(id: SensorId, tenantId: TenantId): AsyncResult<Sensor | null>;
  findByType(type: SensorType, tenantId: TenantId): AsyncResult<readonly Sensor[]>;
  findActive(tenantId: TenantId): AsyncResult<readonly Sensor[]>;
  findByTenantId(tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Sensor>>;

  create(data: CreateSensorData): AsyncResult<Sensor>;
  update(id: SensorId, data: UpdateSensorData, tenantId: TenantId): AsyncResult<Sensor>;
  delete(id: SensorId, tenantId: TenantId): AsyncResult<void>;
}
