/**
 * Notification Repository Interface - Temporal Layer
 * 
 * Repository for managing user notifications.
 */

import type {
  UUID,
  UserId,
  ISODateTime,
  AsyncResult,
  PageRequest,
  PageResponse,
} from '@odin/core-contracts';
import type {
  Notification,
  NotificationType,
  NotificationChannel,
  CreateNotificationData,
} from '../../entities/temporal/notification';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Extended query options for notifications
 */
export interface NotificationQueryOptions extends PageRequest {
  /** Filter to unread notifications only */
  readonly unreadOnly?: boolean;
  /** Filter by notification types */
  readonly types?: readonly NotificationType[];
  /** Filter by channels */
  readonly channels?: readonly NotificationChannel[];
}

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * Repository interface for Notification entity
 */
export interface INotificationRepository {
  // Queries
  findById(id: UUID): AsyncResult<Notification | null>;
  findByUserId(
    userId: UserId,
    options?: NotificationQueryOptions
  ): AsyncResult<PageResponse<Notification>>;
  getUnreadCount(userId: UserId): AsyncResult<number>;

  // Commands
  create(data: CreateNotificationData): AsyncResult<Notification>;
  createBulk(
    data: readonly CreateNotificationData[]
  ): AsyncResult<readonly Notification[]>;

  // Status Updates
  markAsRead(id: UUID): AsyncResult<void>;
  markAllAsRead(userId: UserId): AsyncResult<number>;
  markAsSent(id: UUID): AsyncResult<void>;

  // Cleanup
  deleteOlderThan(cutoffDate: ISODateTime): AsyncResult<number>;
}
