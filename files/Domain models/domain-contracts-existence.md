# L1 DOMAIN CONTRACTS — EXISTENCE & IDENTITY LAYERS implemented

> Root identity, multi-tenancy, authentication, and authorization

---

## EXISTENCE LAYER

> The foundational truth of "who exists" in the system

### Entity: Tenant

```typescript
/**
 * Root isolation boundary for all data.
 * Everything in the system belongs to exactly one Tenant.
 */
interface Tenant {
  readonly id: TenantId;
  readonly slug: string; // URL-safe identifier
  readonly name: string;
  readonly status: TenantStatus;
  readonly tier: TenantTier;
  readonly settings: TenantSettings;
  readonly metadata: TenantMetadata;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly suspendedAt?: ISODateTime;
  readonly deletedAt?: ISODateTime;
}

type TenantStatus = "pending" | "active" | "suspended" | "deleted";
type TenantTier = "free" | "starter" | "professional" | "enterprise";

interface TenantSettings {
  readonly locale: string;
  readonly timezone: string;
  readonly dataRetentionDays: PositiveInt;
  readonly maxUsers: PositiveInt;
  readonly maxDataPools: PositiveInt;
  readonly maxStorageGB: PositiveInt;
  readonly features: TenantFeatures;
}

interface TenantFeatures {
  readonly ocelSupport: boolean;
  readonly advancedConformance: boolean;
  readonly customIntegrations: boolean;
  readonly sso: boolean;
  readonly auditLogs: boolean;
  readonly apiAccess: boolean;
}

interface TenantMetadata {
  readonly industry?: string;
  readonly companySize?: string;
  readonly source?: string;
  readonly customFields?: Record<string, unknown>;
}
```

### Repository: ITenantRepository

```typescript
interface ITenantRepository {
  // Queries
  findById(id: TenantId): AsyncResult<Tenant | null>;
  findBySlug(slug: string): AsyncResult<Tenant | null>;
  findAll(options?: QueryOptions): AsyncResult<PaginatedResult<Tenant>>;
  exists(id: TenantId): AsyncResult<boolean>;

  // Commands
  create(data: CreateTenantData): AsyncResult<Tenant>;
  update(id: TenantId, data: UpdateTenantData): AsyncResult<Tenant>;
  updateStatus(id: TenantId, status: TenantStatus): AsyncResult<Tenant>;
  updateSettings(
    id: TenantId,
    settings: Partial<TenantSettings>
  ): AsyncResult<Tenant>;
  softDelete(id: TenantId): AsyncResult<void>;
  hardDelete(id: TenantId): AsyncResult<void>;
}

interface CreateTenantData {
  readonly slug: string;
  readonly name: string;
  readonly tier: TenantTier;
  readonly settings?: Partial<TenantSettings>;
  readonly metadata?: TenantMetadata;
}

interface UpdateTenantData {
  readonly name?: string;
  readonly metadata?: TenantMetadata;
}
```

### Domain Events: Tenant

```typescript
type TenantCreatedEvent = DomainEvent<{
  tenantId: TenantId;
  slug: string;
  tier: TenantTier;
}>;

type TenantSuspendedEvent = DomainEvent<{
  tenantId: TenantId;
  reason: string;
  suspendedBy: UserId;
}>;

type TenantTierChangedEvent = DomainEvent<{
  tenantId: TenantId;
  previousTier: TenantTier;
  newTier: TenantTier;
}>;
```

---

### Entity: Organization

```typescript
/**
 * Logical grouping within a Tenant.
 * Supports enterprise multi-org structures.
 */
interface Organization {
  readonly id: OrganizationId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly slug: string;
  readonly parentId?: OrganizationId; // For hierarchies
  readonly status: EntityStatus;
  readonly settings: OrganizationSettings;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

interface OrganizationSettings {
  readonly defaultSpaceId?: SpaceId;
  readonly memberLimit?: PositiveInt;
  readonly inheritParentPermissions: boolean;
}
```

### Repository: IOrganizationRepository

```typescript
interface IOrganizationRepository {
  findById(id: OrganizationId): AsyncResult<Organization | null>;
  findByTenantId(
    tenantId: TenantId,
    options?: QueryOptions
  ): AsyncResult<PaginatedResult<Organization>>;
  findChildren(parentId: OrganizationId): AsyncResult<readonly Organization[]>;
  findAncestors(id: OrganizationId): AsyncResult<readonly Organization[]>;

  create(data: CreateOrganizationData): AsyncResult<Organization>;
  update(
    id: OrganizationId,
    data: UpdateOrganizationData
  ): AsyncResult<Organization>;
  delete(id: OrganizationId): AsyncResult<void>;

  // Membership
  getMembers(
    id: OrganizationId,
    options?: QueryOptions
  ): AsyncResult<PaginatedResult<User>>;
  addMember(
    orgId: OrganizationId,
    userId: UserId,
    role: RoleId
  ): AsyncResult<void>;
  removeMember(orgId: OrganizationId, userId: UserId): AsyncResult<void>;
}
```

---

### Entity: Environment

```typescript
/**
 * Deployment stage (dev/staging/prod) for isolation.
 */
interface Environment {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly type: EnvironmentType;
  readonly status: EntityStatus;
  readonly configuration: EnvironmentConfig;
  readonly promotedFrom?: UUID; // Source environment
  readonly createdAt: ISODateTime;
}

type EnvironmentType = "development" | "staging" | "production";

interface EnvironmentConfig {
  readonly dataPoolIds: readonly DataPoolId[];
  readonly featureOverrides: Record<string, boolean>;
  readonly resourceLimits: ResourceLimits;
}

interface ResourceLimits {
  readonly maxConcurrentJobs: PositiveInt;
  readonly maxEventLogSize: PositiveInt; // in millions
  readonly maxStorageGB: PositiveInt;
}
```

---

## IDENTITY LAYER

> Authentication, authorization, and access control

### Entity: User

```typescript
interface User {
  readonly id: UserId;
  readonly tenantId: TenantId;
  readonly email: Email;
  readonly emailVerified: boolean;
  readonly name: string;
  readonly avatarUrl?: URL;
  readonly status: UserStatus;
  readonly authMethod: AuthMethod;
  readonly mfaEnabled: boolean;
  readonly lastLoginAt?: ISODateTime;
  readonly passwordChangedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

type UserStatus = "pending" | "active" | "suspended" | "deleted";
type AuthMethod = "password" | "sso" | "magic_link" | "api_key";

interface UserProfile {
  readonly userId: UserId;
  readonly displayName?: string;
  readonly jobTitle?: string;
  readonly department?: string;
  readonly timezone?: string;
  readonly locale?: string;
  readonly preferences: UserPreferences;
}

interface UserPreferences {
  readonly theme: "light" | "dark" | "system";
  readonly defaultSpaceId?: SpaceId;
  readonly emailNotifications: boolean;
  readonly weeklyDigest: boolean;
}
```

### Repository: IUserRepository

```typescript
interface IUserRepository {
  // Queries
  findById(id: UserId): AsyncResult<User | null>;
  findByEmail(tenantId: TenantId, email: Email): AsyncResult<User | null>;
  findByTenantId(
    tenantId: TenantId,
    options?: QueryOptions
  ): AsyncResult<PaginatedResult<User>>;
  findByOrganization(
    orgId: OrganizationId,
    options?: QueryOptions
  ): AsyncResult<PaginatedResult<User>>;

  // Commands
  create(data: CreateUserData): AsyncResult<User>;
  update(id: UserId, data: UpdateUserData): AsyncResult<User>;
  updateStatus(id: UserId, status: UserStatus): AsyncResult<User>;
  updatePassword(id: UserId, hashedPassword: string): AsyncResult<void>;
  updateLastLogin(id: UserId): AsyncResult<void>;
  delete(id: UserId): AsyncResult<void>;

  // Profile
  getProfile(userId: UserId): AsyncResult<UserProfile | null>;
  updateProfile(
    userId: UserId,
    data: Partial<UserProfile>
  ): AsyncResult<UserProfile>;

  // Roles
  getRoles(userId: UserId): AsyncResult<readonly Role[]>;
  assignRole(userId: UserId, roleId: RoleId): AsyncResult<void>;
  revokeRole(userId: UserId, roleId: RoleId): AsyncResult<void>;
}
```

---

### Entity: Role & Permission

```typescript
type RoleId = Brand<UUID, "RoleId">;
type PermissionId = Brand<string, "PermissionId">;

interface Role {
  readonly id: RoleId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly isSystem: boolean; // Built-in, non-deletable
  readonly permissions: readonly Permission[];
  readonly createdAt: ISODateTime;
}

interface Permission {
  readonly id: PermissionId;
  readonly resource: ResourceType;
  readonly action: ActionType;
  readonly scope: PermissionScope;
  readonly conditions?: PermissionCondition[];
}

type ResourceType =
  | "tenant"
  | "organization"
  | "user"
  | "role"
  | "data_pool"
  | "data_model"
  | "event_log"
  | "knowledge_model"
  | "view"
  | "package"
  | "space"
  | "action_flow"
  | "skill"
  | "task"
  | "api_key"
  | "webhook"
  | "integration"
  | "audit_log"
  | "settings";

type ActionType =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "execute"
  | "publish"
  | "share"
  | "export"
  | "manage"
  | "admin";

type PermissionScope =
  | "own" // Only own resources
  | "organization" // Organization resources
  | "tenant" // All tenant resources
  | "global"; // System-wide (super admin)

interface PermissionCondition {
  readonly field: string;
  readonly operator: FilterOperator;
  readonly value: unknown;
}
```

### Repository: IRoleRepository

```typescript
interface IRoleRepository {
  findById(id: RoleId): AsyncResult<Role | null>;
  findByTenantId(tenantId: TenantId): AsyncResult<readonly Role[]>;
  findSystemRoles(): AsyncResult<readonly Role[]>;

  create(data: CreateRoleData): AsyncResult<Role>;
  update(id: RoleId, data: UpdateRoleData): AsyncResult<Role>;
  delete(id: RoleId): AsyncResult<void>;

  addPermission(roleId: RoleId, permission: Permission): AsyncResult<void>;
  removePermission(
    roleId: RoleId,
    permissionId: PermissionId
  ): AsyncResult<void>;

  getUsersWithRole(roleId: RoleId): AsyncResult<readonly User[]>;
}
```

---

### Entity: Session

```typescript
interface Session {
  readonly id: UUID;
  readonly userId: UserId;
  readonly tenantId: TenantId;
  readonly token: string; // Hashed
  readonly refreshToken?: string; // Hashed
  readonly expiresAt: ISODateTime;
  readonly lastActivityAt: ISODateTime;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly mfaVerified: boolean;
  readonly createdAt: ISODateTime;
  readonly revokedAt?: ISODateTime;
}

interface SessionRepository {
  findById(id: UUID): AsyncResult<Session | null>;
  findByToken(token: string): AsyncResult<Session | null>;
  findActiveByUser(userId: UserId): AsyncResult<readonly Session[]>;

  create(data: CreateSessionData): AsyncResult<Session>;
  updateActivity(id: UUID): AsyncResult<void>;
  revoke(id: UUID): AsyncResult<void>;
  revokeAllForUser(userId: UserId): AsyncResult<number>;
  deleteExpired(): AsyncResult<number>;
}
```

---

### Entity: IdentityProvider

```typescript
/**
 * SSO/SAML/OIDC configuration for enterprise auth.
 */
interface IdentityProvider {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly type: IdPType;
  readonly status: EntityStatus;
  readonly config: IdPConfig;
  readonly metadata: IdPMetadata;
  readonly createdAt: ISODateTime;
}

type IdPType = "saml" | "oidc" | "google" | "microsoft" | "okta";

interface IdPConfig {
  readonly clientId: string;
  readonly clientSecretEncrypted: string;
  readonly issuerUrl?: URL;
  readonly authorizationUrl?: URL;
  readonly tokenUrl?: URL;
  readonly userInfoUrl?: URL;
  readonly scopes: readonly string[];
  readonly attributeMapping: AttributeMapping;
}

interface AttributeMapping {
  readonly email: string;
  readonly name?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly groups?: string;
}

interface IdPMetadata {
  readonly lastSyncAt?: ISODateTime;
  readonly userCount?: number;
  readonly domainVerified: boolean;
  readonly domains: readonly string[];
}
```

---

### Entity: MfaDevice

```typescript
interface MfaDevice {
  readonly id: UUID;
  readonly userId: UserId;
  readonly type: MfaType;
  readonly name: string;
  readonly secretEncrypted: string;
  readonly isDefault: boolean;
  readonly lastUsedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

type MfaType = "totp" | "sms" | "email" | "webauthn" | "recovery_codes";

interface IMfaDeviceRepository {
  findByUserId(userId: UserId): AsyncResult<readonly MfaDevice[]>;
  findById(id: UUID): AsyncResult<MfaDevice | null>;

  create(data: CreateMfaDeviceData): AsyncResult<MfaDevice>;
  setDefault(userId: UserId, deviceId: UUID): AsyncResult<void>;
  delete(id: UUID): AsyncResult<void>;
  deleteAllForUser(userId: UserId): AsyncResult<void>;
  updateLastUsed(id: UUID): AsyncResult<void>;
}
```

---

### Entity: Team

```typescript
/**
 * Groups of users for easier permission management.
 */
interface Team {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly organizationId?: OrganizationId;
  readonly name: string;
  readonly description?: string;
  readonly memberCount: NonNegativeInt;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

interface TeamMembership {
  readonly teamId: UUID;
  readonly userId: UserId;
  readonly role: TeamRole;
  readonly joinedAt: ISODateTime;
}

type TeamRole = "member" | "maintainer" | "owner";

interface ITeamRepository {
  findById(id: UUID): AsyncResult<Team | null>;
  findByTenantId(
    tenantId: TenantId,
    options?: QueryOptions
  ): AsyncResult<PaginatedResult<Team>>;
  findByUser(userId: UserId): AsyncResult<readonly Team[]>;

  create(data: CreateTeamData): AsyncResult<Team>;
  update(id: UUID, data: UpdateTeamData): AsyncResult<Team>;
  delete(id: UUID): AsyncResult<void>;

  getMembers(
    teamId: UUID,
    options?: QueryOptions
  ): AsyncResult<PaginatedResult<TeamMembership>>;
  addMember(teamId: UUID, userId: UserId, role: TeamRole): AsyncResult<void>;
  removeMember(teamId: UUID, userId: UserId): AsyncResult<void>;
  updateMemberRole(
    teamId: UUID,
    userId: UserId,
    role: TeamRole
  ): AsyncResult<void>;
}
```

---

## Domain Events: Identity Layer

```typescript
type UserCreatedEvent = DomainEvent<{
  userId: UserId;
  email: Email;
  authMethod: AuthMethod;
}>;

type UserAuthenticatedEvent = DomainEvent<{
  userId: UserId;
  sessionId: UUID;
  method: AuthMethod;
  ipAddress: string;
}>;

type UserPasswordChangedEvent = DomainEvent<{
  userId: UserId;
  changedBy: UserId;
}>;

type SessionRevokedEvent = DomainEvent<{
  sessionId: UUID;
  userId: UserId;
  reason: "logout" | "security" | "expired" | "admin";
}>;

type RoleAssignedEvent = DomainEvent<{
  userId: UserId;
  roleId: RoleId;
  assignedBy: UserId;
}>;

type MfaEnabledEvent = DomainEvent<{
  userId: UserId;
  deviceType: MfaType;
}>;
```
