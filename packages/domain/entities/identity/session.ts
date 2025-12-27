/**
 * Session Entity - Identity Layer
 * 
 * Represents an authenticated user session.
 */

import type { 
  TenantId, 
  UserId,
  UUID,
  ISODateTime
} from '@odin/core-contracts';

// ============================================================================
// Entity
// ============================================================================

/**
 * Session - Active user authentication session
 */
export interface Session {
  readonly id: UUID;
  readonly userId: UserId;
  readonly tenantId: TenantId;
  /** Hashed session token */
  readonly token: string;
  /** Hashed refresh token */
  readonly refreshToken?: string;
  readonly expiresAt: ISODateTime;
  readonly lastActivityAt: ISODateTime;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly mfaVerified: boolean;
  readonly createdAt: ISODateTime;
  readonly revokedAt?: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new session
 */
export interface CreateSessionData {
  readonly userId: UserId;
  readonly tenantId: TenantId;
  readonly tokenHash: string;
  readonly refreshTokenHash?: string;
  readonly expiresAt: ISODateTime;
  readonly ipAddress: string;
  readonly userAgent: string;
}
