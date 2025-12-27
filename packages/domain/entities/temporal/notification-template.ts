/**
 * NotificationTemplate Entity - Temporal Layer (Communication)
 * 
 * Reusable notification templates with variable substitution.
 */

import type {
  UUID,
  TenantId,
  ISODateTime,
  DataType,
  Brand,
} from '@odin/core-contracts';
import type { NotificationChannel } from './notification';

// ============================================================================
// Branded IDs
// ============================================================================

/** Branded NotificationTemplate ID */
export type NotificationTemplateId = Brand<UUID, 'NotificationTemplateId'>;

/** Cast function for NotificationTemplateId */
export const asNotificationTemplateId = (id: string): NotificationTemplateId => 
  id as unknown as NotificationTemplateId;

// ============================================================================
// Template Variables
// ============================================================================

/**
 * Template variable definition
 */
export interface TemplateVariable {
  readonly name: string;
  readonly type: DataType;
  readonly required: boolean;
  readonly defaultValue?: unknown;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * NotificationTemplate - Reusable notification template
 * 
 * Supports Handlebars/Mustache-style variable substitution.
 */
export interface NotificationTemplate {
  readonly id: UUID;
  /** null = system template (available to all tenants) */
  readonly tenantId?: TenantId;
  /** Unique key for template lookup */
  readonly key: string;
  readonly name: string;
  readonly channel: NotificationChannel;
  /** Email subject line (for email channel) */
  readonly subject?: string;
  /** Template body with variable placeholders */
  readonly bodyTemplate: string;
  /** Available variables for substitution */
  readonly variables: readonly TemplateVariable[];
  /** Locale/language code (e.g., 'en', 'es') */
  readonly locale: string;
  readonly isActive: boolean;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a notification template
 */
export interface CreateTemplateData {
  readonly tenantId?: TenantId;
  readonly key: string;
  readonly name: string;
  readonly channel: NotificationChannel;
  readonly subject?: string;
  readonly bodyTemplate: string;
  readonly variables: readonly TemplateVariable[];
  readonly locale: string;
  readonly isActive?: boolean;
}

/**
 * Data for updating a notification template
 */
export interface UpdateTemplateData {
  readonly name?: string;
  readonly subject?: string;
  readonly bodyTemplate?: string;
  readonly variables?: readonly TemplateVariable[];
  readonly isActive?: boolean;
}
