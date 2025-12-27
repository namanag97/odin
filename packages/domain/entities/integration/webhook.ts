/**
 * Webhook Entity - Integration Layer
 * 
 * Webhook configuration and delivery tracking.
 */

import type {
  UUID,
  TenantId,
  ISODateTime,
  Duration,
  URL,
  EntityStatus,
  Brand,
} from '@odin/core-contracts';

// ============================================================================
// Branded IDs
// ============================================================================

/** Branded Webhook ID */
export type WebhookId = Brand<UUID, 'WebhookId'>;

/** Cast function for WebhookId */
export const asWebhookId = (id: string): WebhookId => id as unknown as WebhookId;

// ============================================================================
// Event Types
// ============================================================================

/** Events that can trigger webhooks */
export type WebhookEvent = 
  | 'data_pool.created' 
  | 'data_pool.updated' 
  | 'data_pool.deleted'
  | 'data_model.loaded' 
  | 'data_model.failed'
  | 'action_flow.completed' 
  | 'action_flow.failed'
  | 'signal.created' 
  | 'task.created' 
  | 'task.completed'
  | 'subscription.changed' 
  | 'usage.threshold';

// ============================================================================
// Retry Policy
// ============================================================================

/**
 * Configuration for webhook retries
 */
export interface RetryPolicy {
  readonly maxRetries: number;
  readonly initialDelay: Duration;
  readonly maxDelay: Duration;
  readonly backoffMultiplier: number;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * Webhook - Outbound event notification configuration
 */
export interface Webhook {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly name: string;
  /** Target URL for webhook delivery */
  readonly url: URL;
  /** Secret for signature verification */
  readonly secret: string;
  /** Events this webhook subscribes to */
  readonly events: readonly WebhookEvent[];
  readonly status: EntityStatus;
  /** Additional headers to send with requests */
  readonly headers?: Record<string, string>;
  readonly retryPolicy: RetryPolicy;
  readonly lastTriggeredAt?: ISODateTime;
  readonly consecutiveFailures: number;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

// ============================================================================
// Delivery Tracking
// ============================================================================

/** Status of a webhook delivery */
export type DeliveryStatus = 'pending' | 'delivered' | 'failed' | 'expired';

/**
 * A single delivery attempt
 */
export interface DeliveryAttempt {
  readonly attemptNumber: number;
  readonly timestamp: ISODateTime;
  readonly responseCode?: number;
  readonly responseBody?: string;
  readonly error?: string;
  readonly duration: Duration;
}

/**
 * Record of a webhook delivery
 */
export interface WebhookDelivery {
  readonly id: UUID;
  readonly webhookId: UUID;
  readonly event: WebhookEvent;
  readonly payload: Record<string, unknown>;
  readonly status: DeliveryStatus;
  readonly attempts: readonly DeliveryAttempt[];
  readonly createdAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a webhook
 */
export interface CreateWebhookData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly url: URL;
  readonly events: readonly WebhookEvent[];
  readonly headers?: Record<string, string>;
  readonly retryPolicy?: RetryPolicy;
}

/**
 * Data for updating a webhook
 */
export interface UpdateWebhookData {
  readonly name?: string;
  readonly url?: URL;
  readonly events?: readonly WebhookEvent[];
  readonly headers?: Record<string, string>;
  readonly retryPolicy?: RetryPolicy;
  readonly status?: EntityStatus;
}

/**
 * Data for creating a webhook delivery
 */
export interface CreateDeliveryData {
  readonly webhookId: UUID;
  readonly event: WebhookEvent;
  readonly payload: Record<string, unknown>;
}
