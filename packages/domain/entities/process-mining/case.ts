/**
 * Case Entity - Process Mining Domain
 *
 * Traditional case-centric view - also derivable from OCEL.
 */

import type {
  CaseId,
  VariantId,
  EventId,
  DataModelId,
  ISODateTime,
  Duration,
} from '@odin/core-contracts';

// ============================================================================
// Case Event
// ============================================================================

/**
 * Event within a case
 */
export interface CaseEvent {
  readonly eventId: EventId;
  readonly activity: string;
  readonly timestamp: ISODateTime;
  readonly attributes: Record<string, unknown>;
}

// ============================================================================
// Case Metrics
// ============================================================================

/**
 * Case-level metrics
 */
export interface CaseMetrics {
  readonly eventCount: number;
  readonly startTime: ISODateTime;
  readonly endTime: ISODateTime;
  readonly throughputTime: Duration;
  readonly waitingTime?: Duration;
  readonly processingTime?: Duration;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * Case - Traditional case-centric process instance
 */
export interface Case {
  readonly id: CaseId;
  readonly dataModelId: DataModelId;
  readonly variant: VariantId;
  readonly events: readonly CaseEvent[];
  readonly attributes: Record<string, unknown>;
  readonly metrics: CaseMetrics;
}
