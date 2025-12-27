import type { UUID, TenantId, ISODateTime } from "@odin/core-contracts";

export type ExecutionId = UUID;
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Execution {
  readonly id: ExecutionId;
  readonly tenantId: TenantId;
  readonly actionFlowId: UUID;
  readonly status: ExecutionStatus;
  readonly input: Record<string, unknown>;
  readonly output?: Record<string, unknown>;
  readonly error?: string;
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
}

export interface CreateExecutionData {
  readonly tenantId: TenantId;
  readonly actionFlowId: UUID;
  readonly input: Record<string, unknown>;
}

export interface UpdateExecutionData {
  readonly status?: ExecutionStatus;
  readonly output?: Record<string, unknown>;
  readonly error?: string;
  readonly completedAt?: ISODateTime;
}
