/**
 * FeatureFlag Repository Interface - Operational Layer
 * 
 * Data access contract for FeatureFlag entities.
 */

import type { 
  UUID,
  AsyncResult
} from '@odin/core-contracts';

import type { 
  FeatureFlag,
  FeatureEvaluationContext,
  CreateFeatureFlagData, 
  UpdateFeatureFlagData 
} from '../../entities/operational/feature-flag';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IFeatureFlagRepository - FeatureFlag data access contract
 */
export interface IFeatureFlagRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find a feature flag by key
   */
  findByKey(key: string): AsyncResult<FeatureFlag | null>;
  
  /**
   * Find all feature flags
   */
  findAll(): AsyncResult<readonly FeatureFlag[]>;
  
  /**
   * Find all active feature flags
   */
  findActive(): AsyncResult<readonly FeatureFlag[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new feature flag
   */
  create(data: CreateFeatureFlagData): AsyncResult<FeatureFlag>;
  
  /**
   * Update feature flag fields
   */
  update(id: UUID, data: UpdateFeatureFlagData): AsyncResult<FeatureFlag>;
  
  /**
   * Delete a feature flag
   */
  delete(id: UUID): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Evaluation
  // -------------------------------------------------------------------------
  
  /**
   * Evaluate a single feature flag for a given context
   */
  evaluate(
    key: string, 
    context: FeatureEvaluationContext
  ): AsyncResult<boolean>;
  
  /**
   * Evaluate all feature flags for a given context
   */
  evaluateAll(
    context: FeatureEvaluationContext
  ): AsyncResult<Record<string, boolean>>;
}
