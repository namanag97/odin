/**
 * Announcement Entity - Temporal Layer (Communication)
 * 
 * System-wide or tenant-wide announcements.
 */

import type {
  UUID,
  TenantId,
  UserId,
  ISODateTime,
  URL,
  EntityStatus,
  Brand,
} from '@odin/core-contracts';
import type { RoleId } from '../identity/role';
import type { TenantTier } from '../existence/tenant';
import type { NotificationPriority } from './notification';

// ============================================================================
// Branded IDs
// ============================================================================

/** Branded Announcement ID */
export type AnnouncementId = Brand<UUID, 'AnnouncementId'>;

/** Cast function for AnnouncementId */
export const asAnnouncementId = (id: string): AnnouncementId => 
  id as unknown as AnnouncementId;

// ============================================================================
// Announcement Types
// ============================================================================

/** Type of announcement */
export type AnnouncementType = 'info' | 'warning' | 'feature' | 'maintenance';

/**
 * Target audience for announcement
 */
export interface TargetAudience {
  /** If true, show to all users */
  readonly allUsers: boolean;
  /** Filter by tenant tier */
  readonly tenantTiers?: readonly TenantTier[];
  /** Filter by role */
  readonly roleIds?: readonly RoleId[];
  /** Specific user IDs */
  readonly userIds?: readonly UserId[];
}

// ============================================================================
// Entity
// ============================================================================

/**
 * Announcement - System or tenant-wide announcement
 * 
 * Displayed to users based on target audience and time range.
 */
export interface Announcement {
  readonly id: UUID;
  /** null = all tenants (system-wide) */
  readonly tenantId?: TenantId;
  readonly title: string;
  readonly content: string;
  readonly type: AnnouncementType;
  readonly priority: NotificationPriority;
  readonly targetAudience: TargetAudience;
  readonly startAt: ISODateTime;
  readonly endAt?: ISODateTime;
  /** Can users dismiss this announcement? */
  readonly dismissible: boolean;
  readonly actionLabel?: string;
  readonly actionUrl?: URL;
  readonly status: EntityStatus;
  /** Number of times viewed */
  readonly viewCount: number;
  /** Number of times dismissed */
  readonly dismissCount: number;
  readonly createdBy: UserId;
  readonly createdAt: ISODateTime;
}

/**
 * Tracks which users have dismissed an announcement
 */
export interface AnnouncementDismissal {
  readonly announcementId: UUID;
  readonly userId: UserId;
  readonly dismissedAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create an announcement
 */
export interface CreateAnnouncementData {
  readonly tenantId?: TenantId;
  readonly title: string;
  readonly content: string;
  readonly type: AnnouncementType;
  readonly priority: NotificationPriority;
  readonly targetAudience: TargetAudience;
  readonly startAt: ISODateTime;
  readonly endAt?: ISODateTime;
  readonly dismissible: boolean;
  readonly actionLabel?: string;
  readonly actionUrl?: URL;
  readonly createdBy: UserId;
}

/**
 * Data for updating an announcement
 */
export interface UpdateAnnouncementData {
  readonly title?: string;
  readonly content?: string;
  readonly type?: AnnouncementType;
  readonly priority?: NotificationPriority;
  readonly targetAudience?: TargetAudience;
  readonly startAt?: ISODateTime;
  readonly endAt?: ISODateTime;
  readonly dismissible?: boolean;
  readonly actionLabel?: string;
  readonly actionUrl?: URL;
  readonly status?: EntityStatus;
}
