/**
 * Session Repository Interface - Identity Layer
 * 
 * Data access contract for Session entities.
 */

import type { 
  UserId,
  UUID,
  AsyncResult
} from '@odin/core-contracts';

import type { 
  Session,
  CreateSessionData
} from '../../entities/identity/session';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * ISessionRepository - Session data access contract
 */
export interface ISessionRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find a session by ID
   */
  findById(id: UUID): AsyncResult<Session | null>;
  
  /**
   * Find a session by token hash
   */
  findByToken(tokenHash: string): AsyncResult<Session | null>;
  
  /**
   * Find all active sessions for a user
   */
  findActiveByUser(userId: UserId): AsyncResult<readonly Session[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new session
   */
  create(data: CreateSessionData): AsyncResult<Session>;
  
  /**
   * Update session last activity timestamp
   */
  updateActivity(id: UUID): AsyncResult<void>;
  
  /**
   * Mark MFA as verified for session
   */
  verifyMfa(id: UUID): AsyncResult<void>;
  
  /**
   * Revoke a session
   */
  revoke(id: UUID): AsyncResult<void>;
  
  /**
   * Revoke all sessions for a user
   * @returns Number of sessions revoked
   */
  revokeAllForUser(userId: UserId): AsyncResult<number>;
  
  /**
   * Delete expired sessions
   * @returns Number of sessions deleted
   */
  deleteExpired(): AsyncResult<number>;
}
