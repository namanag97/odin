/**
 * Event Bus Contract
 * L0 Core Contract - Publish/Subscribe interface for event-driven architecture
 */

// ============================================================================
// Event Types
// ============================================================================

/**
 * Base event structure
 */
export interface BaseEvent {
  /** Unique event ID */
  id: string;
  /** Event type (e.g., 'user.created', 'job.completed') */
  type: string;
  /** Timestamp when event occurred */
  timestamp: string;
  /** Source service that emitted the event */
  source: string;
  /** Correlation ID for tracing */
  correlationId?: string;
  /** Tenant ID if applicable */
  tenantId?: string;
}

/**
 * Typed event with payload
 */
export interface Event<T = unknown> extends BaseEvent {
  /** Event payload */
  payload: T;
  /** Event metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Subscription
// ============================================================================

/**
 * Event handler function
 */
export type EventHandler<T = unknown> = (event: Event<T>) => void | Promise<void>;

/**
 * Subscription options
 */
export interface SubscribeOptions {
  /** Queue/group name for competing consumers */
  queue?: string;
  /** Start from beginning of stream */
  fromBeginning?: boolean;
  /** Concurrency limit */
  concurrency?: number;
  /** Retry configuration */
  retry?: {
    maxRetries: number;
    backoffMs: number;
  };
}

/**
 * Subscription handle for unsubscribing
 */
export interface Subscription {
  /** Subscription ID */
  id: string;
  /** Event type subscribed to */
  eventType: string;
  /** Unsubscribe from events */
  unsubscribe(): Promise<void>;
}

// ============================================================================
// Publish Options
// ============================================================================

/**
 * Options for publishing events
 */
export interface PublishOptions {
  /** Delay before delivering the event (ms) */
  delay?: number;
  /** Priority (higher = more urgent) */
  priority?: number;
  /** Deduplication key */
  deduplicationId?: string;
}

// ============================================================================
// Event Bus Interface
// ============================================================================

/**
 * Event bus interface for pub/sub messaging
 * Abstracted from concrete implementations (in-memory, Redis, Kafka, etc.)
 */
export interface EventBus {
  /**
   * Publish an event
   * @param event Event to publish
   * @param options Publish options
   */
  publish<T>(event: Event<T>, options?: PublishOptions): Promise<void>;
  
  /**
   * Publish multiple events
   * @param events Events to publish
   * @param options Publish options
   */
  publishMany<T>(events: Event<T>[], options?: PublishOptions): Promise<void>;
  
  /**
   * Subscribe to events of a specific type
   * @param eventType Event type pattern (supports wildcards)
   * @param handler Event handler function
   * @param options Subscription options
   */
  subscribe<T>(
    eventType: string,
    handler: EventHandler<T>,
    options?: SubscribeOptions
  ): Promise<Subscription>;
  
  /**
   * Unsubscribe from all events
   */
  unsubscribeAll(): Promise<void>;
  
  /**
   * Close the event bus connection
   */
  close(): Promise<void>;
}

// ============================================================================
// Event Factory
// ============================================================================

/**
 * Create a new event
 */
export const createEvent = <T>(
  type: string,
  payload: T,
  options: {
    source: string;
    tenantId?: string;
    correlationId?: string;
    metadata?: Record<string, unknown>;
  }
): Event<T> => ({
  id: crypto.randomUUID(),
  type,
  payload,
  timestamp: new Date().toISOString(),
  source: options.source,
  tenantId: options.tenantId,
  correlationId: options.correlationId,
  metadata: options.metadata,
});

// ============================================================================
// Common Event Types
// ============================================================================

/**
 * Standard domain event types
 */
export const EventTypes = {
  // Entity lifecycle
  CREATED: (entity: string) => `${entity}.created`,
  UPDATED: (entity: string) => `${entity}.updated`,
  DELETED: (entity: string) => `${entity}.deleted`,
  
  // Job events
  JOB_STARTED: 'job.started',
  JOB_COMPLETED: 'job.completed',
  JOB_FAILED: 'job.failed',
  JOB_CANCELLED: 'job.cancelled',
  
  // User events
  USER_SIGNED_UP: 'user.signed_up',
  USER_SIGNED_IN: 'user.signed_in',
  USER_SIGNED_OUT: 'user.signed_out',
  
  // Tenant events
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_SUSPENDED: 'tenant.suspended',
} as const;
