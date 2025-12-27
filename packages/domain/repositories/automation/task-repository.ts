import type { AsyncResult, TenantId, UUID, UserId, PageRequest, PageResponse } from "@odin/core-contracts";
import type { Task, TaskId, CreateTaskData, UpdateTaskData, TaskStatus, TaskPriority } from "../../entities/automation/task";

export interface ITaskRepository {
  findById(id: TaskId, tenantId: TenantId): AsyncResult<Task | null>;
  findByExecutionId(executionId: UUID, tenantId: TenantId): AsyncResult<readonly Task[]>;
  findByAssignee(assignedTo: UserId, tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Task>>;
  findByStatus(status: TaskStatus, tenantId: TenantId): AsyncResult<readonly Task[]>;
  findByPriority(priority: TaskPriority, tenantId: TenantId): AsyncResult<readonly Task[]>;

  create(data: CreateTaskData): AsyncResult<Task>;
  update(id: TaskId, data: UpdateTaskData, tenantId: TenantId): AsyncResult<Task>;
  delete(id: TaskId, tenantId: TenantId): AsyncResult<void>;
}
