# L1 DOMAIN CONTRACTS — COMMERCIAL & OPERATIONAL LAYERS implemented

> Monetization, billing, and runtime configuration

---

## COMMERCIAL LAYER

> Value exchange, subscriptions, and usage tracking

### Entity: Plan

```typescript
/**
 * Product tier definition with features and limits.
 */
interface Plan {
  readonly id: UUID;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly tier: TenantTier;
  readonly status: PlanStatus;
  readonly visibility: PlanVisibility;
  readonly pricing: PlanPricing;
  readonly features: PlanFeatures;
  readonly limits: PlanLimits;
  readonly trialDays: NonNegativeInt;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

type PlanStatus = "active" | "deprecated" | "archived";
type PlanVisibility = "public" | "private" | "enterprise_only";

interface PlanPricing {
  readonly model: PricingModel;
  readonly basePriceMonthly: number;
  readonly basePriceYearly: number;
  readonly currency: Currency;
  readonly perSeatPrice?: number;
  readonly usageRates?: UsageRate[];
}

type PricingModel = "flat" | "per_seat" | "usage_based" | "hybrid";
type Currency = "USD" | "EUR" | "GBP";

interface UsageRate {
  readonly metric: UsageMetric;
  readonly tiers: UsageTier[];
}

interface UsageTier {
  readonly upTo: number | "unlimited";
  readonly pricePerUnit: number;
}

type UsageMetric =
  | "events_processed"
  | "active_users"
  | "data_storage_gb"
  | "api_calls"
  | "action_flow_executions";

interface PlanFeatures {
  readonly maxUsers: number | "unlimited";
  readonly maxDataPools: number | "unlimited";
  readonly maxDataModels: number | "unlimited";
  readonly maxEventLogSize: number; // millions of events
  readonly discoveryAlgorithms: readonly DiscoveryAlgorithm[];
  readonly conformanceEnabled: boolean;
  readonly ocelEnabled: boolean;
  readonly actionFlowsEnabled: boolean;
  readonly skillsEnabled: boolean;
  readonly apiAccessEnabled: boolean;
  readonly ssoEnabled: boolean;
  readonly auditLogRetentionDays: number;
  readonly supportLevel: SupportLevel;
}

type SupportLevel = "community" | "email" | "priority" | "dedicated";

interface PlanLimits {
  readonly apiRateLimit: number; // requests per minute
  readonly maxConcurrentJobs: number;
  readonly maxStorageGB: number;
  readonly maxWebhooks: number;
  readonly maxIntegrations: number;
}
```

### Repository: IPlanRepository

```typescript
interface IPlanRepository {
  findById(id: UUID): AsyncResult<Plan | null>;
  findBySlug(slug: string): AsyncResult<Plan | null>;
  findActive(): AsyncResult<readonly Plan[]>;
  findPublic(): AsyncResult<readonly Plan[]>;

  create(data: CreatePlanData): AsyncResult<Plan>;
  update(id: UUID, data: UpdatePlanData): AsyncResult<Plan>;
  deprecate(id: UUID): AsyncResult<void>;
  archive(id: UUID): AsyncResult<void>;

  comparePlans(planIds: UUID[]): AsyncResult<PlanComparison>;
}
```

---

### Entity: Subscription

```typescript
interface Subscription {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly planId: UUID;
  readonly status: SubscriptionStatus;
  readonly billingCycle: BillingCycle;
  readonly currentPeriodStart: ISODateTime;
  readonly currentPeriodEnd: ISODateTime;
  readonly seats: PositiveInt;
  readonly trialEndsAt?: ISODateTime;
  readonly cancelledAt?: ISODateTime;
  readonly cancellationReason?: string;
  readonly externalId?: string; // Stripe subscription ID
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "unpaid"
  | "paused";

type BillingCycle = "monthly" | "yearly";

interface SubscriptionChange {
  readonly id: UUID;
  readonly subscriptionId: UUID;
  readonly type: ChangeType;
  readonly previousPlanId?: UUID;
  readonly newPlanId?: UUID;
  readonly previousSeats?: number;
  readonly newSeats?: number;
  readonly effectiveAt: ISODateTime;
  readonly processedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

type ChangeType =
  | "upgrade"
  | "downgrade"
  | "seat_change"
  | "cancel"
  | "reactivate";
```

### Repository: ISubscriptionRepository

```typescript
interface ISubscriptionRepository {
  findById(id: UUID): AsyncResult<Subscription | null>;
  findByTenantId(tenantId: TenantId): AsyncResult<Subscription | null>;
  findActive(): AsyncResult<readonly Subscription[]>;
  findExpiring(withinDays: number): AsyncResult<readonly Subscription[]>;

  create(data: CreateSubscriptionData): AsyncResult<Subscription>;
  update(id: UUID, data: UpdateSubscriptionData): AsyncResult<Subscription>;
  updateStatus(id: UUID, status: SubscriptionStatus): AsyncResult<Subscription>;
  cancel(id: UUID, reason?: string): AsyncResult<Subscription>;
  reactivate(id: UUID): AsyncResult<Subscription>;

  // Changes
  scheduleChange(
    subscriptionId: UUID,
    change: ScheduleChangeData
  ): AsyncResult<SubscriptionChange>;
  getChanges(subscriptionId: UUID): AsyncResult<readonly SubscriptionChange[]>;
  processScheduledChanges(): AsyncResult<number>;
}
```

---

### Entity: Invoice

```typescript
interface Invoice {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly subscriptionId: UUID;
  readonly number: string; // INV-2024-00001
  readonly status: InvoiceStatus;
  readonly periodStart: ISODateTime;
  readonly periodEnd: ISODateTime;
  readonly dueDate: ISODateTime;
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
  readonly currency: Currency;
  readonly lineItems: readonly InvoiceLineItem[];
  readonly paidAt?: ISODateTime;
  readonly externalId?: string; // Stripe invoice ID
  readonly pdfUrl?: URL;
  readonly createdAt: ISODateTime;
}

type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

interface InvoiceLineItem {
  readonly id: UUID;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly amount: number;
  readonly type: LineItemType;
  readonly periodStart?: ISODateTime;
  readonly periodEnd?: ISODateTime;
}

type LineItemType =
  | "subscription"
  | "seat"
  | "usage"
  | "adjustment"
  | "proration";
```

---

### Entity: PaymentMethod

```typescript
interface PaymentMethod {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly type: PaymentMethodType;
  readonly isDefault: boolean;
  readonly details: PaymentDetails;
  readonly billingAddress: BillingAddress;
  readonly externalId?: string;
  readonly createdAt: ISODateTime;
}

type PaymentMethodType = "card" | "bank_account" | "invoice";

interface PaymentDetails {
  readonly brand?: string; // visa, mastercard
  readonly last4: string;
  readonly expiryMonth?: number;
  readonly expiryYear?: number;
  readonly bankName?: string;
}

interface BillingAddress {
  readonly name: string;
  readonly company?: string;
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly state?: string;
  readonly postalCode: string;
  readonly country: string;
  readonly taxId?: string;
}
```

---

### Entity: UsageRecord

```typescript
/**
 * Tracks metered usage for billing.
 */
interface UsageRecord {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly subscriptionId: UUID;
  readonly metric: UsageMetric;
  readonly quantity: PositiveInt;
  readonly timestamp: ISODateTime;
  readonly idempotencyKey?: string;
  readonly metadata?: Record<string, unknown>;
}

interface UsageSummary {
  readonly tenantId: TenantId;
  readonly metric: UsageMetric;
  readonly periodStart: ISODateTime;
  readonly periodEnd: ISODateTime;
  readonly totalQuantity: number;
  readonly billableQuantity: number;
  readonly includedQuantity: number;
  readonly estimatedCost: number;
}

interface IUsageRepository {
  record(data: CreateUsageRecordData): AsyncResult<UsageRecord>;
  recordBatch(
    records: readonly CreateUsageRecordData[]
  ): AsyncResult<readonly UsageRecord[]>;

  getSummary(
    tenantId: TenantId,
    metric: UsageMetric,
    period: DateRange
  ): AsyncResult<UsageSummary>;

  getAllSummaries(
    tenantId: TenantId,
    period: DateRange
  ): AsyncResult<readonly UsageSummary[]>;

  getTimeSeries(
    tenantId: TenantId,
    metric: UsageMetric,
    period: DateRange,
    granularity: "hour" | "day" | "week" | "month"
  ): AsyncResult<readonly TimeSeriesPoint[]>;
}

interface TimeSeriesPoint {
  readonly timestamp: ISODateTime;
  readonly value: number;
}
```

---

### Entity: Coupon

```typescript
interface Coupon {
  readonly id: UUID;
  readonly code: string;
  readonly name: string;
  readonly type: CouponType;
  readonly discountAmount?: number;
  readonly discountPercent?: Percentage;
  readonly currency?: Currency;
  readonly duration: CouponDuration;
  readonly durationMonths?: number;
  readonly maxRedemptions?: number;
  readonly currentRedemptions: number;
  readonly validFrom: ISODateTime;
  readonly validUntil?: ISODateTime;
  readonly applicablePlanIds?: readonly UUID[];
  readonly status: EntityStatus;
  readonly createdAt: ISODateTime;
}

type CouponType = "percentage" | "fixed_amount";
type CouponDuration = "once" | "repeating" | "forever";

interface CouponRedemption {
  readonly id: UUID;
  readonly couponId: UUID;
  readonly tenantId: TenantId;
  readonly subscriptionId: UUID;
  readonly redeemedAt: ISODateTime;
  readonly expiresAt?: ISODateTime;
}
```

---

## OPERATIONAL LAYER

> Runtime configuration and feature management

### Entity: TenantSettings (Extended)

```typescript
interface TenantSettings {
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

interface BrandingSettings {
  readonly logoUrl?: URL;
  readonly faviconUrl?: URL;
  readonly primaryColor?: string;
  readonly accentColor?: string;
  readonly customCss?: string;
}

interface SecuritySettings {
  readonly passwordPolicy: PasswordPolicy;
  readonly sessionTimeout: Duration;
  readonly mfaRequired: boolean;
  readonly mfaGracePeriodDays: number;
  readonly ipWhitelist?: readonly string[];
  readonly allowedDomains?: readonly string[];
}

interface PasswordPolicy {
  readonly minLength: number;
  readonly requireUppercase: boolean;
  readonly requireLowercase: boolean;
  readonly requireNumbers: boolean;
  readonly requireSpecialChars: boolean;
  readonly maxAgeDays?: number;
  readonly preventReuse: number;
}

interface NotificationSettings {
  readonly emailEnabled: boolean;
  readonly slackEnabled: boolean;
  readonly webhookEnabled: boolean;
  readonly digestFrequency: "daily" | "weekly" | "never";
}

interface ProcessMiningSettings {
  readonly defaultDiscoveryAlgorithm: DiscoveryAlgorithm;
  readonly defaultConformanceMethod: ConformanceMethod;
  readonly activityDisplayLimit: number;
  readonly variantDisplayLimit: number;
  readonly autoReloadOnDataChange: boolean;
}
```

---

### Entity: FeatureFlag

```typescript
interface FeatureFlag {
  readonly id: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: FeatureFlagType;
  readonly defaultValue: boolean;
  readonly rules: readonly FeatureRule[];
  readonly status: EntityStatus;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

type FeatureFlagType = "release" | "experiment" | "operational" | "permission";

interface FeatureRule {
  readonly id: UUID;
  readonly priority: number;
  readonly conditions: readonly FeatureCondition[];
  readonly value: boolean;
  readonly rolloutPercentage?: Percentage;
}

interface FeatureCondition {
  readonly attribute: FeatureAttribute;
  readonly operator: FilterOperator;
  readonly value: unknown;
}

type FeatureAttribute =
  | "tenantId"
  | "tenantTier"
  | "userId"
  | "userEmail"
  | "organizationId"
  | "environment"
  | "planId";

interface IFeatureFlagRepository {
  findByKey(key: string): AsyncResult<FeatureFlag | null>;
  findAll(): AsyncResult<readonly FeatureFlag[]>;
  findActive(): AsyncResult<readonly FeatureFlag[]>;

  create(data: CreateFeatureFlagData): AsyncResult<FeatureFlag>;
  update(id: UUID, data: UpdateFeatureFlagData): AsyncResult<FeatureFlag>;
  delete(id: UUID): AsyncResult<void>;

  evaluate(
    key: string,
    context: FeatureEvaluationContext
  ): AsyncResult<boolean>;

  evaluateAll(
    context: FeatureEvaluationContext
  ): AsyncResult<Record<string, boolean>>;
}

interface FeatureEvaluationContext {
  readonly tenantId: TenantId;
  readonly tenantTier: TenantTier;
  readonly userId?: UserId;
  readonly userEmail?: Email;
  readonly organizationId?: OrganizationId;
  readonly environment?: EnvironmentType;
  readonly planId?: UUID;
  readonly customAttributes?: Record<string, unknown>;
}
```

---

### Entity: SystemConfig

```typescript
/**
 * Global system-wide configuration (platform admin only).
 */
interface SystemConfig {
  readonly key: string;
  readonly value: unknown;
  readonly type: ConfigValueType;
  readonly description?: string;
  readonly isSecret: boolean;
  readonly validationSchema?: JSONString;
  readonly updatedAt: ISODateTime;
  readonly updatedBy: UserId;
}

type ConfigValueType = "string" | "number" | "boolean" | "json" | "secret";

interface ISystemConfigRepository {
  get<T>(key: string): AsyncResult<T | null>;
  getMany(keys: readonly string[]): AsyncResult<Record<string, unknown>>;
  getByPrefix(prefix: string): AsyncResult<Record<string, unknown>>;

  set(key: string, value: unknown, meta?: ConfigMetadata): AsyncResult<void>;
  setMany(configs: Record<string, unknown>): AsyncResult<void>;
  delete(key: string): AsyncResult<void>;

  getHistory(key: string, limit?: number): AsyncResult<readonly ConfigChange[]>;
}

interface ConfigMetadata {
  readonly description?: string;
  readonly isSecret?: boolean;
  readonly validationSchema?: JSONString;
}

interface ConfigChange {
  readonly key: string;
  readonly previousValue: unknown;
  readonly newValue: unknown;
  readonly changedAt: ISODateTime;
  readonly changedBy: UserId;
}
```

---

## Domain Events: Commercial & Operational

```typescript
// Subscription Events
type SubscriptionCreatedEvent = DomainEvent<{
  subscriptionId: UUID;
  tenantId: TenantId;
  planId: UUID;
  status: SubscriptionStatus;
}>;

type SubscriptionUpgradedEvent = DomainEvent<{
  subscriptionId: UUID;
  previousPlanId: UUID;
  newPlanId: UUID;
  effectiveAt: ISODateTime;
}>;

type SubscriptionCancelledEvent = DomainEvent<{
  subscriptionId: UUID;
  reason?: string;
  cancelledBy: UserId;
}>;

type PaymentSucceededEvent = DomainEvent<{
  invoiceId: UUID;
  tenantId: TenantId;
  amount: number;
  currency: Currency;
}>;

type PaymentFailedEvent = DomainEvent<{
  invoiceId: UUID;
  tenantId: TenantId;
  failureReason: string;
  attemptCount: number;
}>;

// Feature Flag Events
type FeatureFlagChangedEvent = DomainEvent<{
  flagKey: string;
  previousValue: boolean;
  newValue: boolean;
  changedBy: UserId;
}>;

// Usage Events
type UsageThresholdReachedEvent = DomainEvent<{
  tenantId: TenantId;
  metric: UsageMetric;
  currentUsage: number;
  limit: number;
  thresholdPercent: Percentage;
}>;
```
