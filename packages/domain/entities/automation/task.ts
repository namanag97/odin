import type { UUID, TenantId, UserId, ISODateTime } from "@odin/core-contracts";

export type TaskId = UUID;
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  readonly id: TaskId;
  readonly tenantId: TenantId;
  readonly executionId: UUID;
  readonly name: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly assignedTo?: UserId;
  readonly dueAt?: ISODateTime;
  readonly startedAt?: ISODateTime;
  readonly completedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateTaskData {
  readonly tenantId: TenantId;
  readonly executionId: UUID;
  readonly name: string;
  readonly priority: TaskPriority;
  readonly assignedTo?: UserId;
  readonly dueAt?: ISODateTime;
}

export interface UpdateTaskData {
  readonly status?: TaskStatus;
  readonly assignedTo?: UserId;
  readonly dueAt?: ISODateTime;
  readonly startedAt?: ISODateTime;
  readonly completedAt?: ISODateTime;
}
