/**
 * ScheduledJob Entity - Temporal Layer
 * 
 * Scheduled and recurring job definitions.
 */

import type { 
  UUID, 
  TenantId, 
  ISODateTime,
  Duration,
  ExecutionStatus
} from '@odin/core-contracts';

// ============================================================================
// Job Types
// ============================================================================

/** Type of scheduled job */
export type JobType = 
  | 'data_refresh' 
  | 'model_reload' 
  | 'export'
  | 'cleanup' 
  | 'report' 
  | 'action_flow';

/** Type of target the job operates on */
export type JobTargetType = 'data_pool' | 'data_model' | 'action_flow' | 'export';

/** Status of the scheduled job */
export type ScheduledJobStatus = 'active' | 'paused' | 'disabled' | 'error';

// ============================================================================
// Schedule Configuration
// ============================================================================

/** Type of schedule */
export type ScheduleType = 'cron' | 'interval' | 'once';

/**
 * Schedule configuration for a job
 */
export interface JobSchedule {
  readonly type: ScheduleType;
  /** Cron expression (for type='cron') */
  readonly cronExpression?: string;
  /** Interval duration (for type='interval') */
  readonly interval?: Duration;
  /** IANA timezone identifier */
  readonly timezone: string;
  /** Optional start date for the schedule */
  readonly startDate?: ISODateTime;
  /** Optional end date for the schedule */
  readonly endDate?: ISODateTime;
  /** Maximum number of runs (optional) */
  readonly maxRuns?: number;
}

// ============================================================================
// Execution
// ============================================================================

/** What triggered the job execution */
export type TriggerSource = 'schedule' | 'manual' | 'webhook' | 'dependency';

/**
 * Error information for failed job execution
 */
export interface JobError {
  readonly code: string;
  readonly message: string;
  readonly stackTrace?: string;
  readonly retryable: boolean;
}

/**
 * Record of a single job execution
 */
export interface JobExecution {
  readonly id: UUID;
  readonly jobId: UUID;
  readonly status: ExecutionStatus;
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
  readonly duration?: Duration;
  readonly triggeredBy: TriggerSource;
  readonly output?: Record<string, unknown>;
  readonly error?: JobError;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * ScheduledJob - Defines a scheduled or recurring job
 */
export interface ScheduledJob {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly type: JobType;
  readonly schedule: JobSchedule;
  readonly targetType: JobTargetType;
  readonly targetId: UUID;
  readonly configuration: Record<string, unknown>;
  readonly status: ScheduledJobStatus;
  readonly lastRunAt?: ISODateTime;
  readonly lastRunStatus?: ExecutionStatus;
  readonly nextRunAt?: ISODateTime;
  readonly consecutiveFailures: number;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a scheduled job
 */
export interface CreateJobData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly type: JobType;
  readonly schedule: JobSchedule;
  readonly targetType: JobTargetType;
  readonly targetId: UUID;
  readonly configuration?: Record<string, unknown>;
}

/**
 * Data for updating a scheduled job
 */
export interface UpdateJobData {
  readonly name?: string;
  readonly schedule?: JobSchedule;
  readonly configuration?: Record<string, unknown>;
}

/**
 * Data for recording a job execution
 */
export interface CreateJobExecutionData {
  readonly jobId: UUID;
  readonly triggeredBy: TriggerSource;
}
