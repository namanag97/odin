import type {
  AsyncResult,
  UUID,
  TenantId,
  ISODateTime,
  Duration,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, DateRange } from "./common";

/**
 * Webhook management and delivery service.
 */
export interface IWebhookService extends IService {
  // Webhook Management
  createWebhook(input: CreateWebhookInput, ctx: OperationContext): AsyncResult<Webhook>;
  updateWebhook(input: UpdateWebhookInput, ctx: OperationContext): AsyncResult<Webhook>;
  deleteWebhook(id: UUID, ctx: OperationContext): AsyncResult<void>;
  getWebhook(id: UUID, ctx: OperationContext): AsyncResult<Webhook>;
  listWebhooks(input: ListWebhooksInput, ctx: OperationContext): AsyncResult<PaginatedResult<Webhook>>;

  // Testing
  testWebhook(id: UUID, ctx: OperationContext): AsyncResult<WebhookTestResult>;

  // Delivery
  triggerWebhook(input: TriggerWebhookInput, ctx: OperationContext): AsyncResult<WebhookDelivery>;
  getDeliveryHistory(input: DeliveryHistoryInput, ctx: OperationContext): AsyncResult<PaginatedResult<WebhookDelivery>>;
  retryDelivery(deliveryId: UUID, ctx: OperationContext): AsyncResult<WebhookDelivery>;

  // Signing
  generateSignature(payload: string, secret: string): string;
  verifySignature(payload: string, signature: string, secret: string): boolean;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type WebhookEvent =
  | 'data_pool.created' | 'data_pool.updated' | 'data_pool.deleted'
  | 'data_model.created' | 'data_model.loaded' | 'data_model.deleted'
  | 'process_model.discovered' | 'process_model.updated'
  | 'job.completed' | 'job.failed'
  | 'sensor.triggered' | 'action_flow.completed'
  | 'conformance.completed' | 'analysis.completed';

export type DeliveryStatus = 'pending' | 'delivered' | 'failed' | 'retrying';

export type EntityStatus = 'active' | 'inactive' | 'deleted';

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface Webhook {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly url: string;
  readonly secret: string;
  readonly events: readonly WebhookEvent[];
  readonly headers?: Record<string, string>;
  readonly status: EntityStatus;
  readonly retryPolicy: RetryPolicy;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface RetryPolicy {
  readonly maxRetries: number;
  readonly retryDelay: Duration;
  readonly backoffMultiplier?: number;
}

export interface CreateWebhookInput {
  readonly name: string;
  readonly url: string;
  readonly events: readonly WebhookEvent[];
  readonly headers?: Record<string, string>;
  readonly retryPolicy?: RetryPolicy;
}

export interface UpdateWebhookInput {
  readonly id: UUID;
  readonly name?: string;
  readonly url?: string;
  readonly events?: readonly WebhookEvent[];
  readonly headers?: Record<string, string>;
  readonly status?: EntityStatus;
}

export interface ListWebhooksInput {
  readonly status?: EntityStatus;
  readonly event?: WebhookEvent;
  readonly pagination?: Pagination;
}

export interface WebhookTestResult {
  readonly success: boolean;
  readonly statusCode?: number;
  readonly responseTime: Duration;
  readonly responseBody?: string;
  readonly error?: string;
}

export interface TriggerWebhookInput {
  readonly webhookId?: UUID;
  readonly event: WebhookEvent;
  readonly payload: Record<string, unknown>;
}

export interface WebhookDelivery {
  readonly id: UUID;
  readonly webhookId: UUID;
  readonly event: WebhookEvent;
  readonly payload: Record<string, unknown>;
  readonly status: DeliveryStatus;
  readonly statusCode?: number;
  readonly response?: string;
  readonly error?: string;
  readonly attempts: number;
  readonly createdAt: ISODateTime;
  readonly deliveredAt?: ISODateTime;
  readonly nextRetryAt?: ISODateTime;
}

export interface DeliveryHistoryInput {
  readonly webhookId: UUID;
  readonly status?: DeliveryStatus;
  readonly dateRange?: DateRange;
  readonly pagination?: Pagination;
}

/**
 * Webhook Payload Structure sent to webhook endpoints.
 */
export interface WebhookPayload<T = unknown> {
  readonly id: UUID;
  readonly type: WebhookEvent;
  readonly timestamp: ISODateTime;
  readonly tenantId: TenantId;
  readonly apiVersion: string;
  readonly data: T;
}
