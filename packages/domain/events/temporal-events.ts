/**
 * Temporal Layer Domain Events
 * 
 * Events for audit, integration, communication, and scheduled jobs.
 */

import type {
  UUID,
  TenantId,
  UserId,
  Event,
  Duration,
} from '@odin/core-contracts';
import type {
  AuditActor,
  AuditOutcome,
} from '../entities/temporal/audit-log';
import type { IntegrationType } from '../entities/integration/integration';
import type { WebhookEvent } from '../entities/integration/webhook';
import type { NotificationChannel, NotificationType } from '../entities/temporal/notification';
import type { JobError } from '../entities/temporal/scheduled-job';

// ============================================================================
// Audit Events
// ============================================================================

/**
 * Security-related audit event
 */
export type SecurityAuditEvent = Event<{
  category: 'authentication' | 'authorization' | 'security';
  action: string;
  actor: AuditActor;
  outcome: AuditOutcome;
  details: Record<string, unknown>;
}>;

// ============================================================================
// Integration Events
// ============================================================================

/**
 * Integration successfully connected
 */
export type IntegrationConnectedEvent = Event<{
  integrationId: UUID;
  type: IntegrationType;
  tenantId: TenantId;
}>;

/**
 * Integration connection failed
 */
export type IntegrationFailedEvent = Event<{
  integrationId: UUID;
  error: string;
  consecutiveFailures: number;
}>;

/**
 * Webhook successfully delivered
 */
export type WebhookDeliveredEvent = Event<{
  webhookId: UUID;
  deliveryId: UUID;
  event: WebhookEvent;
  responseCode: number;
}>;

// ============================================================================
// Notification Events
// ============================================================================

/**
 * Notification sent to user
 */
export type NotificationSentEvent = Event<{
  notificationId: UUID;
  userId: UserId;
  channel: NotificationChannel;
  type: NotificationType;
}>;

// ============================================================================
// Job Events
// ============================================================================

/**
 * Scheduled job completed successfully
 */
export type JobCompletedEvent = Event<{
  jobId: UUID;
  executionId: UUID;
  duration: Duration;
  output?: Record<string, unknown>;
}>;

/**
 * Scheduled job failed
 */
export type JobFailedEvent = Event<{
  jobId: UUID;
  executionId: UUID;
  error: JobError;
  willRetry: boolean;
}>;
