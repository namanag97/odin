/**
 * Plan Repository Interface - Commercial Layer
 * 
 * Data access contract for Plan entities.
 */

import type { 
  UUID,
  AsyncResult
} from '@odin/core-contracts';

import type { 
  Plan, 
  PlanComparison,
  CreatePlanData, 
  UpdatePlanData 
} from '../../entities/commercial/plan';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IPlanRepository - Plan data access contract
 */
export interface IPlanRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find a plan by ID
   */
  findById(id: UUID): AsyncResult<Plan | null>;
  
  /**
   * Find a plan by slug
   */
  findBySlug(slug: string): AsyncResult<Plan | null>;
  
  /**
   * Find all active plans
   */
  findActive(): AsyncResult<readonly Plan[]>;
  
  /**
   * Find all public plans
   */
  findPublic(): AsyncResult<readonly Plan[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new plan
   */
  create(data: CreatePlanData): AsyncResult<Plan>;
  
  /**
   * Update plan fields
   */
  update(id: UUID, data: UpdatePlanData): AsyncResult<Plan>;
  
  /**
   * Deprecate a plan (no new subscriptions)
   */
  deprecate(id: UUID): AsyncResult<void>;
  
  /**
   * Archive a plan (hide from all views)
   */
  archive(id: UUID): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Comparison
  // -------------------------------------------------------------------------
  
  /**
   * Compare multiple plans side by side
   */
  comparePlans(planIds: UUID[]): AsyncResult<PlanComparison>;
}
