/**
 * Webhook Repository Interface - Integration Layer
 * 
 * Data access contract for Webhook entities.
 */

import type { 
  UUID, 
  TenantId, 
  EntityStatus,
  AsyncResult,
  PageRequest,
  PageResponse
} from '@odin/core-contracts';

import type { 
  Webhook,
  WebhookEvent,
  WebhookDelivery,
  DeliveryStatus,
  CreateWebhookData,
  UpdateWebhookData,
  CreateDeliveryData
} from '../../entities/integration/webhook';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IWebhookRepository - Webhook data access contract
 */
export interface IWebhookRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find a webhook by ID
   */
  findById(id: UUID): AsyncResult<Webhook | null>;
  
  /**
   * Find webhooks by tenant
   */
  findByTenantId(
    tenantId: TenantId, 
    options?: PageRequest
  ): AsyncResult<PageResponse<Webhook>>;
  
  /**
   * Find webhooks subscribed to an event
   */
  findByEvent(
    tenantId: TenantId, 
    event: WebhookEvent
  ): AsyncResult<readonly Webhook[]>;
  
  /**
   * Find active webhooks for delivery
   */
  findActive(tenantId: TenantId): AsyncResult<readonly Webhook[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new webhook
   */
  create(data: CreateWebhookData): AsyncResult<Webhook>;
  
  /**
   * Update a webhook
   */
  update(id: UUID, data: UpdateWebhookData): AsyncResult<Webhook>;
  
  /**
   * Update webhook status
   */
  updateStatus(id: UUID, status: EntityStatus): AsyncResult<Webhook>;
  
  /**
   * Delete a webhook
   */
  delete(id: UUID): AsyncResult<void>;
  
  /**
   * Regenerate webhook secret
   */
  regenerateSecret(id: UUID): AsyncResult<{ webhook: Webhook; secret: string }>;

  // -------------------------------------------------------------------------
  // Delivery Tracking
  // -------------------------------------------------------------------------
  
  /**
   * Create a delivery record
   */
  createDelivery(data: CreateDeliveryData): AsyncResult<WebhookDelivery>;
  
  /**
   * Get deliveries for a webhook
   */
  getDeliveries(
    webhookId: UUID, 
    options?: PageRequest
  ): AsyncResult<PageResponse<WebhookDelivery>>;
  
  /**
   * Update delivery status
   */
  updateDeliveryStatus(
    deliveryId: UUID, 
    status: DeliveryStatus
  ): AsyncResult<WebhookDelivery>;
  
  /**
   * Record a delivery attempt
   */
  recordAttempt(
    deliveryId: UUID,
    responseCode: number | undefined,
    responseBody: string | undefined,
    error: string | undefined,
    durationMs: number
  ): AsyncResult<WebhookDelivery>;

  // -------------------------------------------------------------------------
  // Failure Tracking
  // -------------------------------------------------------------------------
  
  /**
   * Increment consecutive failures
   */
  incrementFailures(id: UUID): AsyncResult<number>;
  
  /**
   * Reset consecutive failures
   */
  resetFailures(id: UUID): AsyncResult<void>;
}
