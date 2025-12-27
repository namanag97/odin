import type {
  AsyncResult,
  UUID,
  UserId,
  ISODateTime,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination } from "./common";

/**
 * Notification service for multi-channel delivery.
 */
export interface INotificationService extends IService {
  // Send Notifications
  send(input: SendNotificationInput, ctx: OperationContext): AsyncResult<Notification>;
  sendBulk(input: SendBulkNotificationInput, ctx: OperationContext): AsyncResult<BulkSendResult>;
  sendToChannel(input: SendToChannelInput, ctx: OperationContext): AsyncResult<ChannelDeliveryResult>;

  // User Notifications
  getUserNotifications(input: GetUserNotificationsInput, ctx: OperationContext): AsyncResult<PaginatedResult<Notification>>;
  getUnreadCount(userId: UserId, ctx: OperationContext): AsyncResult<number>;
  markAsRead(notificationId: UUID, ctx: OperationContext): AsyncResult<void>;
  markAllAsRead(userId: UserId, ctx: OperationContext): AsyncResult<number>;

  // Preferences
  getUserPreferences(userId: UserId, ctx: OperationContext): AsyncResult<NotificationPreferences>;
  updateUserPreferences(input: UpdatePreferencesInput, ctx: OperationContext): AsyncResult<NotificationPreferences>;

  // Templates
  renderTemplate(input: RenderTemplateInput, ctx: OperationContext): AsyncResult<RenderedNotification>;

  // Subscriptions
  subscribe(input: SubscribeInput, ctx: OperationContext): AsyncResult<NotificationSubscription>;
  unsubscribe(subscriptionId: UUID, ctx: OperationContext): AsyncResult<void>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'in_app' | 'sms' | 'push';

export type NotificationType =
  | 'system' | 'alert' | 'info' | 'success' | 'warning' | 'error'
  | 'job_completed' | 'job_failed' | 'threshold_exceeded'
  | 'sensor_triggered' | 'action_flow_completed';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface Notification {
  readonly id: UUID;
  readonly userId: UserId;
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string;
  readonly data?: Record<string, unknown>;
  readonly actionUrl?: string;
  readonly read: boolean;
  readonly createdAt: ISODateTime;
  readonly readAt?: ISODateTime;
}

export interface SendNotificationInput {
  readonly userId: UserId;
  readonly type: NotificationType;
  readonly channels: readonly NotificationChannel[];
  readonly templateKey?: string;
  readonly title: string;
  readonly body: string;
  readonly data?: Record<string, unknown>;
  readonly actionUrl?: string;
  readonly priority?: NotificationPriority;
  readonly expiresAt?: ISODateTime;
}

export interface SendBulkNotificationInput {
  readonly userIds: readonly UserId[];
  readonly type: NotificationType;
  readonly channels: readonly NotificationChannel[];
  readonly templateKey?: string;
  readonly title: string;
  readonly body: string;
  readonly data?: Record<string, unknown>;
}

export interface BulkSendResult {
  readonly sent: number;
  readonly failed: number;
  readonly errors: readonly { userId: UserId; error: string }[];
}

export interface SendToChannelInput {
  readonly userId: UserId;
  readonly channel: NotificationChannel;
  readonly content: ChannelContent;
}

export type ChannelContent =
  | { channel: 'email'; subject: string; html: string; text?: string; attachments?: readonly EmailAttachment[] }
  | { channel: 'slack'; message: SlackMessage }
  | { channel: 'webhook'; payload: Record<string, unknown> }
  | { channel: 'in_app'; title: string; body: string };

export interface EmailAttachment {
  readonly filename: string;
  readonly content: Buffer;
  readonly mimeType: string;
}

export interface SlackMessage {
  readonly text: string;
  readonly blocks?: readonly SlackBlock[];
  readonly attachments?: readonly SlackAttachment[];
}

export interface SlackBlock {
  readonly type: string;
  readonly [key: string]: unknown;
}

export interface SlackAttachment {
  readonly color?: string;
  readonly title?: string;
  readonly text?: string;
  readonly fields?: readonly { title: string; value: string; short?: boolean }[];
}

export interface ChannelDeliveryResult {
  readonly channel: NotificationChannel;
  readonly success: boolean;
  readonly messageId?: string;
  readonly error?: string;
}

export interface GetUserNotificationsInput {
  readonly userId: UserId;
  readonly unreadOnly?: boolean;
  readonly types?: readonly NotificationType[];
  readonly pagination?: Pagination;
}

export interface NotificationPreferences {
  readonly userId: UserId;
  readonly channels: Record<NotificationChannel, boolean>;
  readonly typeSettings: Record<NotificationType, ChannelPreference>;
  readonly quietHours?: QuietHours;
  readonly digestSettings?: DigestSettings;
}

export interface ChannelPreference {
  readonly enabled: boolean;
  readonly channels: readonly NotificationChannel[];
}

export interface QuietHours {
  readonly enabled: boolean;
  readonly start: string;  // HH:mm
  readonly end: string;
  readonly timezone: string;
}

export interface DigestSettings {
  readonly enabled: boolean;
  readonly frequency: 'daily' | 'weekly';
  readonly time: string;  // HH:mm
}

export interface UpdatePreferencesInput {
  readonly userId: UserId;
  readonly preferences: Partial<NotificationPreferences>;
}

export interface RenderTemplateInput {
  readonly templateKey: string;
  readonly locale?: string;
  readonly variables: Record<string, unknown>;
}

export interface RenderedNotification {
  readonly subject?: string;
  readonly title: string;
  readonly body: string;
  readonly html?: string;
}

export interface SubscribeInput {
  readonly userId: UserId;
  readonly eventTypes: readonly string[];
  readonly channel: NotificationChannel;
  readonly filter?: Record<string, unknown>;
}

export interface NotificationSubscription {
  readonly id: UUID;
  readonly userId: UserId;
  readonly eventTypes: readonly string[];
  readonly channel: NotificationChannel;
  readonly filter?: Record<string, unknown>;
  readonly createdAt: ISODateTime;
}
