/**
 * ScheduledJob Repository Interface - Temporal Layer
 * 
 * Data access contract for ScheduledJob entities.
 */

import type { 
  UUID, 
  TenantId, 
  ISODateTime,
  AsyncResult,
  PageRequest,
  PageResponse
} from '@odin/core-contracts';

import type { 
  ScheduledJob,
  ScheduledJobStatus,
  JobTargetType,
  JobExecution,
  CreateJobData,
  UpdateJobData,
  CreateExecutionData
} from '../../entities/temporal/scheduled-job';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IScheduledJobRepository - Scheduled job data access contract
 */
export interface IScheduledJobRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find a job by ID
   */
  findById(id: UUID): AsyncResult<ScheduledJob | null>;
  
  /**
   * Find jobs by tenant
   */
  findByTenantId(
    tenantId: TenantId, 
    options?: PageRequest
  ): AsyncResult<PageResponse<ScheduledJob>>;
  
  /**
   * Find jobs that are due to run
   */
  findDue(cutoffTime: ISODateTime): AsyncResult<readonly ScheduledJob[]>;
  
  /**
   * Find jobs by target
   */
  findByTarget(
    targetType: JobTargetType, 
    targetId: UUID
  ): AsyncResult<readonly ScheduledJob[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new scheduled job
   */
  create(data: CreateJobData): AsyncResult<ScheduledJob>;
  
  /**
   * Update a scheduled job
   */
  update(id: UUID, data: UpdateJobData): AsyncResult<ScheduledJob>;
  
  /**
   * Update job status
   */
  updateStatus(id: UUID, status: ScheduledJobStatus): AsyncResult<ScheduledJob>;
  
  /**
   * Delete a scheduled job
   */
  delete(id: UUID): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Execution Tracking
  // -------------------------------------------------------------------------
  
  /**
   * Record a job execution
   */
  recordExecution(execution: CreateExecutionData): AsyncResult<JobExecution>;
  
  /**
   * Get executions for a job
   */
  getExecutions(
    jobId: UUID, 
    options?: PageRequest
  ): AsyncResult<PageResponse<JobExecution>>;
  
  /**
   * Get the last execution for a job
   */
  getLastExecution(jobId: UUID): AsyncResult<JobExecution | null>;

  // -------------------------------------------------------------------------
  // Scheduling
  // -------------------------------------------------------------------------
  
  /**
   * Calculate the next run time for a job
   */
  calculateNextRun(id: UUID): AsyncResult<ISODateTime | null>;
  
  /**
   * Update the next run time for a job
   */
  updateNextRun(id: UUID, nextRun: ISODateTime): AsyncResult<void>;
  
  /**
   * Increment consecutive failures counter
   */
  incrementFailures(id: UUID): AsyncResult<number>;
  
  /**
   * Reset consecutive failures counter
   */
  resetFailures(id: UUID): AsyncResult<void>;
}
