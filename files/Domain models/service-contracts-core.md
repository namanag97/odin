# L2 SERVICE CONTRACTS — CORE & DATA INTEGRATION
> Business operation interfaces, DTOs, and service dependencies

---

## SERVICE ARCHITECTURE PRINCIPLES

```
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER (L3)                           │
├─────────────────────────────────────────────────────────────────┤
│                     SERVICE LAYER (L2)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Application  │  │   Domain     │  │Infrastructure│          │
│  │  Services    │──│  Services    │──│  Services    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                     DOMAIN LAYER (L1)                           │
│        Entities  │  Repositories  │  Domain Events              │
├─────────────────────────────────────────────────────────────────┤
│                      CORE LAYER (L0)                            │
│     Types  │  Errors  │  Interfaces  │  Utilities               │
└─────────────────────────────────────────────────────────────────┘
```

---

## SERVICE BASE INTERFACES

```typescript
/**
 * Base service interface with context injection.
 * All services receive context for auth, tracing, and feature flags.
 */
interface IService {
  readonly name: string;
}

/**
 * Context passed to all service operations.
 */
interface OperationContext extends ServiceContext {
  readonly idempotencyKey?: string;
  readonly timeout?: Duration;
}

/**
 * Result wrapper for service operations with metadata.
 */
interface ServiceResult<T> extends Result<T, AppError> {
  readonly metadata?: ResultMetadata;
}

interface ResultMetadata {
  readonly duration: Duration;
  readonly cached: boolean;
  readonly deprecationWarning?: string;
}

/**
 * Standard service method signature.
 */
type ServiceMethod<TInput, TOutput> = (
  input: TInput,
  ctx: OperationContext
) => AsyncResult<TOutput>;
```

---

## TENANT SERVICE

```typescript
interface ITenantService extends IService {
  // Queries
  getTenant(id: TenantId, ctx: OperationContext): AsyncResult<Tenant>;
  getTenantBySlug(slug: string, ctx: OperationContext): AsyncResult<Tenant>;
  listTenants(options: ListTenantsInput, ctx: OperationContext): AsyncResult<PaginatedResult<Tenant>>;
  
  // Commands
  createTenant(input: CreateTenantInput, ctx: OperationContext): AsyncResult<Tenant>;
  updateTenant(input: UpdateTenantInput, ctx: OperationContext): AsyncResult<Tenant>;
  suspendTenant(input: SuspendTenantInput, ctx: OperationContext): AsyncResult<Tenant>;
  reactivateTenant(id: TenantId, ctx: OperationContext): AsyncResult<Tenant>;
  deleteTenant(id: TenantId, ctx: OperationContext): AsyncResult<void>;
  
  // Settings
  updateSettings(input: UpdateTenantSettingsInput, ctx: OperationContext): AsyncResult<TenantSettings>;
  
  // Usage
  getUsageSummary(id: TenantId, period: DateRange, ctx: OperationContext): AsyncResult<TenantUsageSummary>;
  checkLimits(id: TenantId, resource: ResourceType, ctx: OperationContext): AsyncResult<LimitCheckResult>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CreateTenantInput {
  readonly slug: string;
  readonly name: string;
  readonly tier: TenantTier;
  readonly adminEmail: Email;
  readonly adminName: string;
  readonly settings?: Partial<TenantSettings>;
  readonly metadata?: TenantMetadata;
}

interface UpdateTenantInput {
  readonly id: TenantId;
  readonly name?: string;
  readonly metadata?: Partial<TenantMetadata>;
}

interface SuspendTenantInput {
  readonly id: TenantId;
  readonly reason: string;
  readonly notifyUsers: boolean;
}

interface UpdateTenantSettingsInput {
  readonly tenantId: TenantId;
  readonly settings: Partial<TenantSettings>;
}

interface ListTenantsInput {
  readonly status?: TenantStatus;
  readonly tier?: TenantTier;
  readonly search?: string;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

interface TenantUsageSummary {
  readonly tenantId: TenantId;
  readonly period: DateRange;
  readonly metrics: Record<UsageMetric, UsageSummary>;
  readonly limitsStatus: Record<string, LimitStatus>;
}

interface LimitCheckResult {
  readonly allowed: boolean;
  readonly currentUsage: number;
  readonly limit: number;
  readonly remainingQuota: number;
  readonly resetAt?: ISODateTime;
}

interface LimitStatus {
  readonly current: number;
  readonly limit: number;
  readonly percentage: Percentage;
  readonly status: 'ok' | 'warning' | 'exceeded';
}
```

---

## AUTH SERVICE

```typescript
interface IAuthService extends IService {
  // Authentication
  authenticate(input: AuthenticateInput, ctx: RequestContext): AsyncResult<AuthResult>;
  refreshToken(input: RefreshTokenInput, ctx: RequestContext): AsyncResult<AuthResult>;
  logout(sessionId: UUID, ctx: OperationContext): AsyncResult<void>;
  logoutAll(userId: UserId, ctx: OperationContext): AsyncResult<number>;
  
  // Password
  requestPasswordReset(email: Email, ctx: RequestContext): AsyncResult<void>;
  resetPassword(input: ResetPasswordInput, ctx: RequestContext): AsyncResult<void>;
  changePassword(input: ChangePasswordInput, ctx: OperationContext): AsyncResult<void>;
  
  // MFA
  setupMfa(input: SetupMfaInput, ctx: OperationContext): AsyncResult<MfaSetupResult>;
  verifyMfa(input: VerifyMfaInput, ctx: RequestContext): AsyncResult<AuthResult>;
  disableMfa(userId: UserId, ctx: OperationContext): AsyncResult<void>;
  
  // SSO
  initiateSso(input: InitiateSsoInput, ctx: RequestContext): AsyncResult<SsoInitResult>;
  completeSso(input: CompleteSsoInput, ctx: RequestContext): AsyncResult<AuthResult>;
  
  // Sessions
  listSessions(userId: UserId, ctx: OperationContext): AsyncResult<readonly Session[]>;
  revokeSession(sessionId: UUID, ctx: OperationContext): AsyncResult<void>;
  
  // Validation
  validateToken(token: string, ctx: RequestContext): AsyncResult<AuthContext>;
  validateApiKey(key: string, ctx: RequestContext): AsyncResult<AuthContext>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface AuthenticateInput {
  readonly method: AuthMethod;
  readonly credentials: AuthCredentials;
  readonly deviceInfo?: DeviceInfo;
}

type AuthCredentials =
  | { type: 'password'; email: Email; password: string }
  | { type: 'magic_link'; token: string }
  | { type: 'api_key'; key: string };

interface DeviceInfo {
  readonly userAgent: string;
  readonly ipAddress: string;
  readonly fingerprint?: string;
}

interface AuthResult {
  readonly user: User;
  readonly session: Session;
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt: ISODateTime;
  readonly mfaRequired: boolean;
  readonly mfaPending?: boolean;
}

interface RefreshTokenInput {
  readonly refreshToken: string;
  readonly deviceInfo?: DeviceInfo;
}

interface ResetPasswordInput {
  readonly token: string;
  readonly newPassword: string;
}

interface ChangePasswordInput {
  readonly currentPassword: string;
  readonly newPassword: string;
}

interface SetupMfaInput {
  readonly type: MfaType;
  readonly phoneNumber?: string;             // For SMS
}

interface MfaSetupResult {
  readonly type: MfaType;
  readonly secret?: string;                  // For TOTP
  readonly qrCodeUrl?: string;
  readonly recoveryCodes?: readonly string[];
}

interface VerifyMfaInput {
  readonly sessionId: UUID;
  readonly code: string;
  readonly type: MfaType;
}

interface InitiateSsoInput {
  readonly providerId: UUID;
  readonly redirectUrl: URL;
}

interface SsoInitResult {
  readonly authorizationUrl: URL;
  readonly state: string;
}

interface CompleteSsoInput {
  readonly providerId: UUID;
  readonly code: string;
  readonly state: string;
}
```

---

## USER SERVICE

```typescript
interface IUserService extends IService {
  // Queries
  getUser(id: UserId, ctx: OperationContext): AsyncResult<User>;
  getUserByEmail(email: Email, ctx: OperationContext): AsyncResult<User>;
  listUsers(input: ListUsersInput, ctx: OperationContext): AsyncResult<PaginatedResult<User>>;
  getUserProfile(userId: UserId, ctx: OperationContext): AsyncResult<UserProfile>;
  
  // Commands
  createUser(input: CreateUserInput, ctx: OperationContext): AsyncResult<User>;
  updateUser(input: UpdateUserInput, ctx: OperationContext): AsyncResult<User>;
  updateProfile(input: UpdateProfileInput, ctx: OperationContext): AsyncResult<UserProfile>;
  suspendUser(input: SuspendUserInput, ctx: OperationContext): AsyncResult<User>;
  reactivateUser(userId: UserId, ctx: OperationContext): AsyncResult<User>;
  deleteUser(userId: UserId, ctx: OperationContext): AsyncResult<void>;
  
  // Roles
  assignRole(input: AssignRoleInput, ctx: OperationContext): AsyncResult<void>;
  revokeRole(input: RevokeRoleInput, ctx: OperationContext): AsyncResult<void>;
  getUserRoles(userId: UserId, ctx: OperationContext): AsyncResult<readonly Role[]>;
  getUserPermissions(userId: UserId, ctx: OperationContext): AsyncResult<readonly Permission[]>;
  
  // Invitations
  inviteUser(input: InviteUserInput, ctx: OperationContext): AsyncResult<UserInvitation>;
  acceptInvitation(input: AcceptInvitationInput, ctx: RequestContext): AsyncResult<User>;
  cancelInvitation(invitationId: UUID, ctx: OperationContext): AsyncResult<void>;
  listPendingInvitations(ctx: OperationContext): AsyncResult<readonly UserInvitation[]>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CreateUserInput {
  readonly email: Email;
  readonly name: string;
  readonly password?: string;
  readonly authMethod: AuthMethod;
  readonly roleIds?: readonly RoleId[];
  readonly organizationId?: OrganizationId;
  readonly sendWelcomeEmail?: boolean;
}

interface UpdateUserInput {
  readonly userId: UserId;
  readonly name?: string;
  readonly email?: Email;
}

interface UpdateProfileInput {
  readonly userId: UserId;
  readonly displayName?: string;
  readonly jobTitle?: string;
  readonly department?: string;
  readonly timezone?: string;
  readonly locale?: string;
  readonly preferences?: Partial<UserPreferences>;
}

interface ListUsersInput {
  readonly status?: UserStatus;
  readonly organizationId?: OrganizationId;
  readonly roleId?: RoleId;
  readonly search?: string;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

interface SuspendUserInput {
  readonly userId: UserId;
  readonly reason: string;
  readonly revokeAllSessions: boolean;
}

interface AssignRoleInput {
  readonly userId: UserId;
  readonly roleId: RoleId;
  readonly expiresAt?: ISODateTime;
}

interface RevokeRoleInput {
  readonly userId: UserId;
  readonly roleId: RoleId;
}

interface InviteUserInput {
  readonly email: Email;
  readonly name: string;
  readonly roleIds: readonly RoleId[];
  readonly organizationId?: OrganizationId;
  readonly message?: string;
  readonly expiresInDays?: number;
}

interface UserInvitation {
  readonly id: UUID;
  readonly email: Email;
  readonly name: string;
  readonly roleIds: readonly RoleId[];
  readonly invitedBy: UserId;
  readonly status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  readonly expiresAt: ISODateTime;
  readonly createdAt: ISODateTime;
}

interface AcceptInvitationInput {
  readonly token: string;
  readonly password: string;
}
```

---

## DATA POOL SERVICE

```typescript
interface IDataPoolService extends IService {
  // Queries
  getDataPool(id: DataPoolId, ctx: OperationContext): AsyncResult<DataPool>;
  listDataPools(input: ListDataPoolsInput, ctx: OperationContext): AsyncResult<PaginatedResult<DataPool>>;
  getDataPoolStatistics(id: DataPoolId, ctx: OperationContext): AsyncResult<DataPoolStatistics>;
  
  // Commands
  createDataPool(input: CreateDataPoolInput, ctx: OperationContext): AsyncResult<DataPool>;
  updateDataPool(input: UpdateDataPoolInput, ctx: OperationContext): AsyncResult<DataPool>;
  archiveDataPool(id: DataPoolId, ctx: OperationContext): AsyncResult<void>;
  deleteDataPool(id: DataPoolId, ctx: OperationContext): AsyncResult<void>;
  
  // Tables
  getTables(poolId: DataPoolId, ctx: OperationContext): AsyncResult<readonly Table[]>;
  
  // Validation
  validatePoolName(name: string, ctx: OperationContext): AsyncResult<ValidationResult>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CreateDataPoolInput {
  readonly name: string;
  readonly description?: string;
  readonly settings?: Partial<DataPoolSettings>;
}

interface UpdateDataPoolInput {
  readonly id: DataPoolId;
  readonly name?: string;
  readonly description?: string;
  readonly settings?: Partial<DataPoolSettings>;
}

interface ListDataPoolsInput {
  readonly status?: DataPoolStatus;
  readonly search?: string;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

interface ValidationResult {
  readonly valid: boolean;
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
}
```

---

## TABLE SERVICE

```typescript
interface ITableService extends IService {
  // Queries
  getTable(id: UUID, ctx: OperationContext): AsyncResult<Table>;
  listTables(input: ListTablesInput, ctx: OperationContext): AsyncResult<PaginatedResult<Table>>;
  getTableSchema(tableId: UUID, ctx: OperationContext): AsyncResult<readonly Column[]>;
  previewData(input: PreviewDataInput, ctx: OperationContext): AsyncResult<DataPreview>;
  
  // Commands
  createTable(input: CreateTableInput, ctx: OperationContext): AsyncResult<Table>;
  updateTable(input: UpdateTableInput, ctx: OperationContext): AsyncResult<Table>;
  deleteTable(id: UUID, ctx: OperationContext): AsyncResult<void>;
  
  // Import
  importFromFile(input: ImportFromFileInput, ctx: OperationContext): AsyncResult<ImportJob>;
  importFromData(input: ImportFromDataInput, ctx: OperationContext): AsyncResult<ImportResult>;
  getImportStatus(jobId: UUID, ctx: OperationContext): AsyncResult<ImportJob>;
  cancelImport(jobId: UUID, ctx: OperationContext): AsyncResult<void>;
  
  // Schema
  inferSchema(input: InferSchemaInput, ctx: OperationContext): AsyncResult<InferredSchema>;
  updateSchema(input: UpdateSchemaInput, ctx: OperationContext): AsyncResult<Table>;
  
  // Operations
  truncateTable(tableId: UUID, ctx: OperationContext): AsyncResult<void>;
  refreshStatistics(tableId: UUID, ctx: OperationContext): AsyncResult<Table>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CreateTableInput {
  readonly dataPoolId: DataPoolId;
  readonly name: string;
  readonly displayName?: string;
  readonly columns: readonly ColumnDefinition[];
  readonly primaryKey?: readonly string[];
}

interface ColumnDefinition {
  readonly name: string;
  readonly displayName?: string;
  readonly dataType: DataType;
  readonly nullable?: boolean;
}

interface UpdateTableInput {
  readonly tableId: UUID;
  readonly name?: string;
  readonly displayName?: string;
}

interface ListTablesInput {
  readonly dataPoolId: DataPoolId;
  readonly search?: string;
  readonly pagination?: Pagination;
}

interface PreviewDataInput {
  readonly tableId: UUID;
  readonly limit?: number;
  readonly offset?: number;
  readonly columns?: readonly string[];
  readonly filters?: readonly FilterClause[];
}

interface DataPreview {
  readonly columns: readonly Column[];
  readonly rows: readonly Record<string, unknown>[];
  readonly totalRows: number;
  readonly hasMore: boolean;
}

interface ImportFromFileInput {
  readonly dataPoolId: DataPoolId;
  readonly fileId: UUID;                    // Uploaded file reference
  readonly tableName: string;
  readonly options: FileImportOptions;
}

interface FileImportOptions {
  readonly fileType: 'csv' | 'xlsx' | 'parquet' | 'json';
  readonly mode: ImportMode;
  readonly hasHeader?: boolean;
  readonly delimiter?: string;
  readonly sheetName?: string;
  readonly encoding?: string;
  readonly dateFormat?: string;
  readonly nullValues?: readonly string[];
  readonly columnMapping?: Record<string, string>;
  readonly skipRows?: number;
  readonly maxRows?: number;
}

interface ImportFromDataInput {
  readonly tableId: UUID;
  readonly data: readonly Record<string, unknown>[];
  readonly options: DataImportOptions;
}

interface DataImportOptions {
  readonly mode: ImportMode;
  readonly batchSize?: number;
  readonly validateTypes?: boolean;
  readonly onError?: 'fail' | 'skip' | 'log';
}

interface ImportJob {
  readonly id: UUID;
  readonly tableId: UUID;
  readonly status: ExecutionStatus;
  readonly progress: ImportProgress;
  readonly result?: ImportResult;
  readonly error?: string;
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
}

interface ImportProgress {
  readonly totalRows: number;
  readonly processedRows: number;
  readonly percentage: Percentage;
  readonly currentBatch: number;
  readonly totalBatches: number;
}

interface InferSchemaInput {
  readonly fileId?: UUID;
  readonly data?: readonly Record<string, unknown>[];
  readonly sampleSize?: number;
}

interface InferredSchema {
  readonly columns: readonly InferredColumn[];
  readonly confidence: Percentage;
  readonly warnings?: readonly string[];
}

interface InferredColumn {
  readonly name: string;
  readonly inferredType: DataType;
  readonly nullable: boolean;
  readonly confidence: Percentage;
  readonly sampleValues: readonly unknown[];
}

interface UpdateSchemaInput {
  readonly tableId: UUID;
  readonly operations: readonly SchemaOperation[];
}

type SchemaOperation =
  | { type: 'add_column'; column: ColumnDefinition }
  | { type: 'drop_column'; columnName: string }
  | { type: 'rename_column'; oldName: string; newName: string }
  | { type: 'change_type'; columnName: string; newType: DataType };
```

---

## DATA MODEL SERVICE

```typescript
interface IDataModelService extends IService {
  // Queries
  getDataModel(id: DataModelId, ctx: OperationContext): AsyncResult<DataModel>;
  listDataModels(input: ListDataModelsInput, ctx: OperationContext): AsyncResult<PaginatedResult<DataModel>>;
  getDataModelStatistics(id: DataModelId, ctx: OperationContext): AsyncResult<DataModelStatistics>;
  getLoadStatus(id: DataModelId, ctx: OperationContext): AsyncResult<LoadStatusInfo>;
  
  // Commands
  createDataModel(input: CreateDataModelInput, ctx: OperationContext): AsyncResult<DataModel>;
  updateDataModel(input: UpdateDataModelInput, ctx: OperationContext): AsyncResult<DataModel>;
  deleteDataModel(id: DataModelId, ctx: OperationContext): AsyncResult<void>;
  
  // Configuration
  configureObjectType(input: ConfigureObjectTypeInput, ctx: OperationContext): AsyncResult<DataModel>;
  removeObjectType(input: RemoveObjectTypeInput, ctx: OperationContext): AsyncResult<DataModel>;
  configureCaseCentric(input: ConfigureCaseCentricInput, ctx: OperationContext): AsyncResult<DataModel>;
  
  // Loading
  loadDataModel(input: LoadDataModelInput, ctx: OperationContext): AsyncResult<LoadJob>;
  reloadDataModel(id: DataModelId, ctx: OperationContext): AsyncResult<LoadJob>;
  cancelLoad(id: DataModelId, ctx: OperationContext): AsyncResult<void>;
  
  // Validation
  validateConfiguration(id: DataModelId, ctx: OperationContext): AsyncResult<ConfigurationValidation>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CreateDataModelInput {
  readonly dataPoolId: DataPoolId;
  readonly name: string;
  readonly description?: string;
  readonly type: DataModelType;
}

interface UpdateDataModelInput {
  readonly id: DataModelId;
  readonly name?: string;
  readonly description?: string;
}

interface ListDataModelsInput {
  readonly dataPoolId?: DataPoolId;
  readonly type?: DataModelType;
  readonly status?: LoadStatus;
  readonly search?: string;
  readonly pagination?: Pagination;
}

interface ConfigureObjectTypeInput {
  readonly dataModelId: DataModelId;
  readonly objectType: ObjectTypeConfig;
}

interface RemoveObjectTypeInput {
  readonly dataModelId: DataModelId;
  readonly objectTypeName: string;
}

interface ConfigureCaseCentricInput {
  readonly dataModelId: DataModelId;
  readonly config: CaseCentricConfig;
}

interface LoadDataModelInput {
  readonly dataModelId: DataModelId;
  readonly loadType: LoadType;
  readonly options?: LoadOptions;
}

type LoadType = 'full' | 'incremental';

interface LoadOptions {
  readonly validateData?: boolean;
  readonly computeStatistics?: boolean;
  readonly buildIndexes?: boolean;
  readonly dateRange?: DateRange;
}

interface LoadJob {
  readonly id: UUID;
  readonly dataModelId: DataModelId;
  readonly status: ExecutionStatus;
  readonly loadType: LoadType;
  readonly progress: LoadProgress;
  readonly statistics?: DataModelStatistics;
  readonly error?: string;
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
}

interface LoadProgress {
  readonly phase: LoadPhase;
  readonly percentage: Percentage;
  readonly eventsProcessed: number;
  readonly objectsProcessed: Record<string, number>;
  readonly currentTable?: string;
}

type LoadPhase = 
  | 'initializing' | 'loading_events' | 'loading_objects'
  | 'building_relations' | 'computing_statistics' | 'finalizing';

interface LoadStatusInfo {
  readonly status: LoadStatus;
  readonly lastLoadedAt?: ISODateTime;
  readonly lastLoadDuration?: Duration;
  readonly staleSince?: ISODateTime;
  readonly nextScheduledLoad?: ISODateTime;
  readonly error?: string;
}

interface ConfigurationValidation {
  readonly valid: boolean;
  readonly errors: readonly ConfigurationError[];
  readonly warnings: readonly ConfigurationWarning[];
}

interface ConfigurationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly objectType?: string;
}

interface ConfigurationWarning {
  readonly code: string;
  readonly message: string;
  readonly recommendation?: string;
}
```
