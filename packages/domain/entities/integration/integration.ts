/**
 * Integration Entity - Integration Layer
 * 
 * Third-party service connections (data sources, exports, etc.)
 */

import type {
  UUID,
  TenantId,
  ISODateTime,
  Brand,
} from '@odin/core-contracts';

// ============================================================================
// Branded IDs
// ============================================================================

/** Branded Integration ID */
export type IntegrationId = Brand<UUID, 'IntegrationId'>;

/** Cast function for IntegrationId */
export const asIntegrationId = (id: string): IntegrationId => id as unknown as IntegrationId;

// ============================================================================
// Integration Types
// ============================================================================

/** Type of integration */
export type IntegrationType = 
  | 'database' 
  | 'file_storage' 
  | 'erp' 
  | 'crm'
  | 'data_warehouse' 
  | 'bi_tool' 
  | 'notification';

/** Status of the integration */
export type IntegrationStatus = 'pending' | 'connected' | 'error' | 'disabled';

/** Capabilities of an integration */
export type IntegrationCapability = 
  | 'import' 
  | 'export' 
  | 'realtime' 
  | 'batch' 
  | 'bidirectional';

/** Health status of an integration */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Integration configuration
 */
export interface IntegrationConfig {
  readonly host?: string;
  readonly port?: number;
  readonly database?: string;
  readonly schema?: string;
  readonly options?: Record<string, unknown>;
}

/**
 * Encrypted credentials for an integration
 */
export interface EncryptedCredentials {
  readonly encryptedData: string;
  readonly keyId: string;
  readonly algorithm: string;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * Integration - Third-party service connection
 */
export interface Integration {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly type: IntegrationType;
  readonly name: string;
  readonly status: IntegrationStatus;
  readonly config: IntegrationConfig;
  readonly credentials: EncryptedCredentials;
  readonly capabilities: readonly IntegrationCapability[];
  readonly lastSyncAt?: ISODateTime;
  readonly healthStatus: HealthStatus;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create an integration
 */
export interface CreateIntegrationData {
  readonly tenantId: TenantId;
  readonly type: IntegrationType;
  readonly name: string;
  readonly config: IntegrationConfig;
  readonly credentials: EncryptedCredentials;
  readonly capabilities?: readonly IntegrationCapability[];
}

/**
 * Data for updating an integration
 */
export interface UpdateIntegrationData {
  readonly name?: string;
  readonly config?: IntegrationConfig;
  readonly credentials?: EncryptedCredentials;
  readonly status?: IntegrationStatus;
}
