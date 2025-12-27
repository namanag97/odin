import type { UUID, TenantId, UserId, ISODateTime, Duration, PackageId } from "@odin/core-contracts";
import type { Module } from "./module";
import type { ExecutionStatus } from "./execution";

export type ActionFlowId = UUID;
export type ActionFlowStatus = 'draft' | 'active' | 'paused' | 'disabled' | 'error';
export type TriggerType = 'manual' | 'scheduled' | 'event' | 'sensor' | 'webhook';

export type DataType =
  | 'string' | 'number' | 'boolean' | 'date' | 'datetime'
  | 'json' | 'array' | 'object';

export interface ActionFlowTrigger {
  readonly type: TriggerType;
  readonly config: TriggerConfig;
}

export type TriggerConfig =
  | { type: 'manual' }
  | { type: 'scheduled'; schedule: JobSchedule }
  | { type: 'event'; eventTypes: readonly string[] }
  | { type: 'sensor'; sensorId: UUID }
  | { type: 'webhook'; secret: string };

export interface JobSchedule {
  readonly type: 'cron' | 'interval';
  readonly expression?: string;
  readonly interval?: Duration;
  readonly timezone?: string;
}

export interface ActionFlowInput {
  readonly name: string;
  readonly type: DataType;
  readonly required: boolean;
  readonly defaultValue?: unknown;
  readonly validation?: VariableValidation;
}

export interface VariableValidation {
  readonly required?: boolean;
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: string;
}

export interface ActionFlowOutput {
  readonly name: string;
  readonly type: DataType;
  readonly source: string;  // Module output reference
}

export interface ErrorHandlingConfig {
  readonly maxRetries: number;
  readonly retryDelay: Duration;
  readonly consecutiveErrorsLimit: number;
  readonly errorNotification?: UUID;  // Notification template
  readonly fallbackActionFlowId?: ActionFlowId;
}

export interface ScheduleConfig extends JobSchedule {
  readonly inputOverrides?: Record<string, unknown>;
}

export interface ActionFlowStatistics {
  readonly totalExecutions: number;
  readonly successfulExecutions: number;
  readonly failedExecutions: number;
  readonly avgDuration: Duration;
  readonly lastExecutionAt?: ISODateTime;
  readonly lastExecutionStatus?: ExecutionStatus;
}

export interface ActionFlow {
  readonly id: ActionFlowId;
  readonly tenantId: TenantId;
  readonly packageId: PackageId;
  readonly name: string;
  readonly description?: string;
  readonly status: ActionFlowStatus;
  readonly trigger: ActionFlowTrigger;
  readonly modules: readonly Module[];
  readonly inputs: readonly ActionFlowInput[];
  readonly outputs: readonly ActionFlowOutput[];
  readonly errorHandling: ErrorHandlingConfig;
  readonly scheduling?: ScheduleConfig;
  readonly statistics: ActionFlowStatistics;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly activatedAt?: ISODateTime;
  readonly createdBy: UserId;
}

export interface CreateActionFlowData {
  readonly tenantId: TenantId;
  readonly packageId: PackageId;
  readonly name: string;
  readonly description?: string;
  readonly trigger: ActionFlowTrigger;
  readonly modules?: readonly Module[];
  readonly inputs?: readonly ActionFlowInput[];
  readonly outputs?: readonly ActionFlowOutput[];
  readonly errorHandling?: ErrorHandlingConfig;
  readonly scheduling?: ScheduleConfig;
  readonly createdBy: UserId;
}

export interface UpdateActionFlowData {
  readonly name?: string;
  readonly description?: string;
  readonly status?: ActionFlowStatus;
  readonly trigger?: ActionFlowTrigger;
  readonly modules?: readonly Module[];
  readonly inputs?: readonly ActionFlowInput[];
  readonly outputs?: readonly ActionFlowOutput[];
  readonly errorHandling?: ErrorHandlingConfig;
  readonly scheduling?: ScheduleConfig;
}
