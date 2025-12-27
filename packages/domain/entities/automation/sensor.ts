import type { UUID, TenantId, UserId, ISODateTime } from "@odin/core-contracts";

export type SensorId = UUID;
export type SensorType = 'schedule' | 'webhook' | 'event';

export interface Sensor {
  readonly id: SensorId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly type: SensorType;
  readonly config: Record<string, unknown>;
  readonly isActive: boolean;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

export interface CreateSensorData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly type: SensorType;
  readonly config: Record<string, unknown>;
  readonly createdBy: UserId;
}

export interface UpdateSensorData {
  readonly name?: string;
  readonly config?: Record<string, unknown>;
  readonly isActive?: boolean;
}
