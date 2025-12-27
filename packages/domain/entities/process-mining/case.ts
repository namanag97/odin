/**
 * Case Entity - Process Mining Domain
 *
 * Traditional case-centric view - also derivable from OCEL.
 */

import type {
  CaseId as CoreCaseId,
  VariantId,
  EventId,
  DataModelId,
  ISODateTime,
  Duration,
  TenantId,
} from '@odin/core-contracts';

// ============================================================================
// Re-export Branded IDs from core-contracts
// ============================================================================

export type CaseId = CoreCaseId;

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
  readonly tenantId: TenantId;
  readonly dataModelId: DataModelId;
  readonly variant: VariantId;
  readonly events: readonly CaseEvent[];
  readonly attributes: Record<string, unknown>;
  readonly metrics: CaseMetrics;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new Case
 */
export interface CreateCaseData {
  readonly tenantId: TenantId;
  readonly dataModelId: DataModelId;
  readonly variant?: VariantId;
  readonly events?: readonly CaseEvent[];
  readonly attributes?: Record<string, unknown>;
}

/**
 * Data for updating a Case
 */
export interface UpdateCaseData {
  readonly variant?: VariantId;
  readonly events?: readonly CaseEvent[];
  readonly attributes?: Record<string, unknown>;
  readonly metrics?: Partial<CaseMetrics>;
}

