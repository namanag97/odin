# L2 SERVICE CONTRACTS — INFRASTRUCTURE & INTEGRATION
> File storage, caching, queuing, notifications, and external integrations

---

## FILE STORAGE SERVICE

```typescript
/**
 * Abstraction over file storage (local, S3, GCS, Azure Blob).
 */
interface IFileStorageService extends IService {
  // Upload
  uploadFile(input: UploadFileInput, ctx: OperationContext): AsyncResult<StoredFile>;
  uploadChunked(input: UploadChunkedInput, ctx: OperationContext): AsyncResult<ChunkedUploadSession>;
  completeChunkedUpload(sessionId: UUID, ctx: OperationContext): AsyncResult<StoredFile>;
  abortChunkedUpload(sessionId: UUID, ctx: OperationContext): AsyncResult<void>;
  
  // Download
  downloadFile(fileId: UUID, ctx: OperationContext): AsyncResult<FileDownload>;
  getSignedUrl(input: SignedUrlInput, ctx: OperationContext): AsyncResult<SignedUrl>;
  
  // Management
  getFileMetadata(fileId: UUID, ctx: OperationContext): AsyncResult<StoredFile>;
  listFiles(input: ListFilesInput, ctx: OperationContext): AsyncResult<PaginatedResult<StoredFile>>;
  deleteFile(fileId: UUID, ctx: OperationContext): AsyncResult<void>;
  copyFile(input: CopyFileInput, ctx: OperationContext): AsyncResult<StoredFile>;
  moveFile(input: MoveFileInput, ctx: OperationContext): AsyncResult<StoredFile>;
  
  // Utilities
  getStorageUsage(ctx: OperationContext): AsyncResult<StorageUsage>;
  validateFile(input: ValidateFileInput, ctx: OperationContext): AsyncResult<FileValidation>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface UploadFileInput {
  readonly content: Buffer | ReadableStream;
  readonly filename: string;
  readonly mimeType: string;
  readonly category: FileCategory;
  readonly metadata?: Record<string, string>;
  readonly visibility?: FileVisibility;
}

type FileCategory = 
  | 'import'           // Data imports
  | 'export'           // Generated exports
  | 'attachment'       // User attachments
  | 'model'            // Process models
  | 'temp';            // Temporary files

type FileVisibility = 'private' | 'internal' | 'public';

interface StoredFile {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly filename: string;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly size: number;
  readonly category: FileCategory;
  readonly visibility: FileVisibility;
  readonly checksum: string;
  readonly storagePath: string;
  readonly metadata: Record<string, string>;
  readonly uploadedBy: UserId;
  readonly createdAt: ISODateTime;
  readonly expiresAt?: ISODateTime;
}

interface UploadChunkedInput {
  readonly filename: string;
  readonly mimeType: string;
  readonly totalSize: number;
  readonly chunkSize: number;
  readonly category: FileCategory;
}

interface ChunkedUploadSession {
  readonly sessionId: UUID;
  readonly uploadUrl: URL;
  readonly expiresAt: ISODateTime;
  readonly chunkSize: number;
  readonly totalChunks: number;
}

interface FileDownload {
  readonly file: StoredFile;
  readonly content: ReadableStream;
}

interface SignedUrlInput {
  readonly fileId: UUID;
  readonly operation: 'read' | 'write';
  readonly expiresIn: Duration;
  readonly contentDisposition?: 'inline' | 'attachment';
}

interface SignedUrl {
  readonly url: URL;
  readonly expiresAt: ISODateTime;
  readonly headers?: Record<string, string>;
}

interface ListFilesInput {
  readonly category?: FileCategory;
  readonly mimeTypes?: readonly string[];
  readonly uploadedBy?: UserId;
  readonly dateRange?: DateRange;
  readonly search?: string;
  readonly pagination?: Pagination;
}

interface CopyFileInput {
  readonly sourceFileId: UUID;
  readonly newFilename?: string;
  readonly newCategory?: FileCategory;
}

interface MoveFileInput {
  readonly fileId: UUID;
  readonly newCategory: FileCategory;
}

interface StorageUsage {
  readonly totalBytes: number;
  readonly limitBytes: number;
  readonly usagePercentage: Percentage;
  readonly byCategory: Record<FileCategory, number>;
  readonly fileCount: number;
}

interface ValidateFileInput {
  readonly fileId?: UUID;
  readonly content?: Buffer;
  readonly expectedMimeTypes?: readonly string[];
  readonly maxSize?: number;
  readonly validateContent?: boolean;
}

interface FileValidation {
  readonly valid: boolean;
  readonly detectedMimeType: string;
  readonly size: number;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}
```

---

## CACHE SERVICE

```typescript
/**
 * Distributed caching abstraction (Redis, Memcached).
 */
interface ICacheService extends IService {
  // Basic Operations
  get<T>(key: string, ctx: OperationContext): AsyncResult<T | null>;
  set<T>(input: CacheSetInput<T>, ctx: OperationContext): AsyncResult<void>;
  delete(key: string, ctx: OperationContext): AsyncResult<boolean>;
  exists(key: string, ctx: OperationContext): AsyncResult<boolean>;
  
  // Batch Operations
  getMany<T>(keys: readonly string[], ctx: OperationContext): AsyncResult<Map<string, T>>;
  setMany<T>(items: readonly CacheItem<T>[], ctx: OperationContext): AsyncResult<void>;
  deleteMany(keys: readonly string[], ctx: OperationContext): AsyncResult<number>;
  
  // Pattern Operations
  deletePattern(pattern: string, ctx: OperationContext): AsyncResult<number>;
  getKeys(pattern: string, ctx: OperationContext): AsyncResult<readonly string[]>;
  
  // Cache-aside Pattern
  getOrSet<T>(input: CacheOrSetInput<T>, ctx: OperationContext): AsyncResult<T>;
  
  // Invalidation
  invalidateByTags(tags: readonly string[], ctx: OperationContext): AsyncResult<number>;
  invalidateByPrefix(prefix: string, ctx: OperationContext): AsyncResult<number>;
  
  // Locking
  acquireLock(key: string, ttl: Duration, ctx: OperationContext): AsyncResult<CacheLock | null>;
  releaseLock(lock: CacheLock, ctx: OperationContext): AsyncResult<boolean>;
  
  // Stats
  getStats(ctx: OperationContext): AsyncResult<CacheStats>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CacheSetInput<T> {
  readonly key: string;
  readonly value: T;
  readonly ttl?: Duration;
  readonly tags?: readonly string[];
}

interface CacheItem<T> {
  readonly key: string;
  readonly value: T;
  readonly ttl?: Duration;
}

interface CacheOrSetInput<T> {
  readonly key: string;
  readonly factory: () => AsyncResult<T>;
  readonly ttl?: Duration;
  readonly tags?: readonly string[];
  readonly staleWhileRevalidate?: boolean;
}

interface CacheLock {
  readonly key: string;
  readonly token: string;
  readonly acquiredAt: ISODateTime;
  readonly expiresAt: ISODateTime;
}

interface CacheStats {
  readonly hits: number;
  readonly misses: number;
  readonly hitRate: Percentage;
  readonly memoryUsed: number;
  readonly memoryLimit: number;
  readonly keyCount: number;
}

// Cache Key Conventions
type CacheKeyBuilder = {
  // Entity caching
  entity: (type: string, id: UUID) => string;
  // e.g., "entity:data_pool:550e8400-..."
  
  // Query result caching
  query: (service: string, method: string, hash: string) => string;
  // e.g., "query:case_analytics:get_cases:abc123"
  
  // User session data
  session: (sessionId: UUID) => string;
  
  // Computed results
  computed: (type: string, modelId: DataModelId, hash: string) => string;
  // e.g., "computed:dfg:model123:filterHash"
  
  // Rate limiting
  rateLimit: (key: string, window: string) => string;
};
```

---

## JOB QUEUE SERVICE

```typescript
/**
 * Background job processing (Bull, BullMQ, or custom).
 */
interface IJobQueueService extends IService {
  // Job Management
  enqueue<T>(input: EnqueueJobInput<T>, ctx: OperationContext): AsyncResult<QueuedJob>;
  enqueueBatch<T>(jobs: readonly EnqueueJobInput<T>[], ctx: OperationContext): AsyncResult<readonly QueuedJob[]>;
  
  // Scheduling
  schedule<T>(input: ScheduleJobInput<T>, ctx: OperationContext): AsyncResult<QueuedJob>;
  cancelScheduled(jobId: UUID, ctx: OperationContext): AsyncResult<boolean>;
  
  // Job Status
  getJob(jobId: UUID, ctx: OperationContext): AsyncResult<QueuedJob | null>;
  getJobStatus(jobId: UUID, ctx: OperationContext): AsyncResult<JobStatus>;
  getJobProgress(jobId: UUID, ctx: OperationContext): AsyncResult<JobProgress>;
  
  // Job Control
  retryJob(jobId: UUID, ctx: OperationContext): AsyncResult<QueuedJob>;
  cancelJob(jobId: UUID, ctx: OperationContext): AsyncResult<boolean>;
  pauseQueue(queueName: string, ctx: OperationContext): AsyncResult<void>;
  resumeQueue(queueName: string, ctx: OperationContext): AsyncResult<void>;
  
  // Queue Management
  getQueueStats(queueName: string, ctx: OperationContext): AsyncResult<QueueStats>;
  cleanQueue(input: CleanQueueInput, ctx: OperationContext): AsyncResult<number>;
  drainQueue(queueName: string, ctx: OperationContext): AsyncResult<number>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface EnqueueJobInput<T> {
  readonly queue: QueueName;
  readonly type: JobType;
  readonly payload: T;
  readonly priority?: JobPriority;
  readonly delay?: Duration;
  readonly attempts?: number;
  readonly backoff?: BackoffStrategy;
  readonly timeout?: Duration;
  readonly removeOnComplete?: boolean;
  readonly removeOnFail?: boolean;
}

type QueueName = 
  | 'data-import'
  | 'data-model-load'
  | 'process-discovery'
  | 'conformance-check'
  | 'action-flow-execution'
  | 'sensor-evaluation'
  | 'notification'
  | 'export'
  | 'cleanup';

type JobType = 
  | 'import_csv' | 'import_xlsx' | 'import_parquet'
  | 'load_data_model' | 'reload_data_model'
  | 'discover_process' | 'discover_dfg' | 'discover_ocpn'
  | 'check_conformance' | 'compute_alignments'
  | 'execute_action_flow' | 'evaluate_sensor'
  | 'send_notification' | 'send_email' | 'call_webhook'
  | 'export_view' | 'export_model'
  | 'cleanup_temp_files' | 'cleanup_expired_sessions';

type JobPriority = 1 | 2 | 3 | 4 | 5;  // 1 = highest

interface BackoffStrategy {
  readonly type: 'fixed' | 'exponential' | 'custom';
  readonly delay: Duration;
  readonly maxDelay?: Duration;
}

interface QueuedJob {
  readonly id: UUID;
  readonly queue: QueueName;
  readonly type: JobType;
  readonly status: JobStatus;
  readonly priority: JobPriority;
  readonly payload: unknown;
  readonly progress: JobProgress;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly error?: string;
  readonly result?: unknown;
  readonly createdAt: ISODateTime;
  readonly startedAt?: ISODateTime;
  readonly completedAt?: ISODateTime;
  readonly scheduledFor?: ISODateTime;
}

type JobStatus = 
  | 'waiting'      // In queue
  | 'active'       // Being processed
  | 'completed'    // Successfully finished
  | 'failed'       // Failed after all retries
  | 'delayed'      // Scheduled for later
  | 'paused'       // Queue is paused
  | 'stuck';       // Stalled

interface JobProgress {
  readonly percentage: Percentage;
  readonly current: number;
  readonly total: number;
  readonly message?: string;
  readonly stage?: string;
}

interface ScheduleJobInput<T> extends EnqueueJobInput<T> {
  readonly runAt: ISODateTime;
  readonly repeat?: RepeatOptions;
}

interface RepeatOptions {
  readonly pattern: string;  // Cron expression
  readonly limit?: number;
  readonly endDate?: ISODateTime;
}

interface QueueStats {
  readonly name: QueueName;
  readonly waiting: number;
  readonly active: number;
  readonly completed: number;
  readonly failed: number;
  readonly delayed: number;
  readonly paused: boolean;
  readonly avgProcessingTime: Duration;
  readonly throughput: number;  // Jobs per minute
}

interface CleanQueueInput {
  readonly queueName: QueueName;
  readonly status: 'completed' | 'failed';
  readonly olderThan: Duration;
}
```

---

## NOTIFICATION SERVICE

```typescript
interface INotificationService extends IService {
  // Send Notifications
  send(input: SendNotificationInput, ctx: OperationContext): AsyncResult<Notification>;
  sendBulk(input: SendBulkNotificationInput, ctx: OperationContext): AsyncResult<BulkSendResult>;
  sendToChannel(input: SendToChannelInput, ctx: OperationContext): AsyncResult<ChannelDeliveryResult>;
  
  // User Notifications
  getUserNotifications(input: GetUserNotificationsInput, ctx: OperationContext): AsyncResult<PaginatedResult<Notification>>;
  getUnreadCount(userId: UserId, ctx: OperationContext): AsyncResult<number>;
  markAsRead(notificationId: UUID, ctx: OperationContext): AsyncResult<void>;
  markAllAsRead(userId: UserId, ctx: OperationContext): AsyncResult<number>;
  
  // Preferences
  getUserPreferences(userId: UserId, ctx: OperationContext): AsyncResult<NotificationPreferences>;
  updateUserPreferences(input: UpdatePreferencesInput, ctx: OperationContext): AsyncResult<NotificationPreferences>;
  
  // Templates
  renderTemplate(input: RenderTemplateInput, ctx: OperationContext): AsyncResult<RenderedNotification>;
  
  // Subscriptions
  subscribe(input: SubscribeInput, ctx: OperationContext): AsyncResult<NotificationSubscription>;
  unsubscribe(subscriptionId: UUID, ctx: OperationContext): AsyncResult<void>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface SendNotificationInput {
  readonly userId: UserId;
  readonly type: NotificationType;
  readonly channels: readonly NotificationChannel[];
  readonly templateKey?: string;
  readonly title: string;
  readonly body: string;
  readonly data?: Record<string, unknown>;
  readonly actionUrl?: URL;
  readonly priority?: NotificationPriority;
  readonly expiresAt?: ISODateTime;
}

interface SendBulkNotificationInput {
  readonly userIds: readonly UserId[];
  readonly type: NotificationType;
  readonly channels: readonly NotificationChannel[];
  readonly templateKey?: string;
  readonly title: string;
  readonly body: string;
  readonly data?: Record<string, unknown>;
}

interface BulkSendResult {
  readonly sent: number;
  readonly failed: number;
  readonly errors: readonly { userId: UserId; error: string }[];
}

interface SendToChannelInput {
  readonly userId: UserId;
  readonly channel: NotificationChannel;
  readonly content: ChannelContent;
}

type ChannelContent = 
  | { channel: 'email'; subject: string; html: string; text?: string; attachments?: readonly EmailAttachment[] }
  | { channel: 'slack'; message: SlackMessage }
  | { channel: 'webhook'; payload: Record<string, unknown> }
  | { channel: 'in_app'; title: string; body: string };

interface EmailAttachment {
  readonly filename: string;
  readonly content: Buffer;
  readonly mimeType: string;
}

interface SlackMessage {
  readonly text: string;
  readonly blocks?: readonly SlackBlock[];
  readonly attachments?: readonly SlackAttachment[];
}

interface SlackBlock {
  readonly type: string;
  readonly [key: string]: unknown;
}

interface SlackAttachment {
  readonly color?: string;
  readonly title?: string;
  readonly text?: string;
  readonly fields?: readonly { title: string; value: string; short?: boolean }[];
}

interface ChannelDeliveryResult {
  readonly channel: NotificationChannel;
  readonly success: boolean;
  readonly messageId?: string;
  readonly error?: string;
}

interface GetUserNotificationsInput {
  readonly userId: UserId;
  readonly unreadOnly?: boolean;
  readonly types?: readonly NotificationType[];
  readonly pagination?: Pagination;
}

interface NotificationPreferences {
  readonly userId: UserId;
  readonly channels: Record<NotificationChannel, boolean>;
  readonly typeSettings: Record<NotificationType, ChannelPreference>;
  readonly quietHours?: QuietHours;
  readonly digestSettings?: DigestSettings;
}

interface ChannelPreference {
  readonly enabled: boolean;
  readonly channels: readonly NotificationChannel[];
}

interface QuietHours {
  readonly enabled: boolean;
  readonly start: string;  // HH:mm
  readonly end: string;
  readonly timezone: string;
}

interface DigestSettings {
  readonly enabled: boolean;
  readonly frequency: 'daily' | 'weekly';
  readonly time: string;  // HH:mm
}

interface UpdatePreferencesInput {
  readonly userId: UserId;
  readonly preferences: Partial<NotificationPreferences>;
}

interface RenderTemplateInput {
  readonly templateKey: string;
  readonly locale?: string;
  readonly variables: Record<string, unknown>;
}

interface RenderedNotification {
  readonly subject?: string;
  readonly title: string;
  readonly body: string;
  readonly html?: string;
}

interface SubscribeInput {
  readonly userId: UserId;
  readonly eventTypes: readonly string[];
  readonly channel: NotificationChannel;
  readonly filter?: Record<string, unknown>;
}

interface NotificationSubscription {
  readonly id: UUID;
  readonly userId: UserId;
  readonly eventTypes: readonly string[];
  readonly channel: NotificationChannel;
  readonly filter?: Record<string, unknown>;
  readonly createdAt: ISODateTime;
}
```

---

## WEBHOOK SERVICE

```typescript
interface IWebhookService extends IService {
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
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CreateWebhookInput {
  readonly name: string;
  readonly url: URL;
  readonly events: readonly WebhookEvent[];
  readonly headers?: Record<string, string>;
  readonly retryPolicy?: RetryPolicy;
}

interface UpdateWebhookInput {
  readonly id: UUID;
  readonly name?: string;
  readonly url?: URL;
  readonly events?: readonly WebhookEvent[];
  readonly headers?: Record<string, string>;
  readonly status?: EntityStatus;
}

interface ListWebhooksInput {
  readonly status?: EntityStatus;
  readonly event?: WebhookEvent;
  readonly pagination?: Pagination;
}

interface WebhookTestResult {
  readonly success: boolean;
  readonly statusCode?: number;
  readonly responseTime: Duration;
  readonly responseBody?: string;
  readonly error?: string;
}

interface TriggerWebhookInput {
  readonly webhookId?: UUID;
  readonly event: WebhookEvent;
  readonly payload: Record<string, unknown>;
}

interface DeliveryHistoryInput {
  readonly webhookId: UUID;
  readonly status?: DeliveryStatus;
  readonly dateRange?: DateRange;
  readonly pagination?: Pagination;
}

// Webhook Payload Structure
interface WebhookPayload<T = unknown> {
  readonly id: UUID;
  readonly type: WebhookEvent;
  readonly timestamp: ISODateTime;
  readonly tenantId: TenantId;
  readonly apiVersion: string;
  readonly data: T;
}

// Webhook Signature Header
// X-Webhook-Signature: t=1640995200,v1=signature
```

---

## INTEGRATION SERVICE

```typescript
interface IIntegrationService extends IService {
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
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CreateIntegrationInput {
  readonly type: IntegrationType;
  readonly name: string;
  readonly config: IntegrationConfig;
  readonly credentials?: IntegrationCredentials;
}

interface IntegrationCredentials {
  readonly type: 'basic' | 'api_key' | 'oauth' | 'certificate';
  readonly username?: string;
  readonly password?: string;
  readonly apiKey?: string;
  readonly certificate?: string;
  readonly privateKey?: string;
}

interface UpdateIntegrationInput {
  readonly id: UUID;
  readonly name?: string;
  readonly config?: Partial<IntegrationConfig>;
  readonly status?: IntegrationStatus;
}

interface ListIntegrationsInput {
  readonly type?: IntegrationType;
  readonly status?: IntegrationStatus;
  readonly pagination?: Pagination;
}

interface ConnectionTestResult {
  readonly success: boolean;
  readonly latency: Duration;
  readonly version?: string;
  readonly capabilities?: readonly string[];
  readonly error?: string;
}

interface InitiateOAuthInput {
  readonly integrationType: IntegrationType;
  readonly redirectUrl: URL;
  readonly scopes: readonly string[];
}

interface OAuthInitiation {
  readonly authorizationUrl: URL;
  readonly state: string;
  readonly codeVerifier?: string;
}

interface CompleteOAuthInput {
  readonly integrationType: IntegrationType;
  readonly code: string;
  readonly state: string;
  readonly codeVerifier?: string;
}

interface FetchDataInput {
  readonly integrationId: UUID;
  readonly query: IntegrationQuery;
  readonly pagination?: Pagination;
}

interface IntegrationQuery {
  readonly type: 'table' | 'query' | 'api';
  readonly table?: string;
  readonly query?: string;
  readonly endpoint?: string;
  readonly parameters?: Record<string, unknown>;
}

interface FetchedData {
  readonly columns: readonly Column[];
  readonly rows: readonly Record<string, unknown>[];
  readonly total: number;
  readonly hasMore: boolean;
  readonly metadata?: Record<string, unknown>;
}

interface PushDataInput {
  readonly integrationId: UUID;
  readonly target: string;
  readonly data: readonly Record<string, unknown>[];
  readonly mode: 'insert' | 'upsert' | 'replace';
}

interface PushResult {
  readonly inserted: number;
  readonly updated: number;
  readonly failed: number;
  readonly errors: readonly string[];
}

interface SyncJob {
  readonly id: UUID;
  readonly integrationId: UUID;
  readonly status: ExecutionStatus;
  readonly direction: 'inbound' | 'outbound' | 'bidirectional';
  readonly recordsSynced: number;
  readonly errors: readonly string[];
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
}

interface SyncHistoryInput {
  readonly integrationId: UUID;
  readonly status?: ExecutionStatus;
  readonly dateRange?: DateRange;
  readonly pagination?: Pagination;
}

interface IntegrationHealth {
  readonly status: HealthStatus;
  readonly lastCheckedAt: ISODateTime;
  readonly lastSuccessfulConnection?: ISODateTime;
  readonly consecutiveFailures: number;
  readonly issues: readonly HealthIssue[];
}

interface HealthIssue {
  readonly severity: 'warning' | 'error';
  readonly code: string;
  readonly message: string;
  readonly detectedAt: ISODateTime;
}
```

---

## API KEY SERVICE

```typescript
interface IApiKeyService extends IService {
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
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CreateApiKeyInput {
  readonly name: string;
  readonly scopes: readonly ApiScope[];
  readonly expiresAt?: ISODateTime;
  readonly rateLimit?: number;
  readonly allowedIps?: readonly string[];
}

interface CreatedApiKey {
  readonly apiKey: ApiKey;
  readonly plainKey: string;  // Only returned on creation, never stored
}

interface ListApiKeysInput {
  readonly status?: EntityStatus;
  readonly userId?: UserId;
  readonly pagination?: Pagination;
}

interface ApiKeyValidation {
  readonly valid: boolean;
  readonly apiKey?: ApiKey;
  readonly error?: string;
}

interface ApiKeyUsageInput {
  readonly apiKeyId: UUID;
  readonly dateRange: DateRange;
  readonly granularity: TimeGranularity;
}

interface ApiKeyUsage {
  readonly apiKeyId: UUID;
  readonly totalRequests: number;
  readonly successfulRequests: number;
  readonly failedRequests: number;
  readonly byEndpoint: Record<string, number>;
  readonly byStatusCode: Record<number, number>;
  readonly timeSeries: readonly { timestamp: ISODateTime; count: number }[];
}
```

---

## AUDIT SERVICE

```typescript
interface IAuditService extends IService {
  // Logging
  log(input: CreateAuditLogInput, ctx: OperationContext): AsyncResult<void>;
  logBatch(logs: readonly CreateAuditLogInput[], ctx: OperationContext): AsyncResult<void>;
  
  // Querying
  search(input: AuditSearchInput, ctx: OperationContext): AsyncResult<PaginatedResult<AuditLog>>;
  getByResource(input: ResourceAuditInput, ctx: OperationContext): AsyncResult<PaginatedResult<AuditLog>>;
  getByActor(input: ActorAuditInput, ctx: OperationContext): AsyncResult<PaginatedResult<AuditLog>>;
  
  // Analytics
  getActivitySummary(input: ActivitySummaryInput, ctx: OperationContext): AsyncResult<ActivitySummary>;
  getSecurityEvents(input: SecurityEventsInput, ctx: OperationContext): AsyncResult<PaginatedResult<AuditLog>>;
  
  // Export
  exportAuditLogs(input: ExportAuditInput, ctx: OperationContext): AsyncResult<ExportJob>;
  
  // Retention
  archiveLogs(input: ArchiveLogsInput, ctx: OperationContext): AsyncResult<ArchiveResult>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CreateAuditLogInput {
  readonly action: AuditAction;
  readonly resource: AuditResource;
  readonly outcome: AuditOutcome;
  readonly changes?: AuditChanges;
  readonly metadata?: Record<string, unknown>;
}

interface AuditSearchInput {
  readonly criteria: AuditSearchCriteria;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

interface ResourceAuditInput {
  readonly resourceType: ResourceType;
  readonly resourceId: UUID;
  readonly dateRange?: DateRange;
  readonly pagination?: Pagination;
}

interface ActorAuditInput {
  readonly actorId: UserId;
  readonly dateRange?: DateRange;
  readonly categories?: readonly AuditCategory[];
  readonly pagination?: Pagination;
}

interface ActivitySummaryInput {
  readonly dateRange: DateRange;
  readonly groupBy?: 'category' | 'actor' | 'resource_type' | 'day';
}

interface SecurityEventsInput {
  readonly dateRange: DateRange;
  readonly severity?: 'all' | 'warning' | 'critical';
  readonly pagination?: Pagination;
}

interface ExportAuditInput {
  readonly criteria: AuditSearchCriteria;
  readonly format: 'csv' | 'json';
  readonly includeChanges: boolean;
}

interface ExportJob {
  readonly id: UUID;
  readonly status: ExecutionStatus;
  readonly fileId?: UUID;
  readonly recordCount?: number;
}

interface ArchiveLogsInput {
  readonly olderThan: ISODateTime;
  readonly destination: 'cold_storage' | 'delete';
}

interface ArchiveResult {
  readonly archivedCount: number;
  readonly archiveLocation?: string;
}
```
