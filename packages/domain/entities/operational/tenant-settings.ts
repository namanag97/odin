/**
 * TenantSettings Entity - Operational Layer
 * 
 * Extended tenant-level configuration for branding,
 * security, notifications, and process mining defaults.
 */

import type {
  TenantId,
  UserId,
  ISODateTime,
  URL,
  Duration,
  Brand,
} from '@odin/core-contracts';

import type { DiscoveryAlgorithm, ConformanceMethod } from '@odin/core-contracts';

// ============================================================================
// Branded IDs
// ============================================================================

/** Branded TenantSettings ID */
export type TenantSettingsId = Brand<TenantId, 'TenantSettingsId'>;

/** Cast function for TenantSettingsId */
export const asTenantSettingsId = (id: string): TenantSettingsId => id as unknown as TenantSettingsId;

// ============================================================================
// Branding Settings
// ============================================================================

/**
 * Tenant branding configuration
 */
export interface BrandingSettings {
  readonly logoUrl?: URL;
  readonly faviconUrl?: URL;
  readonly primaryColor?: string;
  readonly accentColor?: string;
  readonly customCss?: string;
}

// ============================================================================
// Security Settings
// ============================================================================

/**
 * Password policy configuration
 */
export interface PasswordPolicy {
  readonly minLength: number;
  readonly requireUppercase: boolean;
  readonly requireLowercase: boolean;
  readonly requireNumbers: boolean;
  readonly requireSpecialChars: boolean;
  readonly maxAgeDays?: number;
  readonly preventReuse: number;
}

/**
 * Security configuration for a tenant
 */
export interface SecuritySettings {
  readonly passwordPolicy: PasswordPolicy;
  readonly sessionTimeout: Duration;
  readonly mfaRequired: boolean;
  readonly mfaGracePeriodDays: number;
  readonly ipWhitelist?: readonly string[];
  readonly allowedDomains?: readonly string[];
}

// ============================================================================
// Notification Settings
// ============================================================================

/** Digest frequency for notifications */
export type DigestFrequency = 'daily' | 'weekly' | 'never';

/**
 * Notification configuration
 */
export interface NotificationSettings {
  readonly emailEnabled: boolean;
  readonly slackEnabled: boolean;
  readonly webhookEnabled: boolean;
  readonly digestFrequency: DigestFrequency;
}

// ============================================================================
// Process Mining Settings
// ============================================================================

/**
 * Default process mining configuration
 */
export interface ProcessMiningSettings {
  readonly defaultDiscoveryAlgorithm: DiscoveryAlgorithm;
  readonly defaultConformanceMethod: ConformanceMethod;
  readonly activityDisplayLimit: number;
  readonly variantDisplayLimit: number;
  readonly autoReloadOnDataChange: boolean;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * ExtendedTenantSettings - Extended tenant configuration
 * 
 * This extends the basic TenantSettings from the existence layer
 * with branding, security, notifications, and process mining defaults.
 */
export interface ExtendedTenantSettings {
  readonly tenantId: TenantId;
  
  // Branding
  readonly branding: BrandingSettings;
  
  // Security
  readonly security: SecuritySettings;
  
  // Notifications
  readonly notifications: NotificationSettings;
  
  // Process Mining Defaults
  readonly processMining: ProcessMiningSettings;
  
  readonly updatedAt: ISODateTime;
  readonly updatedBy: UserId;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data for creating tenant settings
 */
export interface CreateTenantSettingsData {
  readonly tenantId: TenantId;
  readonly branding?: Partial<BrandingSettings>;
  readonly security?: Partial<SecuritySettings>;
  readonly notifications?: Partial<NotificationSettings>;
  readonly processMining?: Partial<ProcessMiningSettings>;
}

/**
 * Data for updating tenant settings
 */
export interface UpdateTenantSettingsData {
  readonly branding?: Partial<BrandingSettings>;
  readonly security?: Partial<SecuritySettings>;
  readonly notifications?: Partial<NotificationSettings>;
  readonly processMining?: Partial<ProcessMiningSettings>;
}

/**
 * Alias for CreateTenantSettingsData
 */
export type CreateExtendedTenantSettingsData = CreateTenantSettingsData;

/**
 * Alias for UpdateTenantSettingsData
 */
export type UpdateExtendedTenantSettingsData = UpdateTenantSettingsData;

// ============================================================================
// Defaults
// ============================================================================

/** Default password policy */
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  preventReuse: 3,
};

/** Default notification settings */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailEnabled: true,
  slackEnabled: false,
  webhookEnabled: false,
  digestFrequency: 'weekly',
};

/** Default process mining settings */
export const DEFAULT_PROCESS_MINING_SETTINGS: ProcessMiningSettings = {
  defaultDiscoveryAlgorithm: 'inductive',
  defaultConformanceMethod: 'token_replay',
  activityDisplayLimit: 50,
  variantDisplayLimit: 100,
  autoReloadOnDataChange: true,
};
