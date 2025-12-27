import type {
  AsyncResult,
  UUID,
  ISODateTime,
  Duration,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, DateRange } from "./common";
import type { PackageId } from "./knowledge-model-service";

/**
 * Action flow service for workflow automation.
 */
export interface IActionFlowService extends IService {
  // Queries
  getActionFlow(id: ActionFlowId, ctx: OperationContext): AsyncResult<ActionFlow>;
  listActionFlows(input: ListActionFlowsInput, ctx: OperationContext): AsyncResult<PaginatedResult<ActionFlow>>;
  getExecutionHistory(input: GetExecutionHistoryInput, ctx: OperationContext): AsyncResult<PaginatedResult<ActionFlowExecution>>;
  getExecution(id: UUID, ctx: OperationContext): AsyncResult<ActionFlowExecution>;

  // Commands
  createActionFlow(input: CreateActionFlowInput, ctx: OperationContext): AsyncResult<ActionFlow>;
  updateActionFlow(input: UpdateActionFlowInput, ctx: OperationContext): AsyncResult<ActionFlow>;
  deleteActionFlow(id: ActionFlowId, ctx: OperationContext): AsyncResult<void>;
  duplicateActionFlow(input: DuplicateActionFlowInput, ctx: OperationContext): AsyncResult<ActionFlow>;

  // Modules
  addModule(input: AddModuleInput, ctx: OperationContext): AsyncResult<ActionFlowModule>;
  updateModule(input: UpdateModuleInput, ctx: OperationContext): AsyncResult<ActionFlowModule>;
  deleteModule(id: UUID, ctx: OperationContext): AsyncResult<void>;
  reorderModules(input: ReorderModulesInput, ctx: OperationContext): AsyncResult<readonly ActionFlowModule[]>;

  // Lifecycle
  activateActionFlow(id: ActionFlowId, ctx: OperationContext): AsyncResult<ActionFlow>;
  deactivateActionFlow(id: ActionFlowId, ctx: OperationContext): AsyncResult<ActionFlow>;

  // Execution
  executeActionFlow(input: ExecuteActionFlowInput, ctx: OperationContext): AsyncResult<ActionFlowExecution>;
  cancelExecution(executionId: UUID, ctx: OperationContext): AsyncResult<ActionFlowExecution>;
  retryExecution(executionId: UUID, ctx: OperationContext): AsyncResult<ActionFlowExecution>;

  // Testing
  testActionFlow(input: TestActionFlowInput, ctx: OperationContext): AsyncResult<TestResult>;
  validateActionFlow(id: ActionFlowId, ctx: OperationContext): AsyncResult<ActionFlowValidation>;

  // Scheduling
  scheduleActionFlow(input: ScheduleActionFlowInput, ctx: OperationContext): AsyncResult<ScheduledJob>;
  unscheduleActionFlow(id: ActionFlowId, ctx: OperationContext): AsyncResult<void>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type ActionFlowId = UUID;
export type ActionFlowStatus = 'draft' | 'active' | 'inactive' | 'error';
export type TriggerType = 'manual' | 'schedule' | 'event' | 'signal' | 'webhook';
export type ActionFlowExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type ModuleType =
  | 'http' | 'email' | 'slack' | 'database'
  | 'transform' | 'condition' | 'loop' | 'parallel'
  | 'delay' | 'script' | 'celonis' | 'custom';

// ═══════════════════════════════════════════════════════════════
// Core Types
// ═══════════════════════════════════════════════════════════════

export interface ActionFlow {
  readonly id: ActionFlowId;
  readonly packageId: PackageId;
  readonly name: string;
  readonly description?: string;
  readonly status: ActionFlowStatus;
  readonly trigger: ActionFlowTrigger;
  readonly inputs?: readonly ActionFlowInput[];
  readonly outputs?: readonly ActionFlowOutput[];
  readonly modules: readonly ActionFlowModule[];
  readonly errorHandling?: ErrorHandlingConfig;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface ActionFlowTrigger {
  readonly type: TriggerType;
  readonly config: TriggerConfig;
}

export interface TriggerConfig {
  readonly schedule?: string;           // Cron expression
  readonly event?: string;
  readonly signalId?: UUID;
  readonly webhookPath?: string;
}

export interface ActionFlowInput {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  readonly defaultValue?: unknown;
  readonly description?: string;
}

export interface ActionFlowOutput {
  readonly name: string;
  readonly type: string;
  readonly description?: string;
}

export interface ActionFlowModule {
  readonly id: UUID;
  readonly actionFlowId: ActionFlowId;
  readonly type: ModuleType;
  readonly name: string;
  readonly description?: string;
  readonly position: number;
  readonly config: ModuleConfig;
  readonly inputMappings?: readonly InputMapping[];
  readonly outputMappings?: readonly OutputMapping[];
  readonly errorHandling?: ModuleErrorHandling;
  readonly condition?: ModuleCondition;
}

export interface ModuleConfig {
  readonly [key: string]: unknown;
}

export interface InputMapping {
  readonly target: string;
  readonly source: string;
  readonly transform?: string;
}

export interface OutputMapping {
  readonly source: string;
  readonly target: string;
}

export interface ModuleErrorHandling {
  readonly onError: 'fail' | 'continue' | 'retry';
  readonly retryCount?: number;
  readonly retryDelay?: Duration;
  readonly fallbackValue?: unknown;
}

export interface ModuleCondition {
  readonly type: 'expression' | 'always' | 'never';
  readonly expression?: string;
}

export interface ErrorHandlingConfig {
  readonly strategy: 'fail_fast' | 'continue' | 'rollback';
  readonly notifyOnError: boolean;
  readonly notifyEmails?: readonly string[];
}

export interface ActionFlowExecution {
  readonly id: UUID;
  readonly actionFlowId: ActionFlowId;
  readonly status: ActionFlowExecutionStatus;
  readonly trigger: TriggerType;
  readonly inputs?: Record<string, unknown>;
  readonly outputs?: Record<string, unknown>;
  readonly moduleExecutions: readonly ModuleExecution[];
  readonly error?: ExecutionError;
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
  readonly duration?: Duration;
}

export interface ModuleExecution {
  readonly moduleId: UUID;
  readonly moduleName: string;
  readonly status: ActionFlowExecutionStatus;
  readonly inputs?: Record<string, unknown>;
  readonly outputs?: Record<string, unknown>;
  readonly error?: string;
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
  readonly duration?: Duration;
}

export interface ExecutionError {
  readonly code: string;
  readonly message: string;
  readonly moduleId?: UUID;
  readonly stack?: string;
}

export interface ScheduledJob {
  readonly id: UUID;
  readonly actionFlowId: ActionFlowId;
  readonly schedule: JobSchedule;
  readonly nextRunAt: ISODateTime;
  readonly lastRunAt?: ISODateTime;
  readonly enabled: boolean;
}

export interface JobSchedule {
  readonly type: 'cron' | 'interval' | 'once';
  readonly cron?: string;
  readonly interval?: Duration;
  readonly runAt?: ISODateTime;
  readonly timezone?: string;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface CreateActionFlowInput {
  readonly packageId: PackageId;
  readonly name: string;
  readonly description?: string;
  readonly trigger: ActionFlowTrigger;
  readonly inputs?: readonly ActionFlowInput[];
  readonly outputs?: readonly ActionFlowOutput[];
  readonly errorHandling?: ErrorHandlingConfig;
}

export interface UpdateActionFlowInput {
  readonly id: ActionFlowId;
  readonly name?: string;
  readonly description?: string;
  readonly trigger?: ActionFlowTrigger;
  readonly inputs?: readonly ActionFlowInput[];
  readonly outputs?: readonly ActionFlowOutput[];
  readonly errorHandling?: ErrorHandlingConfig;
}

export interface ListActionFlowsInput {
  readonly packageId?: PackageId;
  readonly status?: ActionFlowStatus;
  readonly triggerType?: TriggerType;
  readonly search?: string;
  readonly pagination?: Pagination;
}

export interface DuplicateActionFlowInput {
  readonly actionFlowId: ActionFlowId;
  readonly newName: string;
  readonly targetPackageId?: PackageId;
}

export interface AddModuleInput {
  readonly actionFlowId: ActionFlowId;
  readonly type: ModuleType;
  readonly name: string;
  readonly description?: string;
  readonly position?: number;
  readonly config: ModuleConfig;
  readonly inputMappings?: readonly InputMapping[];
  readonly outputMappings?: readonly OutputMapping[];
  readonly errorHandling?: ModuleErrorHandling;
  readonly condition?: ModuleCondition;
}

export interface UpdateModuleInput {
  readonly id: UUID;
  readonly name?: string;
  readonly config?: ModuleConfig;
  readonly inputMappings?: readonly InputMapping[];
  readonly outputMappings?: readonly OutputMapping[];
  readonly errorHandling?: ModuleErrorHandling;
  readonly condition?: ModuleCondition;
}

export interface ReorderModulesInput {
  readonly actionFlowId: ActionFlowId;
  readonly moduleOrder: readonly UUID[];
}

export interface ExecuteActionFlowInput {
  readonly actionFlowId: ActionFlowId;
  readonly inputs?: Record<string, unknown>;
  readonly async?: boolean;
}

export interface GetExecutionHistoryInput {
  readonly actionFlowId: ActionFlowId;
  readonly status?: ActionFlowExecutionStatus;
  readonly dateRange?: DateRange;
  readonly pagination?: Pagination;
}

export interface TestActionFlowInput {
  readonly actionFlowId: ActionFlowId;
  readonly testInputs: Record<string, unknown>;
  readonly mockExternalCalls?: boolean;
  readonly stopAtModule?: UUID;
}

export interface TestResult {
  readonly success: boolean;
  readonly moduleResults: readonly ModuleTestResult[];
  readonly outputs?: Record<string, unknown>;
  readonly error?: ExecutionError;
  readonly duration: Duration;
}

export interface ModuleTestResult {
  readonly moduleId: UUID;
  readonly moduleName: string;
  readonly success: boolean;
  readonly inputs: Record<string, unknown>;
  readonly outputs?: Record<string, unknown>;
  readonly error?: string;
  readonly duration: Duration;
  readonly skipped: boolean;
}

export interface ActionFlowValidation {
  readonly valid: boolean;
  readonly errors: readonly ActionFlowError[];
  readonly warnings: readonly ActionFlowWarning[];
}

export interface ActionFlowError {
  readonly code: string;
  readonly message: string;
  readonly moduleId?: UUID;
  readonly field?: string;
}

export interface ActionFlowWarning {
  readonly code: string;
  readonly message: string;
  readonly recommendation: string;
}

export interface ScheduleActionFlowInput {
  readonly actionFlowId: ActionFlowId;
  readonly schedule: JobSchedule;
  readonly inputOverrides?: Record<string, unknown>;
}
