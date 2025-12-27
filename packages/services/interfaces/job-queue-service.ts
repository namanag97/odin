import type {
  AsyncResult,
  UUID,
  ISODateTime,
  Duration,
  Percentage,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";

/**
 * Background job processing (Bull, BullMQ, or custom).
 */
export interface IJobQueueService extends IService {
  // Job Management
  enqueue<T>(input: EnqueueJobInput<T>, ctx: OperationContext): AsyncResult<QueuedJob>;
  enqueueBatch<T>(jobs: readonly EnqueueJobInput<T>[], ctx: OperationContext): AsyncResult<readonly QueuedJob[]>;

  // Scheduling
  schedule<T>(input: ScheduleJobInput<T>, ctx: OperationContext): AsyncResult<QueuedJob>;
  cancelScheduled(jobId: UUID, ctx: OperationContext): AsyncResult<boolean>;

  // Job Status
  getJob(jobId: UUID, ctx: OperationContext): AsyncResult<QueuedJob | null>;
  getJobStatus(jobId: UUID, ctx: OperationContext): AsyncResult<JobStatus>;
  getJobProgress(jobId: UUID, ctx: OperationContext): AsyncResult<JobProgress>;

  // Job Control
  retryJob(jobId: UUID, ctx: OperationContext): AsyncResult<QueuedJob>;
  cancelJob(jobId: UUID, ctx: OperationContext): AsyncResult<boolean>;
  pauseQueue(queueName: string, ctx: OperationContext): AsyncResult<void>;
  resumeQueue(queueName: string, ctx: OperationContext): AsyncResult<void>;

  // Queue Management
  getQueueStats(queueName: string, ctx: OperationContext): AsyncResult<QueueStats>;
  cleanQueue(input: CleanQueueInput, ctx: OperationContext): AsyncResult<number>;
  drainQueue(queueName: string, ctx: OperationContext): AsyncResult<number>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type QueueName =
  | 'data-import'
  | 'data-model-load'
  | 'process-discovery'
  | 'conformance-check'
  | 'action-flow-execution'
  | 'sensor-evaluation'
  | 'notification'
  | 'export'
  | 'cleanup';

export type JobType =
  | 'import_csv' | 'import_xlsx' | 'import_parquet'
  | 'load_data_model' | 'reload_data_model'
  | 'discover_process' | 'discover_dfg' | 'discover_ocpn'
  | 'check_conformance' | 'compute_alignments'
  | 'execute_action_flow' | 'evaluate_sensor'
  | 'send_notification' | 'send_email' | 'call_webhook'
  | 'export_view' | 'export_model'
  | 'cleanup_temp_files' | 'cleanup_expired_sessions';

export type JobPriority = 1 | 2 | 3 | 4 | 5;  // 1 = highest

export type JobStatus =
  | 'waiting'      // In queue
  | 'active'       // Being processed
  | 'completed'    // Successfully finished
  | 'failed'       // Failed after all retries
  | 'delayed'      // Scheduled for later
  | 'paused'       // Queue is paused
  | 'stuck';       // Stalled

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface BackoffStrategy {
  readonly type: 'fixed' | 'exponential' | 'custom';
  readonly delay: Duration;
  readonly maxDelay?: Duration;
}

export interface EnqueueJobInput<T> {
  readonly queue: QueueName;
  readonly type: JobType;
  readonly payload: T;
  readonly priority?: JobPriority;
  readonly delay?: Duration;
  readonly attempts?: number;
  readonly backoff?: BackoffStrategy;
  readonly timeout?: Duration;
  readonly removeOnComplete?: boolean;
  readonly removeOnFail?: boolean;
}

export interface QueuedJob {
  readonly id: UUID;
  readonly queue: QueueName;
  readonly type: JobType;
  readonly status: JobStatus;
  readonly priority: JobPriority;
  readonly payload: unknown;
  readonly progress: JobProgress;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly error?: string;
  readonly result?: unknown;
  readonly createdAt: ISODateTime;
  readonly startedAt?: ISODateTime;
  readonly completedAt?: ISODateTime;
  readonly scheduledFor?: ISODateTime;
}

export interface JobProgress {
  readonly percentage: Percentage;
  readonly current: number;
  readonly total: number;
  readonly message?: string;
  readonly stage?: string;
}

export interface RepeatOptions {
  readonly pattern: string;  // Cron expression
  readonly limit?: number;
  readonly endDate?: ISODateTime;
}

export interface ScheduleJobInput<T> extends EnqueueJobInput<T> {
  readonly runAt: ISODateTime;
  readonly repeat?: RepeatOptions;
}

export interface QueueStats {
  readonly name: QueueName;
  readonly waiting: number;
  readonly active: number;
  readonly completed: number;
  readonly failed: number;
  readonly delayed: number;
  readonly paused: boolean;
  readonly avgProcessingTime: Duration;
  readonly throughput: number;  // Jobs per minute
}

export interface CleanQueueInput {
  readonly queueName: QueueName;
  readonly status: 'completed' | 'failed';
  readonly olderThan: Duration;
}
