import type {
  AsyncResult,
  UUID,
  UserId,
  ISODateTime,
  Duration,
  Percentage,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, SortConfig, DateRange } from "./common";

/**
 * Task management service for work items and task types.
 */
export interface ITaskService extends IService {
  // Queries
  getTask(id: UUID, ctx: OperationContext): AsyncResult<Task>;
  listTasks(input: ListTasksInput, ctx: OperationContext): AsyncResult<PaginatedResult<Task>>;
  getMyTasks(input: GetMyTasksInput, ctx: OperationContext): AsyncResult<PaginatedResult<Task>>;
  getTaskStatistics(input: TaskStatsInput, ctx: OperationContext): AsyncResult<TaskStatistics>;

  // Commands
  createTask(input: CreateTaskInput, ctx: OperationContext): AsyncResult<Task>;
  updateTask(input: UpdateTaskInput, ctx: OperationContext): AsyncResult<Task>;
  deleteTask(id: UUID, ctx: OperationContext): AsyncResult<void>;

  // Workflow
  assignTask(input: AssignTaskInput, ctx: OperationContext): AsyncResult<Task>;
  unassignTask(id: UUID, ctx: OperationContext): AsyncResult<Task>;
  changeStatus(input: ChangeTaskStatusInput, ctx: OperationContext): AsyncResult<Task>;

  // Comments
  addComment(input: AddCommentInput, ctx: OperationContext): AsyncResult<TaskComment>;
  updateComment(input: UpdateCommentInput, ctx: OperationContext): AsyncResult<TaskComment>;
  deleteComment(id: UUID, ctx: OperationContext): AsyncResult<void>;

  // Bulk Operations
  bulkAssign(input: BulkAssignInput, ctx: OperationContext): AsyncResult<BulkOperationResult>;
  bulkChangeStatus(input: BulkChangeStatusInput, ctx: OperationContext): AsyncResult<BulkOperationResult>;

  // Task Types
  createTaskType(input: CreateTaskTypeInput, ctx: OperationContext): AsyncResult<TaskType>;
  updateTaskType(input: UpdateTaskTypeInput, ctx: OperationContext): AsyncResult<TaskType>;
  deleteTaskType(id: UUID, ctx: OperationContext): AsyncResult<void>;
  listTaskTypes(ctx: OperationContext): AsyncResult<readonly TaskType[]>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type TaskStatus = 'open' | 'in_progress' | 'pending' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type CustomFieldType = 'string' | 'number' | 'boolean' | 'date' | 'selection' | 'user';

// ═══════════════════════════════════════════════════════════════
// Core Types
// ═══════════════════════════════════════════════════════════════

export interface Task {
  readonly id: UUID;
  readonly taskTypeId: UUID;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly assigneeId?: UserId;
  readonly reporterId: UserId;
  readonly dueDate?: ISODateTime;
  readonly context?: TaskContext;
  readonly customFields?: Record<string, unknown>;
  readonly comments: readonly TaskComment[];
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
}

export interface TaskContext {
  readonly signalId?: UUID;
  readonly caseId?: string;
  readonly objectId?: string;
  readonly objectType?: string;
  readonly url?: string;
}

export interface TaskComment {
  readonly id: UUID;
  readonly taskId: UUID;
  readonly authorId: UserId;
  readonly content: string;
  readonly createdAt: ISODateTime;
  readonly updatedAt?: ISODateTime;
}

export interface TaskType {
  readonly id: UUID;
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly defaultPriority: TaskPriority;
  readonly customFields: readonly TaskCustomField[];
  readonly workflow?: TaskWorkflow;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface TaskCustomField {
  readonly name: string;
  readonly label: string;
  readonly type: CustomFieldType;
  readonly required: boolean;
  readonly defaultValue?: unknown;
  readonly options?: readonly CustomFieldOption[];
}

export interface CustomFieldOption {
  readonly value: unknown;
  readonly label: string;
}

export interface TaskWorkflow {
  readonly statuses: readonly WorkflowStatus[];
  readonly transitions: readonly WorkflowTransition[];
}

export interface WorkflowStatus {
  readonly status: TaskStatus;
  readonly label: string;
  readonly color?: string;
}

export interface WorkflowTransition {
  readonly from: TaskStatus;
  readonly to: TaskStatus;
  readonly label?: string;
  readonly requiresComment?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface CreateTaskInput {
  readonly taskTypeId: UUID;
  readonly title: string;
  readonly description?: string;
  readonly priority?: TaskPriority;
  readonly assigneeId?: UserId;
  readonly dueDate?: ISODateTime;
  readonly context?: TaskContext;
  readonly customFields?: Record<string, unknown>;
}

export interface UpdateTaskInput {
  readonly id: UUID;
  readonly title?: string;
  readonly description?: string;
  readonly priority?: TaskPriority;
  readonly dueDate?: ISODateTime;
  readonly customFields?: Record<string, unknown>;
}

export interface ListTasksInput {
  readonly taskTypeId?: UUID;
  readonly status?: TaskStatus;
  readonly priority?: TaskPriority;
  readonly assigneeId?: UserId;
  readonly signalId?: UUID;
  readonly dueBefore?: ISODateTime;
  readonly dueAfter?: ISODateTime;
  readonly search?: string;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

export interface GetMyTasksInput {
  readonly status?: TaskStatus;
  readonly includeUnassigned?: boolean;
  readonly pagination?: Pagination;
}

export interface TaskStatsInput {
  readonly taskTypeId?: UUID;
  readonly dateRange?: DateRange;
  readonly groupBy?: 'status' | 'priority' | 'assignee' | 'type';
}

export interface TaskStatistics {
  readonly total: number;
  readonly byStatus: Record<TaskStatus, number>;
  readonly byPriority: Record<TaskPriority, number>;
  readonly overdue: number;
  readonly avgResolutionTime?: Duration;
  readonly completionRate: Percentage;
  readonly groups?: readonly TaskStatGroup[];
}

export interface TaskStatGroup {
  readonly key: string;
  readonly count: number;
  readonly avgResolutionTime?: Duration;
}

export interface AssignTaskInput {
  readonly taskId: UUID;
  readonly assigneeId: UserId;
  readonly notify?: boolean;
}

export interface ChangeTaskStatusInput {
  readonly taskId: UUID;
  readonly status: TaskStatus;
  readonly note?: string;
}

export interface AddCommentInput {
  readonly taskId: UUID;
  readonly content: string;
}

export interface UpdateCommentInput {
  readonly id: UUID;
  readonly content: string;
}

export interface BulkAssignInput {
  readonly taskIds: readonly UUID[];
  readonly assigneeId: UserId;
}

export interface BulkChangeStatusInput {
  readonly taskIds: readonly UUID[];
  readonly status: TaskStatus;
}

export interface BulkOperationResult {
  readonly succeeded: number;
  readonly failed: number;
  readonly errors: readonly { taskId: UUID; error: string }[];
}

export interface CreateTaskTypeInput {
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly defaultPriority?: TaskPriority;
  readonly customFields?: readonly TaskCustomField[];
  readonly workflow?: TaskWorkflow;
}

export interface UpdateTaskTypeInput {
  readonly id: UUID;
  readonly name?: string;
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly customFields?: readonly TaskCustomField[];
  readonly workflow?: TaskWorkflow;
}
