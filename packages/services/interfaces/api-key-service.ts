import type {
  AsyncResult,
  UUID,
  UserId,
  ISODateTime,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, DateRange } from "./common";

/**
 * Request context for API key validation (no full auth required).
 */
export interface RequestContext {
  readonly requestId: UUID;
  readonly ip?: string;
  readonly userAgent?: string;
}

/**
 * API key management service.
 */
export interface IApiKeyService extends IService {
  // Key Management
  createApiKey(input: CreateApiKeyInput, ctx: OperationContext): AsyncResult<CreatedApiKey>;
  revokeApiKey(id: UUID, ctx: OperationContext): AsyncResult<void>;
  getApiKey(id: UUID, ctx: OperationContext): AsyncResult<ApiKey>;
  listApiKeys(input: ListApiKeysInput, ctx: OperationContext): AsyncResult<PaginatedResult<ApiKey>>;

  // Rotation
  rotateApiKey(id: UUID, ctx: OperationContext): AsyncResult<CreatedApiKey>;

  // Validation
  validateApiKey(key: string, ctx: RequestContext): AsyncResult<ApiKeyValidation>;

  // Usage
  getApiKeyUsage(input: ApiKeyUsageInput, ctx: OperationContext): AsyncResult<ApiKeyUsage>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type ApiKeyStatus = 'active' | 'inactive' | 'revoked';

export type ApiKeyTimeGranularity = 'hour' | 'day' | 'week' | 'month';

export type ApiScope =
  | 'read:data_pools' | 'write:data_pools'
  | 'read:data_models' | 'write:data_models'
  | 'read:process_models' | 'write:process_models'
  | 'read:analytics' | 'write:analytics'
  | 'admin';

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface ApiKey {
  readonly id: UUID;
  readonly tenantId: UUID;
  readonly userId: UserId;
  readonly name: string;
  readonly keyPrefix: string;  // First 8 chars for identification
  readonly scopes: readonly ApiScope[];
  readonly status: ApiKeyStatus;
  readonly lastUsedAt?: ISODateTime;
  readonly expiresAt?: ISODateTime;
  readonly rateLimit?: number;
  readonly allowedIps?: readonly string[];
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateApiKeyInput {
  readonly name: string;
  readonly scopes: readonly ApiScope[];
  readonly expiresAt?: ISODateTime;
  readonly rateLimit?: number;
  readonly allowedIps?: readonly string[];
}

export interface CreatedApiKey {
  readonly apiKey: ApiKey;
  readonly plainKey: string;  // Only returned on creation, never stored
}

export interface ListApiKeysInput {
  readonly status?: ApiKeyStatus;
  readonly userId?: UserId;
  readonly pagination?: Pagination;
}

export interface ApiKeyValidation {
  readonly valid: boolean;
  readonly apiKey?: ApiKey;
  readonly error?: string;
}

export interface ApiKeyUsageInput {
  readonly apiKeyId: UUID;
  readonly dateRange: DateRange;
  readonly granularity: ApiKeyTimeGranularity;
}

export interface ApiKeyUsage {
  readonly apiKeyId: UUID;
  readonly totalRequests: number;
  readonly successfulRequests: number;
  readonly failedRequests: number;
  readonly byEndpoint: Record<string, number>;
  readonly byStatusCode: Record<number, number>;
  readonly timeSeries: readonly { timestamp: ISODateTime; count: number }[];
}
