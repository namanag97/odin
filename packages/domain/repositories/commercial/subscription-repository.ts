/**
 * Subscription Repository Interface - Commercial Layer
 * 
 * Data access contract for Subscription entities.
 */

import type { 
  UUID,
  TenantId,
  AsyncResult
} from '@odin/core-contracts';

import type { 
  Subscription,
  SubscriptionStatus,
  SubscriptionChange,
  CreateSubscriptionData, 
  UpdateSubscriptionData,
  ScheduleChangeData
} from '../../entities/commercial/subscription';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * ISubscriptionRepository - Subscription data access contract
 */
export interface ISubscriptionRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find a subscription by ID
   */
  findById(id: UUID): AsyncResult<Subscription | null>;
  
  /**
   * Find a subscription by tenant ID
   */
  findByTenantId(tenantId: TenantId): AsyncResult<Subscription | null>;
  
  /**
   * Find all active subscriptions
   */
  findActive(): AsyncResult<readonly Subscription[]>;
  
  /**
   * Find subscriptions expiring within N days
   */
  findExpiring(withinDays: number): AsyncResult<readonly Subscription[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new subscription
   */
  create(data: CreateSubscriptionData): AsyncResult<Subscription>;
  
  /**
   * Update subscription fields
   */
  update(id: UUID, data: UpdateSubscriptionData): AsyncResult<Subscription>;
  
  /**
   * Update subscription status
   */
  updateStatus(id: UUID, status: SubscriptionStatus): AsyncResult<Subscription>;
  
  /**
   * Cancel a subscription
   */
  cancel(id: UUID, reason?: string): AsyncResult<Subscription>;
  
  /**
   * Reactivate a cancelled subscription
   */
  reactivate(id: UUID): AsyncResult<Subscription>;

  // -------------------------------------------------------------------------
  // Change Management
  // -------------------------------------------------------------------------
  
  /**
   * Schedule a future subscription change
   */
  scheduleChange(subscriptionId: UUID, change: ScheduleChangeData): AsyncResult<SubscriptionChange>;
  
  /**
   * Get all scheduled changes for a subscription
   */
  getChanges(subscriptionId: UUID): AsyncResult<readonly SubscriptionChange[]>;
  
  /**
   * Process all scheduled changes due for execution
   * @returns Number of changes processed
   */
  processScheduledChanges(): AsyncResult<number>;
}
