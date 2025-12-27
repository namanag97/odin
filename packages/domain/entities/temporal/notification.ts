/**
 * Notification Entity - Temporal Layer (Communication)
 * 
 * In-app and external notifications for users.
 */

import type {
  UUID,
  TenantId,
  UserId,
  ISODateTime,
  URL,
  Brand,
} from '@odin/core-contracts';

// ============================================================================
// Branded IDs
// ============================================================================

/** Branded Notification ID */
export type NotificationId = Brand<UUID, 'NotificationId'>;

/** Cast function for NotificationId */
export const asNotificationId = (id: string): NotificationId => id as unknown as NotificationId;

// ============================================================================
// Notification Types
// ============================================================================

/** Type of notification */
export type NotificationType = 
  | 'system'
  | 'task_assigned'
  | 'task_due'
  | 'signal_detected'
  | 'action_flow_completed'
  | 'action_flow_failed'
  | 'data_load_completed'
  | 'data_load_failed'
  | 'threshold_warning'
  | 'subscription_alert'
  | 'mention'
  | 'share';

/** Notification delivery channel */
export type NotificationChannel = 'in_app' | 'email' | 'slack' | 'webhook';

/** Notification priority level */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/** Notification delivery status */
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

// ============================================================================
// Entity
// ============================================================================

/**
 * Notification - User notification message
 * 
 * Supports multiple delivery channels and priority levels.
 */
export interface Notification {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly userId: UserId;
  readonly type: NotificationType;
  readonly channel: NotificationChannel;
  readonly priority: NotificationPriority;
  readonly title: string;
  readonly body: string;
  /** Additional structured data */
  readonly data?: Record<string, unknown>;
  /** URL for notification action */
  readonly actionUrl?: URL;
  readonly status: NotificationStatus;
  readonly readAt?: ISODateTime;
  readonly sentAt?: ISODateTime;
  readonly expiresAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a notification
 */
export interface CreateNotificationData {
  readonly tenantId: TenantId;
  readonly userId: UserId;
  readonly type: NotificationType;
  readonly channel: NotificationChannel;
  readonly priority: NotificationPriority;
  readonly title: string;
  readonly body: string;
  readonly data?: Record<string, unknown>;
  readonly actionUrl?: URL;
  readonly expiresAt?: ISODateTime;
}

/**
 * Data for updating a notification
 */
export interface UpdateNotificationData {
  readonly status?: NotificationStatus;
  readonly readAt?: ISODateTime;
  readonly sentAt?: ISODateTime;
}
