import type { UUID, TenantId, ISODateTime } from "@odin/core-contracts";

export type SignalId = UUID;
export type SignalStatus = 'pending' | 'processed' | 'failed';

export interface Signal {
  readonly id: SignalId;
  readonly tenantId: TenantId;
  readonly sensorId: UUID;
  readonly payload: Record<string, unknown>;
  readonly status: SignalStatus;
  readonly processedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

export interface CreateSignalData {
  readonly tenantId: TenantId;
  readonly sensorId: UUID;
  readonly payload: Record<string, unknown>;
}

export interface UpdateSignalData {
  readonly status?: SignalStatus;
  readonly processedAt?: ISODateTime;
}
