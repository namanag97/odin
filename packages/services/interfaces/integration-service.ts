import type {
  AsyncResult,
  UUID,
  ISODateTime,
  Duration,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, DateRange, Column } from "./common";

/**
 * External integration management service.
 */
export interface IIntegrationService extends IService {
  // Connection Management
  createIntegration(input: CreateIntegrationInput, ctx: OperationContext): AsyncResult<Integration>;
  updateIntegration(input: UpdateIntegrationInput, ctx: OperationContext): AsyncResult<Integration>;
  deleteIntegration(id: UUID, ctx: OperationContext): AsyncResult<void>;
  getIntegration(id: UUID, ctx: OperationContext): AsyncResult<Integration>;
  listIntegrations(input: ListIntegrationsInput, ctx: OperationContext): AsyncResult<PaginatedResult<Integration>>;

  // Connection Testing
  testConnection(id: UUID, ctx: OperationContext): AsyncResult<ConnectionTestResult>;

  // OAuth
  initiateOAuth(input: InitiateOAuthInput, ctx: OperationContext): AsyncResult<OAuthInitiation>;
  completeOAuth(input: CompleteOAuthInput, ctx: OperationContext): AsyncResult<Integration>;
  refreshOAuthToken(integrationId: UUID, ctx: OperationContext): AsyncResult<void>;

  // Data Operations
  fetchData(input: FetchDataInput, ctx: OperationContext): AsyncResult<FetchedData>;
  pushData(input: PushDataInput, ctx: OperationContext): AsyncResult<PushResult>;

  // Sync
  syncIntegration(id: UUID, ctx: OperationContext): AsyncResult<SyncJob>;
  getSyncHistory(input: SyncHistoryInput, ctx: OperationContext): AsyncResult<PaginatedResult<SyncJob>>;

  // Health
  checkHealth(id: UUID, ctx: OperationContext): AsyncResult<IntegrationHealth>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type IntegrationType =
  | 'database' | 'api' | 'file_storage' | 'erp' | 'crm'
  | 'salesforce' | 'sap' | 'oracle' | 'snowflake' | 'bigquery'
  | 'postgres' | 'mysql' | 'mssql' | 'mongodb';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface Integration {
  readonly id: UUID;
  readonly type: IntegrationType;
  readonly name: string;
  readonly status: IntegrationStatus;
  readonly config: IntegrationConfig;
  readonly lastSyncAt?: ISODateTime;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface IntegrationConfig {
  readonly host?: string;
  readonly port?: number;
  readonly database?: string;
  readonly schema?: string;
  readonly endpoint?: string;
  readonly options?: Record<string, unknown>;
}

export interface IntegrationCredentials {
  readonly type: 'basic' | 'api_key' | 'oauth' | 'certificate';
  readonly username?: string;
  readonly password?: string;
  readonly apiKey?: string;
  readonly certificate?: string;
  readonly privateKey?: string;
}

export interface CreateIntegrationInput {
  readonly type: IntegrationType;
  readonly name: string;
  readonly config: IntegrationConfig;
  readonly credentials?: IntegrationCredentials;
}

export interface UpdateIntegrationInput {
  readonly id: UUID;
  readonly name?: string;
  readonly config?: Partial<IntegrationConfig>;
  readonly status?: IntegrationStatus;
}

export interface ListIntegrationsInput {
  readonly type?: IntegrationType;
  readonly status?: IntegrationStatus;
  readonly pagination?: Pagination;
}

export interface ConnectionTestResult {
  readonly success: boolean;
  readonly latency: Duration;
  readonly version?: string;
  readonly capabilities?: readonly string[];
  readonly error?: string;
}

export interface InitiateOAuthInput {
  readonly integrationType: IntegrationType;
  readonly redirectUrl: string;
  readonly scopes: readonly string[];
}

export interface OAuthInitiation {
  readonly authorizationUrl: string;
  readonly state: string;
  readonly codeVerifier?: string;
}

export interface CompleteOAuthInput {
  readonly integrationType: IntegrationType;
  readonly code: string;
  readonly state: string;
  readonly codeVerifier?: string;
}

export interface FetchDataInput {
  readonly integrationId: UUID;
  readonly query: IntegrationQuery;
  readonly pagination?: Pagination;
}

export interface IntegrationQuery {
  readonly type: 'table' | 'query' | 'api';
  readonly table?: string;
  readonly query?: string;
  readonly endpoint?: string;
  readonly parameters?: Record<string, unknown>;
}

export interface FetchedData {
  readonly columns: readonly Column[];
  readonly rows: readonly Record<string, unknown>[];
  readonly total: number;
  readonly hasMore: boolean;
  readonly metadata?: Record<string, unknown>;
}

export interface PushDataInput {
  readonly integrationId: UUID;
  readonly target: string;
  readonly data: readonly Record<string, unknown>[];
  readonly mode: 'insert' | 'upsert' | 'replace';
}

export interface PushResult {
  readonly inserted: number;
  readonly updated: number;
  readonly failed: number;
  readonly errors: readonly string[];
}

export interface SyncJob {
  readonly id: UUID;
  readonly integrationId: UUID;
  readonly status: ExecutionStatus;
  readonly direction: 'inbound' | 'outbound' | 'bidirectional';
  readonly recordsSynced: number;
  readonly errors: readonly string[];
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
}

export interface SyncHistoryInput {
  readonly integrationId: UUID;
  readonly status?: ExecutionStatus;
  readonly dateRange?: DateRange;
  readonly pagination?: Pagination;
}

export interface IntegrationHealth {
  readonly status: HealthStatus;
  readonly lastCheckedAt: ISODateTime;
  readonly lastSuccessfulConnection?: ISODateTime;
  readonly consecutiveFailures: number;
  readonly issues: readonly HealthIssue[];
}

export interface HealthIssue {
  readonly severity: 'warning' | 'error';
  readonly code: string;
  readonly message: string;
  readonly detectedAt: ISODateTime;
}
