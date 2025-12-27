/**
 * Variant Entity - Process Mining Domain
 *
 * Process variant representing a unique activity sequence.
 */

import type {
  VariantId,
  DataModelId,
  Duration,
  Percentage,
} from '@odin/core-contracts';

// ============================================================================
// Entity
// ============================================================================

/**
 * Variant - Unique activity sequence in a process
 */
export interface Variant {
  readonly id: VariantId;
  readonly dataModelId: DataModelId;
  readonly activitySequence: readonly string[];
  readonly hash: string;
  readonly caseCount: number;
  readonly frequency: Percentage;
  readonly avgThroughputTime: Duration;
  readonly minThroughputTime: Duration;
  readonly maxThroughputTime: Duration;
}
