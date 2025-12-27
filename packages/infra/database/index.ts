/**
 * Database Infrastructure - Main Export
 */

// Core Database
export {
  createDatabase,
  DatabaseConnection,
  type DatabaseConfig,
} from "./connection";

// Repository Factory
export {
  createRepositoryContainer,
  getRepositoryContainer,
  resetRepositoryContainer,
  type IRepositoryContainer,
} from "./repository-factory";

// Error Mapping
export { mapDatabaseError } from "./error-mapper";

// Database Utilities
export {
  DbTimestamp,
  JsonColumn,
  Pagination,
  WhereBuilder,
  buildPagination,
  buildOrderBy,
} from "./types";

// Repository Implementations
export { SqliteEnvironmentRepository } from "./repositories/existence/environment.repository";
export { SqliteOrganizationRepository } from "./repositories/existence/organization.repository";
export { SqliteTenantRepository } from "./repositories/existence/tenant.repository";
export { SqliteIdentityProviderRepository } from "./repositories/identity/identity-provider.repository";
export { SqliteMfaDeviceRepository } from "./repositories/identity/mfa-device.repository";
export { SqliteRoleRepository } from "./repositories/identity/role.repository";
export { SqliteSessionRepository } from "./repositories/identity/session.repository";
export { SqliteTeamRepository } from "./repositories/identity/team.repository";
export { SqliteUserRepository } from "./repositories/identity/user.repository";
// export { SqliteCouponRepository } from "./repositories/commercial/coupon-repository"; // TODO: Fix implementation
// export { SqliteInvoiceRepository } from "./repositories/commercial/invoice-repository"; // TODO: Fix implementation
// export { SqlitePaymentMethodRepository } from "./repositories/commercial/payment-method-repository"; // TODO: Fix implementation
// export { SqlitePlanRepository } from "./repositories/commercial/plan-repository"; // TODO: Fix implementation
// export { SqliteSubscriptionRepository } from "./repositories/commercial/subscription-repository"; // TODO: Fix implementation
// export { SqliteUsageRepository } from "./repositories/commercial/usage-repository"; // TODO: Fix implementation
export { SqliteFeatureFlagRepository } from "./repositories/operational/feature-flag-repository";
export { SqliteSystemConfigRepository } from "./repositories/operational/system-config-repository";
export { SqliteTenantSettingsRepository } from "./repositories/operational/tenant-settings-repository";
// export { SqliteCaseRepository } from "./repositories/process-mining/case-repository"; // TODO: Fix implementation
// export { SqliteDataModelRepository } from "./repositories/process-mining/data-model-repository"; // TODO: Fix implementation
// export { SqliteDataPoolRepository } from "./repositories/process-mining/data-pool-repository"; // TODO: Fix implementation
// export { SqliteProcessModelRepository } from "./repositories/process-mining/process-model-repository"; // TODO: Fix implementation
// export { SqliteTableRepository } from "./repositories/process-mining/table-repository"; // TODO: Fix implementation
// export { SqliteVariantRepository } from "./repositories/process-mining/variant-repository"; // TODO: Fix implementation
// export { SqliteAuditLogRepository } from "./repositories/temporal/audit-log-repository"; // TODO: Fix implementation
// export { SqliteEntityHistoryRepository } from "./repositories/temporal/entity-history-repository"; // TODO: Fix implementation
// export { SqliteScheduledJobRepository } from "./repositories/temporal/scheduled-job-repository"; // TODO: Fix implementation
// export { SqliteApiKeyRepository } from "./repositories/integration/api-key-repository"; // TODO: Fix implementation
// export { SqliteIntegrationRepository } from "./repositories/integration/integration-repository"; // TODO: Fix implementation
// export { SqliteOAuthTokenRepository } from "./repositories/integration/o-auth-token-repository"; // TODO: Fix implementation
// export { SqliteWebhookRepository } from "./repositories/integration/webhook-repository"; // TODO: Fix implementation
// export { SqliteFilterRepository } from "./repositories/analytics/filter.repository"; // TODO: Fix implementation
// export { SqliteKnowledgeModelRepository } from "./repositories/analytics/knowledge-model.repository"; // TODO: Fix implementation
// export { SqliteKpiRepository } from "./repositories/analytics/kpi.repository"; // TODO: Fix implementation
// export { SqliteRecordRepository } from "./repositories/analytics/record.repository"; // TODO: Fix implementation
// export { SqliteVariableRepository } from "./repositories/analytics/variable.repository"; // TODO: Fix implementation
// export { SqliteComponentRepository } from "./repositories/studio/component.repository"; // TODO: Fix implementation
// export { SqlitePackageRepository } from "./repositories/studio/package.repository"; // TODO: Fix implementation
// export { SqliteSpaceRepository } from "./repositories/studio/space.repository"; // TODO: Fix implementation
// export { SqliteViewRepository } from "./repositories/studio/view.repository"; // TODO: Fix implementation
// export { SqliteActionFlowRepository } from "./repositories/automation/action-flow.repository"; // TODO: Fix implementation
// export { SqliteExecutionRepository } from "./repositories/automation/execution.repository"; // TODO: Fix implementation
// export { SqliteSensorRepository } from "./repositories/automation/sensor.repository"; // TODO: Fix implementation
// export { SqliteSignalRepository } from "./repositories/automation/signal.repository"; // TODO: Fix implementation
// export { SqliteSkillRepository } from "./repositories/automation/skill.repository"; // TODO: Fix implementation
// export { SqliteTaskRepository } from "./repositories/automation/task.repository"; // TODO: Fix implementation
