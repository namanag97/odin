/**
 * MFA Device Entity - Identity Layer
 * 
 * Multi-factor authentication device registration.
 */

import type { 
  UserId,
  UUID,
  ISODateTime
} from '@odin/core-contracts';

// ============================================================================
// Types
// ============================================================================

/** MFA device type */
export type MfaType = 'totp' | 'sms' | 'email' | 'webauthn' | 'recovery_codes';

// ============================================================================
// Entity
// ============================================================================

/**
 * MfaDevice - Registered MFA device for a user
 */
export interface MfaDevice {
  readonly id: UUID;
  readonly userId: UserId;
  readonly type: MfaType;
  readonly name: string;
  /** Encrypted secret */
  readonly secretEncrypted: string;
  readonly isDefault: boolean;
  readonly lastUsedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create an MFA device
 */
export interface CreateMfaDeviceData {
  readonly userId: UserId;
  readonly type: MfaType;
  readonly name: string;
  readonly secretEncrypted: string;
  readonly isDefault?: boolean;
}
