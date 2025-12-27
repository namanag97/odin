# L1 DOMAIN CONTRACTS — TEMPORAL, INTEGRATION, COMMUNICATION LAYERS
> Audit trails, external connections, and notifications

---

## TEMPORAL LAYER
> Time-bound truth, audit, and compliance

### Entity: AuditLog

```typescript
/**
 * Immutable record of all significant system actions.
 */
interface AuditLog {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly timestamp: ISODateTime;
  readonly actor: AuditActor;
  readonly action: AuditAction;
  readonly resource: AuditResource;
  readonly outcome: AuditOutcome;
  readonly changes?: AuditChanges;
  readonly request: AuditRequest;
  readonly metadata?: Record<string, unknown>;
}

interface AuditActor {
  readonly type: ActorType;
  readonly id: UserId | UUID | null;        // null for system
  readonly email?: Email;
  readonly name?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly impersonatedBy?: UserId;
}

type ActorType = 'user' | 'api_key' | 'system' | 'webhook' | 'scheduler';

interface AuditAction {
  readonly type: string;                    // e.g., 'data_pool.create'
  readonly category: AuditCategory;
  readonly description: string;
}

type AuditCategory = 
  | 'authentication' | 'authorization' | 'data_access'
  | 'data_modification' | 'configuration' | 'integration'
  | 'export' | 'admin' | 'security';

interface AuditResource {
  readonly type: ResourceType;
  readonly id: UUID;
  readonly name?: string;
  readonly parentId?: UUID;
  readonly parentType?: ResourceType;
}

type AuditOutcome = 'success' | 'failure' | 'partial';

interface AuditChanges {
  readonly before?: Record<string, unknown>;
  readonly after?: Record<string, unknown>;
  readonly diff?: readonly FieldChange[];
}

interface FieldChange {
  readonly field: string;
  readonly previousValue: unknown;
  readonly newValue: unknown;
}

interface AuditRequest {
  readonly id: TraceId;
  readonly method?: string;
  readonly path?: string;
  readonly duration?: Duration;
}
```

### Repository: IAuditLogRepository

```typescript
interface IAuditLogRepository {
  // Write-only, append-only
  create(data: CreateAuditLogData): AsyncResult<AuditLog>;
  createBatch(logs: readonly CreateAuditLogData[]): AsyncResult<readonly AuditLog[]>;
  
  // Queries
  findById(id: UUID): AsyncResult<AuditLog | null>;
  
  search(
    tenantId: TenantId,
    criteria: AuditSearchCriteria,
    options?: QueryOptions
  ): AsyncResult<PaginatedResult<AuditLog>>;
  
  getByResource(
    resourceType: ResourceType,
    resourceId: UUID,
    options?: QueryOptions
  ): AsyncResult<PaginatedResult<AuditLog>>;
  
  getByActor(
    tenantId: TenantId,
    actorId: UserId,
    dateRange?: DateRange,
    options?: QueryOptions
  ): AsyncResult<PaginatedResult<AuditLog>>;
  
  // Aggregations
  getActivitySummary(
    tenantId: TenantId,
    dateRange: DateRange
  ): AsyncResult<ActivitySummary>;
  
  // Retention
  deleteOlderThan(tenantId: TenantId, cutoffDate: ISODateTime): AsyncResult<number>;
  archiveToStorage(tenantId: TenantId, cutoffDate: ISODateTime): AsyncResult<string>;
}

interface AuditSearchCriteria {
  readonly actorId?: UserId;
  readonly actorType?: ActorType;
  readonly actionType?: string;
  readonly category?: AuditCategory;
  readonly resourceType?: ResourceType;
  readonly resourceId?: UUID;
  readonly outcome?: AuditOutcome;
  readonly dateRange?: DateRange;
  readonly ipAddress?: string;
  readonly searchText?: string;
}

interface ActivitySummary {
  readonly totalActions: number;
  readonly byCategory: Record<AuditCategory, number>;
  readonly byOutcome: Record<AuditOutcome, number>;
  readonly topActors: readonly ActorActivity[];
  readonly topResources: readonly ResourceActivity[];
}
```

---

### Entity: EntityHistory

```typescript
/**
 * Versioned snapshots of entity state for time-travel queries.
 */
interface EntityHistory<T = unknown> {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly entityType: string;
  readonly entityId: UUID;
  readonly version: PositiveInt;
  readonly operation: HistoryOperation;
  readonly snapshot: T;
  readonly changes: readonly FieldChange[];
  readonly changedBy: UserId;
  readonly changedAt: ISODateTime;
  readonly reason?: string;
}

type HistoryOperation = 'create' | 'update' | 'delete' | 'restore';

interface IEntityHistoryRepository {
  record<T>(
    entityType: string,
    entityId: UUID,
    operation: HistoryOperation,
    snapshot: T,
    changes: readonly FieldChange[],
    context: ServiceContext
  ): AsyncResult<EntityHistory<T>>;
  
  getHistory<T>(
    entityType: string,
    entityId: UUID,
    options?: QueryOptions
  ): AsyncResult<PaginatedResult<EntityHistory<T>>>;
  
  getVersion<T>(
    entityType: string,
    entityId: UUID,
    version: number
  ): AsyncResult<EntityHistory<T> | null>;
  
  getAtPoint<T>(
    entityType: string,
    entityId: UUID,
    timestamp: ISODateTime
  ): AsyncResult<EntityHistory<T> | null>;
  
  compare<T>(
    entityType: string,
    entityId: UUID,
    versionA: number,
    versionB: number
  ): AsyncResult<EntityDiff>;
}

interface EntityDiff {
  readonly entityType: string;
  readonly entityId: UUID;
  readonly fromVersion: number;
  readonly toVersion: number;
  readonly changes: readonly FieldChange[];
}
```

---

### Entity: ComplianceRecord

```typescript
/**
 * Tracks compliance-related events and certifications.
 */
interface ComplianceRecord {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly type: ComplianceType;
  readonly status: ComplianceStatus;
  readonly framework: ComplianceFramework;
  readonly details: ComplianceDetails;
  readonly attestedBy?: UserId;
  readonly attestedAt?: ISODateTime;
  readonly expiresAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

type ComplianceType = 
  | 'data_processing_agreement'
  | 'data_retention_policy'
  | 'access_review'
  | 'security_assessment'
  | 'privacy_impact_assessment';

type ComplianceStatus = 'pending' | 'approved' | 'expired' | 'revoked';

type ComplianceFramework = 'gdpr' | 'ccpa' | 'hipaa' | 'soc2' | 'iso27001';

interface ComplianceDetails {
  readonly documentUrl?: URL;
  readonly findings?: readonly ComplianceFinding[];
  readonly controls?: readonly ControlAssessment[];
  readonly notes?: string;
}

interface ComplianceFinding {
  readonly id: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly description: string;
  readonly remediation?: string;
  readonly status: 'open' | 'remediated' | 'accepted';
}
```

---

### Entity: ScheduledJob

```typescript
interface ScheduledJob {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly type: JobType;
  readonly schedule: JobSchedule;
  readonly targetType: JobTargetType;
  readonly targetId: UUID;
  readonly configuration: Record<string, unknown>;
  readonly status: JobStatus;
  readonly lastRunAt?: ISODateTime;
  readonly lastRunStatus?: ExecutionStatus;
  readonly nextRunAt?: ISODateTime;
  readonly consecutiveFailures: number;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

type JobType = 
  | 'data_refresh' | 'model_reload' | 'export'
  | 'cleanup' | 'report' | 'action_flow';

type JobTargetType = 'data_pool' | 'data_model' | 'action_flow' | 'export';

type JobStatus = 'active' | 'paused' | 'disabled' | 'error';

interface JobSchedule {
  readonly type: ScheduleType;
  readonly cronExpression?: string;
  readonly interval?: Duration;
  readonly timezone: string;
  readonly startDate?: ISODateTime;
  readonly endDate?: ISODateTime;
  readonly maxRuns?: number;
}

type ScheduleType = 'cron' | 'interval' | 'once';

interface JobExecution {
  readonly id: UUID;
  readonly jobId: UUID;
  readonly status: ExecutionStatus;
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
  readonly duration?: Duration;
  readonly triggeredBy: TriggerSource;
  readonly output?: Record<string, unknown>;
  readonly error?: JobError;
}

type TriggerSource = 'schedule' | 'manual' | 'webhook' | 'dependency';

interface JobError {
  readonly code: string;
  readonly message: string;
  readonly stackTrace?: string;
  readonly retryable: boolean;
}
```

### Repository: IScheduledJobRepository

```typescript
interface IScheduledJobRepository {
  findById(id: UUID): AsyncResult<ScheduledJob | null>;
  findByTenantId(tenantId: TenantId, options?: QueryOptions): AsyncResult<PaginatedResult<ScheduledJob>>;
  findDue(cutoffTime: ISODateTime): AsyncResult<readonly ScheduledJob[]>;
  findByTarget(targetType: JobTargetType, targetId: UUID): AsyncResult<readonly ScheduledJob[]>;
  
  create(data: CreateJobData): AsyncResult<ScheduledJob>;
  update(id: UUID, data: UpdateJobData): AsyncResult<ScheduledJob>;
  updateStatus(id: UUID, status: JobStatus): AsyncResult<ScheduledJob>;
  delete(id: UUID): AsyncResult<void>;
  
  // Execution
  recordExecution(execution: CreateExecutionData): AsyncResult<JobExecution>;
  getExecutions(jobId: UUID, options?: QueryOptions): AsyncResult<PaginatedResult<JobExecution>>;
  getLastExecution(jobId: UUID): AsyncResult<JobExecution | null>;
  
  // Scheduling
  calculateNextRun(id: UUID): AsyncResult<ISODateTime | null>;
  updateNextRun(id: UUID, nextRun: ISODateTime): AsyncResult<void>;
}
```

---

## INTEGRATION LAYER
> External system connections and API access

### Entity: ApiKey

```typescript
interface ApiKey {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly userId: UserId;                  // Owner
  readonly name: string;
  readonly keyHash: string;                 // Hashed, never stored plain
  readonly keyPrefix: string;               // First 8 chars for identification
  readonly scopes: readonly ApiScope[];
  readonly rateLimit?: number;              // Override default
  readonly status: EntityStatus;
  readonly lastUsedAt?: ISODateTime;
  readonly expiresAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

type ApiScope = 
  | 'read:data_pools' | 'write:data_pools'
  | 'read:data_models' | 'write:data_models'
  | 'read:views' | 'write:views'
  | 'execute:action_flows'
  | 'read:analytics'
  | 'admin';

interface IApiKeyRepository {
  findById(id: UUID): AsyncResult<ApiKey | null>;
  findByKeyHash(keyHash: string): AsyncResult<ApiKey | null>;
  findByTenantId(tenantId: TenantId): AsyncResult<readonly ApiKey[]>;
  findByUserId(userId: UserId): AsyncResult<readonly ApiKey[]>;
  
  create(data: CreateApiKeyData): AsyncResult<{ apiKey: ApiKey; plainKey: string }>;
  update(id: UUID, data: UpdateApiKeyData): AsyncResult<ApiKey>;
  revoke(id: UUID): AsyncResult<void>;
  updateLastUsed(id: UUID): AsyncResult<void>;
  
  deleteExpired(): AsyncResult<number>;
  rotateKey(id: UUID): AsyncResult<{ apiKey: ApiKey; plainKey: string }>;
}
```

---

### Entity: Webhook

```typescript
interface Webhook {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly url: URL;
  readonly secret: string;                  // For signature verification
  readonly events: readonly WebhookEvent[];
  readonly status: EntityStatus;
  readonly headers?: Record<string, string>;
  readonly retryPolicy: RetryPolicy;
  readonly lastTriggeredAt?: ISODateTime;
  readonly consecutiveFailures: number;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

type WebhookEvent = 
  | 'data_pool.created' | 'data_pool.updated' | 'data_pool.deleted'
  | 'data_model.loaded' | 'data_model.failed'
  | 'action_flow.completed' | 'action_flow.failed'
  | 'signal.created' | 'task.created' | 'task.completed'
  | 'subscription.changed' | 'usage.threshold';

interface RetryPolicy {
  readonly maxRetries: number;
  readonly initialDelay: Duration;
  readonly maxDelay: Duration;
  readonly backoffMultiplier: number;
}

interface WebhookDelivery {
  readonly id: UUID;
  readonly webhookId: UUID;
  readonly event: WebhookEvent;
  readonly payload: Record<string, unknown>;
  readonly status: DeliveryStatus;
  readonly attempts: readonly DeliveryAttempt[];
  readonly createdAt: ISODateTime;
}

type DeliveryStatus = 'pending' | 'delivered' | 'failed' | 'expired';

interface DeliveryAttempt {
  readonly attemptNumber: number;
  readonly timestamp: ISODateTime;
  readonly responseCode?: number;
  readonly responseBody?: string;
  readonly error?: string;
  readonly duration: Duration;
}
```

---

### Entity: Integration

```typescript
/**
 * Third-party service connections (data sources, exports, etc.)
 */
interface Integration {
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

type IntegrationType = 
  | 'database' | 'file_storage' | 'erp' | 'crm'
  | 'data_warehouse' | 'bi_tool' | 'notification';

type IntegrationStatus = 'pending' | 'connected' | 'error' | 'disabled';

interface IntegrationConfig {
  readonly host?: string;
  readonly port?: number;
  readonly database?: string;
  readonly schema?: string;
  readonly options?: Record<string, unknown>;
}

interface EncryptedCredentials {
  readonly encryptedData: string;
  readonly keyId: string;
  readonly algorithm: string;
}

type IntegrationCapability = 
  | 'import' | 'export' | 'realtime' | 'batch' | 'bidirectional';

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
```

---

### Entity: OAuthToken

```typescript
interface OAuthToken {
  readonly id: UUID;
  readonly integrationId: UUID;
  readonly provider: string;
  readonly accessTokenEncrypted: string;
  readonly refreshTokenEncrypted?: string;
  readonly tokenType: string;
  readonly scopes: readonly string[];
  readonly expiresAt: ISODateTime;
  readonly refreshedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

interface IOAuthTokenRepository {
  findByIntegrationId(integrationId: UUID): AsyncResult<OAuthToken | null>;
  
  store(data: CreateOAuthTokenData): AsyncResult<OAuthToken>;
  refresh(id: UUID, newTokens: RefreshTokenData): AsyncResult<OAuthToken>;
  revoke(id: UUID): AsyncResult<void>;
  
  findExpiring(withinMinutes: number): AsyncResult<readonly OAuthToken[]>;
}
```

---

## COMMUNICATION LAYER
> Notifications and messaging

### Entity: Notification

```typescript
interface Notification {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly userId: UserId;
  readonly type: NotificationType;
  readonly channel: NotificationChannel;
  readonly priority: NotificationPriority;
  readonly title: string;
  readonly body: string;
  readonly data?: Record<string, unknown>;
  readonly actionUrl?: URL;
  readonly status: NotificationStatus;
  readonly readAt?: ISODateTime;
  readonly sentAt?: ISODateTime;
  readonly expiresAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

type NotificationType = 
  | 'system' | 'task_assigned' | 'task_due'
  | 'signal_detected' | 'action_flow_completed' | 'action_flow_failed'
  | 'data_load_completed' | 'data_load_failed'
  | 'threshold_warning' | 'subscription_alert'
  | 'mention' | 'share';

type NotificationChannel = 'in_app' | 'email' | 'slack' | 'webhook';
type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

interface INotificationRepository {
  findById(id: UUID): AsyncResult<Notification | null>;
  findByUserId(userId: UserId, options?: NotificationQueryOptions): AsyncResult<PaginatedResult<Notification>>;
  getUnreadCount(userId: UserId): AsyncResult<number>;
  
  create(data: CreateNotificationData): AsyncResult<Notification>;
  createBulk(data: readonly CreateNotificationData[]): AsyncResult<readonly Notification[]>;
  
  markAsRead(id: UUID): AsyncResult<void>;
  markAllAsRead(userId: UserId): AsyncResult<number>;
  markAsSent(id: UUID): AsyncResult<void>;
  
  deleteOlderThan(cutoffDate: ISODateTime): AsyncResult<number>;
}

interface NotificationQueryOptions extends QueryOptions {
  readonly unreadOnly?: boolean;
  readonly types?: readonly NotificationType[];
  readonly channels?: readonly NotificationChannel[];
}
```

---

### Entity: NotificationTemplate

```typescript
interface NotificationTemplate {
  readonly id: UUID;
  readonly tenantId?: TenantId;             // null = system template
  readonly key: string;
  readonly name: string;
  readonly channel: NotificationChannel;
  readonly subject?: string;                // For email
  readonly bodyTemplate: string;            // Handlebars/Mustache
  readonly variables: readonly TemplateVariable[];
  readonly locale: string;
  readonly isActive: boolean;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

interface TemplateVariable {
  readonly name: string;
  readonly type: DataType;
  readonly required: boolean;
  readonly defaultValue?: unknown;
}

interface INotificationTemplateRepository {
  findByKey(key: string, locale?: string): AsyncResult<NotificationTemplate | null>;
  findByTenantId(tenantId: TenantId): AsyncResult<readonly NotificationTemplate[]>;
  
  create(data: CreateTemplateData): AsyncResult<NotificationTemplate>;
  update(id: UUID, data: UpdateTemplateData): AsyncResult<NotificationTemplate>;
  delete(id: UUID): AsyncResult<void>;
  
  render(templateId: UUID, variables: Record<string, unknown>): AsyncResult<string>;
}
```

---

### Entity: Announcement

```typescript
/**
 * System-wide or tenant-wide announcements.
 */
interface Announcement {
  readonly id: UUID;
  readonly tenantId?: TenantId;             // null = all tenants
  readonly title: string;
  readonly content: string;
  readonly type: AnnouncementType;
  readonly priority: NotificationPriority;
  readonly targetAudience: TargetAudience;
  readonly startAt: ISODateTime;
  readonly endAt?: ISODateTime;
  readonly dismissible: boolean;
  readonly actionLabel?: string;
  readonly actionUrl?: URL;
  readonly status: EntityStatus;
  readonly viewCount: number;
  readonly dismissCount: number;
  readonly createdBy: UserId;
  readonly createdAt: ISODateTime;
}

type AnnouncementType = 'info' | 'warning' | 'feature' | 'maintenance';

interface TargetAudience {
  readonly allUsers: boolean;
  readonly tenantTiers?: readonly TenantTier[];
  readonly roleIds?: readonly RoleId[];
  readonly userIds?: readonly UserId[];
}

interface AnnouncementDismissal {
  readonly announcementId: UUID;
  readonly userId: UserId;
  readonly dismissedAt: ISODateTime;
}
```

---

## Domain Events: Temporal, Integration, Communication

```typescript
// Audit Events
type SecurityAuditEvent = DomainEvent<{
  category: 'authentication' | 'authorization' | 'security';
  action: string;
  actor: AuditActor;
  outcome: AuditOutcome;
  details: Record<string, unknown>;
}>;

// Integration Events
type IntegrationConnectedEvent = DomainEvent<{
  integrationId: UUID;
  type: IntegrationType;
  tenantId: TenantId;
}>;

type IntegrationFailedEvent = DomainEvent<{
  integrationId: UUID;
  error: string;
  consecutiveFailures: number;
}>;

type WebhookDeliveredEvent = DomainEvent<{
  webhookId: UUID;
  deliveryId: UUID;
  event: WebhookEvent;
  responseCode: number;
}>;

// Notification Events
type NotificationSentEvent = DomainEvent<{
  notificationId: UUID;
  userId: UserId;
  channel: NotificationChannel;
  type: NotificationType;
}>;

// Job Events
type JobCompletedEvent = DomainEvent<{
  jobId: UUID;
  executionId: UUID;
  duration: Duration;
  output?: Record<string, unknown>;
}>;

type JobFailedEvent = DomainEvent<{
  jobId: UUID;
  executionId: UUID;
  error: JobError;
  willRetry: boolean;
}>;
```
