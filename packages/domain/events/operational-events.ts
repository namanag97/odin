/**
 * Operational Domain Events
 * 
 * Events for feature flags and system configuration.
 */

import type { Event } from '@odin/core-contracts';
import type { UserId } from '@odin/core-contracts';

// ============================================================================
// Event Type Constants
// ============================================================================

export const OperationalEventTypes = {
  // Feature flag events
  FEATURE_FLAG_CREATED: 'feature_flag.created',
  FEATURE_FLAG_UPDATED: 'feature_flag.updated',
  FEATURE_FLAG_DELETED: 'feature_flag.deleted',
  FEATURE_FLAG_TOGGLED: 'feature_flag.toggled',
  
  // System config events
  SYSTEM_CONFIG_CHANGED: 'system_config.changed',
  SYSTEM_CONFIG_DELETED: 'system_config.deleted',
  
  // Tenant settings events
  TENANT_SETTINGS_UPDATED: 'tenant_settings.updated',
  TENANT_BRANDING_UPDATED: 'tenant_settings.branding_updated',
  TENANT_SECURITY_UPDATED: 'tenant_settings.security_updated',
} as const;

// ============================================================================
// Feature Flag Event Payloads
// ============================================================================

/** Payload for feature_flag.created event */
export interface FeatureFlagCreatedPayload {
  readonly flagKey: string;
  readonly flagName: string;
  readonly defaultValue: boolean;
  readonly createdBy: UserId;
}

/** Payload for feature_flag.toggled event */
export interface FeatureFlagToggledPayload {
  readonly flagKey: string;
  readonly previousValue: boolean;
  readonly newValue: boolean;
  readonly changedBy: UserId;
}

/** Payload for feature_flag.deleted event */
export interface FeatureFlagDeletedPayload {
  readonly flagKey: string;
  readonly deletedBy: UserId;
}

// ============================================================================
// System Config Event Payloads
// ============================================================================

/** Payload for system_config.changed event */
export interface SystemConfigChangedPayload {
  readonly key: string;
  readonly previousValue: unknown;
  readonly newValue: unknown;
  readonly changedBy: UserId;
}

/** Payload for system_config.deleted event */
export interface SystemConfigDeletedPayload {
  readonly key: string;
  readonly deletedBy: UserId;
}

// ============================================================================
// Typed Event Aliases
// ============================================================================

export type FeatureFlagCreatedEvent = Event<FeatureFlagCreatedPayload>;
export type FeatureFlagToggledEvent = Event<FeatureFlagToggledPayload>;
export type FeatureFlagDeletedEvent = Event<FeatureFlagDeletedPayload>;

export type SystemConfigChangedEvent = Event<SystemConfigChangedPayload>;
export type SystemConfigDeletedEvent = Event<SystemConfigDeletedPayload>;
