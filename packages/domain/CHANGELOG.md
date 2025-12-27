# Changelog

All notable changes to `@odin/domain` will be documented in this file.

## [0.2.0] - 2025-12-27

### ✨ Added

#### Commercial Layer — Monetization & Billing

**Entities** (`entities/commercial/`)

- **Plan** — Product tier definition with pricing models, features, and limits

  - `PlanPricing` with flat, per-seat, usage-based, and hybrid models
  - `PlanFeatures` for capability toggles (SSO, API, OCEL support)
  - `PlanLimits` for rate limits, storage, and concurrency
  - `UsageRate` and `UsageTier` for tiered usage pricing

- **Subscription** — Tenant subscription lifecycle

  - Status tracking: `trialing`, `active`, `past_due`, `cancelled`, `unpaid`, `paused`
  - Billing cycle: `monthly` / `yearly`
  - `SubscriptionChange` for upgrade/downgrade tracking

- **Invoice** — Billing documents with line items

  - `InvoiceLineItem` with types: subscription, seat, usage, adjustment, proration
  - Status: `draft`, `open`, `paid`, `void`, `uncollectible`

- **PaymentMethod** — Stored payment methods

  - Types: `card`, `bank_account`, `invoice`
  - `PaymentDetails` and `BillingAddress` types

- **UsageRecord** — Metered usage for billing

  - `UsageSummary` for period aggregations
  - `TimeSeriesPoint` and `TimeSeriesGranularity` for analytics

- **Coupon** — Discount codes with redemption
  - Types: `percentage`, `fixed_amount`
  - Duration: `once`, `repeating`, `forever`
  - `CouponRedemption` tracking

**Repositories** (`repositories/commercial/`)

- `IPlanRepository` — CRUD + `comparePlans()`, `deprecate()`, `archive()`
- `ISubscriptionRepository` — CRUD + `scheduleChange()`, `processScheduledChanges()`
- `IInvoiceRepository` — CRUD + `findByDateRange()`, `generateNumber()`
- `IPaymentMethodRepository` — CRUD + `findDefault()`, `setDefault()`
- `IUsageRepository` — `record()`, `recordBatch()`, `getSummary()`, `getTimeSeries()`
- `ICouponRepository` — CRUD + `validate()`, `redeem()`, `getRedemptions()`

---

#### Operational Layer — Runtime Configuration

**Entities** (`entities/operational/`)

- **ExtendedTenantSettings** — Extended tenant configuration

  - `BrandingSettings` — logo, favicon, colors, custom CSS
  - `SecuritySettings` — password policy, MFA, session timeout, IP whitelist
  - `NotificationSettings` — email, Slack, webhook, digest frequency
  - `ProcessMiningSettings` — default algorithms, display limits

- **FeatureFlag** — Feature toggles with targeting

  - Types: `release`, `experiment`, `operational`, `permission`
  - `FeatureRule` with conditions and rollout percentage
  - `FeatureEvaluationContext` for flag evaluation

- **SystemConfig** — Global platform configuration
  - Value types: string, number, boolean, json, secret
  - `ConfigChange` history tracking

**Repositories** (`repositories/operational/`)

- `ITenantSettingsRepository` — `getOrCreate()`, section-specific updates
- `IFeatureFlagRepository` — CRUD + `evaluate()`, `evaluateAll()`
- `ISystemConfigRepository` — `get()`, `getByPrefix()`, `getHistory()`

---

#### Domain Events (`events/`)

**Commercial Events**

- `SubscriptionCreatedEvent`, `SubscriptionUpgradedEvent`, `SubscriptionDowngradedEvent`
- `SubscriptionCancelledEvent`, `SubscriptionReactivatedEvent`
- `PaymentSucceededEvent`, `PaymentFailedEvent`, `PaymentRefundedEvent`
- `UsageThresholdReachedEvent`, `UsageLimitExceededEvent`

**Operational Events**

- `FeatureFlagCreatedEvent`, `FeatureFlagToggledEvent`, `FeatureFlagDeletedEvent`
- `SystemConfigChangedEvent`, `SystemConfigDeletedEvent`

### 🔧 Changed

- **TenantSettings** renamed to **ExtendedTenantSettings** in operational layer to avoid conflict with existence layer's `TenantSettings`
- **EnvironmentType** in feature-flag now imports from existence layer (deduplication)

### 📦 Dependencies

- Added export of `DiscoveryAlgorithm`, `ConformanceMethod`, `ProcessModelType`, `MetricType`, `PublishStatus` from `@odin/core-contracts`

---

## [0.1.0] - 2025-12-27

### 🎉 Initial Release

#### Existence Layer

**Entities**

- `Tenant` — Root isolation boundary with status, tier, settings, metadata
- `Organization` — Organizational grouping within tenants
- `Environment` — Deployment stages (dev/staging/prod)

**Repositories**

- `ITenantRepository` — Full CRUD with slug lookup, status/settings updates
- `IOrganizationRepository` — CRUD with tenant scoping
- `IEnvironmentRepository` — CRUD with promotion support

---

#### Identity Layer

**Entities**

- `User` — User accounts with profiles and preferences
- `Role` — Role definitions with permissions
- `Session` — User sessions with device tracking
- `Team` — Team groupings with membership
- `MfaDevice` — MFA device registration
- `IdentityProvider` — SSO/SAML/OIDC providers

**Repositories**

- `IUserRepository` — CRUD with email lookup, role management
- `IRoleRepository` — CRUD with permission queries
- `ISessionRepository` — Session management, revocation
- `ITeamRepository` — Team CRUD with membership
- `IMfaDeviceRepository` — MFA device management
- `IIdentityProviderRepository` — IdP CRUD with domain mapping

---

### Repository Contract Patterns

All repositories follow these patterns:

- `findById(id)` → `AsyncResult<T | null>`
- `findAll(options?)` → `AsyncResult<PageResponse<T>>`
- `create(data)` → `AsyncResult<T>`
- `update(id, data)` → `AsyncResult<T>`
- `delete(id)` → `AsyncResult<void>`
