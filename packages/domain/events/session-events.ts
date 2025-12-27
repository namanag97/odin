/**
 * Session Domain Events
 * 
 * Events emitted when session state changes.
 */

import type { 
  UserId, 
  UUID,
  Event
} from '@odin/core-contracts';

// ============================================================================
// Revocation Reason
// ============================================================================

/** Reason for session revocation */
export type SessionRevocationReason = 'logout' | 'security' | 'expired' | 'admin';

// ============================================================================
// Event Payloads
// ============================================================================

/**
 * Payload for SessionCreatedEvent
 */
export interface SessionCreatedPayload {
  readonly sessionId: UUID;
  readonly userId: UserId;
  readonly ipAddress: string;
  readonly userAgent: string;
}

/**
 * Payload for SessionRevokedEvent
 */
export interface SessionRevokedPayload {
  readonly sessionId: UUID;
  readonly userId: UserId;
  readonly reason: SessionRevocationReason;
}

/**
 * Payload for AllSessionsRevokedEvent (user-wide revocation)
 */
export interface AllSessionsRevokedPayload {
  readonly userId: UserId;
  readonly reason: SessionRevocationReason;
  readonly count: number;
}

// ============================================================================
// Event Types
// ============================================================================

/** Event emitted when a session is created */
export type SessionCreatedEvent = Event<SessionCreatedPayload>;

/** Event emitted when a session is revoked */
export type SessionRevokedEvent = Event<SessionRevokedPayload>;

/** Event emitted when all sessions for a user are revoked */
export type AllSessionsRevokedEvent = Event<AllSessionsRevokedPayload>;

// ============================================================================
// Event Type Constants
// ============================================================================

export const SessionEventTypes = {
  CREATED: 'session.created',
  REVOKED: 'session.revoked',
  ALL_REVOKED: 'session.all_revoked',
  EXPIRED: 'session.expired',
} as const;
