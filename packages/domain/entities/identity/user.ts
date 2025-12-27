/**
 * User Entity - Identity Layer
 * 
 * Represents an authenticated user in the system.
 */

import type { 
  TenantId, 
  UserId,
  SpaceId,
  ISODateTime, 
  Email,
  URL
} from '@odin/core-contracts';

// ============================================================================
// Status & Auth Types
// ============================================================================

/** User lifecycle status */
export type UserStatus = 'pending' | 'active' | 'suspended' | 'deleted';

/** Authentication method */
export type AuthMethod = 'password' | 'sso' | 'magic_link' | 'api_key';

// ============================================================================
// Preferences
// ============================================================================

/**
 * User preferences
 */
export interface UserPreferences {
  readonly theme: 'light' | 'dark' | 'system';
  readonly defaultSpaceId?: SpaceId;
  readonly emailNotifications: boolean;
  readonly weeklyDigest: boolean;
}

// ============================================================================
// Profile
// ============================================================================

/**
 * Extended user profile information
 */
export interface UserProfile {
  readonly userId: UserId;
  readonly displayName?: string;
  readonly jobTitle?: string;
  readonly department?: string;
  readonly timezone?: string;
  readonly locale?: string;
  readonly preferences: UserPreferences;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * User - Authenticated identity
 */
export interface User {
  readonly id: UserId;
  readonly tenantId: TenantId;
  readonly email: Email;
  readonly emailVerified: boolean;
  readonly name: string;
  readonly avatarUrl?: URL;
  readonly status: UserStatus;
  readonly authMethod: AuthMethod;
  readonly mfaEnabled: boolean;
  readonly lastLoginAt?: ISODateTime;
  readonly passwordChangedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new user
 */
export interface CreateUserData {
  readonly tenantId: TenantId;
  readonly email: Email;
  readonly name: string;
  readonly authMethod: AuthMethod;
  readonly passwordHash?: string;
}

/**
 * Data for updating a user
 */
export interface UpdateUserData {
  readonly name?: string;
  readonly avatarUrl?: URL;
  readonly emailVerified?: boolean;
}
