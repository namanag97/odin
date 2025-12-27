/**
 * Directly-Follows Graph (DFG) Types - Process Mining Domain
 *
 * PM4Py-aligned DFG representation.
 */

import type { Duration } from '@odin/core-contracts';

// ============================================================================
// DFG Activity
// ============================================================================

/**
 * DFG activity node
 */
export interface DFGActivity {
  readonly name: string;
  readonly frequency: number;
  readonly totalDuration?: Duration;
  readonly avgDuration?: Duration;
}

// ============================================================================
// Edge Performance
// ============================================================================

/**
 * Performance metrics for a DFG edge
 */
export interface EdgePerformance {
  readonly avgDuration: Duration;
  readonly minDuration: Duration;
  readonly maxDuration: Duration;
  readonly medianDuration: Duration;
}

// ============================================================================
// DFG Edge
// ============================================================================

/**
 * DFG edge (directly-follows relation)
 */
export interface DFGEdge {
  readonly source: string;
  readonly target: string;
  readonly frequency: number;
  readonly performance?: EdgePerformance;
}

// ============================================================================
// Directly-Follows Graph
// ============================================================================

/**
 * DirectlyFollowsGraph - Frequency-based process model
 */
export interface DirectlyFollowsGraph {
  readonly activities: readonly DFGActivity[];
  readonly edges: readonly DFGEdge[];
  readonly startActivities: Record<string, number>;
  readonly endActivities: Record<string, number>;
}
