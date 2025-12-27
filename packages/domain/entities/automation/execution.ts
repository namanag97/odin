import type { UUID, ISODateTime, ActionFlowId, UserId, Duration } from "@odin/core-contracts";
import type { TriggerType } from "./action-flow";

export type ExecutionId = UUID;
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionTrigger {
  readonly type: TriggerType;
  readonly source?: string;
  readonly eventId?: UUID;
  readonly signalId?: UUID;
}

export interface ExecutionError {
  readonly code: string;
  readonly message: string;
  readonly moduleId?: UUID;
  readonly stackTrace?: string;
  readonly retryable: boolean;
}

export interface ExecutionStep {
  readonly moduleId: UUID;
  readonly moduleName: string;
  readonly status: ExecutionStatus;
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
  readonly duration?: Duration;
  readonly inputs: Record<string, unknown>;
  readonly outputs?: Record<string, unknown>;
  readonly error?: ExecutionError;
  readonly retryCount: number;
}

export interface Execution {
  readonly id: ExecutionId;
  readonly actionFlowId: ActionFlowId;
  readonly status: ExecutionStatus;
  readonly trigger: ExecutionTrigger;
  readonly inputs: Record<string, unknown>;
  readonly outputs?: Record<string, unknown>;
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
  readonly duration?: Duration;
  readonly steps: readonly ExecutionStep[];
  readonly error?: ExecutionError;
  readonly triggeredBy?: UserId;
}

export interface CreateExecutionData {
  readonly actionFlowId: ActionFlowId;
  readonly trigger: ExecutionTrigger;
  readonly inputs: Record<string, unknown>;
  readonly triggeredBy?: UserId;
}

export interface UpdateExecutionData {
  readonly status?: ExecutionStatus;
  readonly outputs?: Record<string, unknown>;
  readonly completedAt?: ISODateTime;
  readonly duration?: Duration;
  readonly error?: ExecutionError;
}
