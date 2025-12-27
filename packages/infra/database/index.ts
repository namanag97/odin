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
export { SqliteCouponRepository } from "./repositories/commercial/coupon-repository";
export { SqliteInvoiceRepository } from "./repositories/commercial/invoice-repository";
export { SqlitePaymentMethodRepository } from "./repositories/commercial/payment-method-repository";
export { SqlitePlanRepository } from "./repositories/commercial/plan-repository";
export { SqliteSubscriptionRepository } from "./repositories/commercial/subscription-repository";
export { SqliteUsageRepository } from "./repositories/commercial/usage-repository";
export { SqliteFeatureFlagRepository } from "./repositories/operational/feature-flag-repository";
export { SqliteSystemConfigRepository } from "./repositories/operational/system-config-repository";
export { SqliteTenantSettingsRepository } from "./repositories/operational/tenant-settings-repository";
export { SqliteCaseRepository } from "./repositories/process-mining/case-repository";
export { SqliteDataModelRepository } from "./repositories/process-mining/data-model-repository";
export { SqliteDataPoolRepository } from "./repositories/process-mining/data-pool-repository";
export { SqliteProcessModelRepository } from "./repositories/process-mining/process-model-repository";
export { SqliteTableRepository } from "./repositories/process-mining/table-repository";
export { SqliteVariantRepository } from "./repositories/process-mining/variant-repository";
export { SqliteAuditLogRepository } from "./repositories/temporal/audit-log-repository";
export { SqliteEntityHistoryRepository } from "./repositories/temporal/entity-history-repository";
export { SqliteScheduledJobRepository } from "./repositories/temporal/scheduled-job-repository";
export { SqliteApiKeyRepository } from "./repositories/integration/api-key-repository";
export { SqliteIntegrationRepository } from "./repositories/integration/integration-repository";
export { SqliteOAuthTokenRepository } from "./repositories/integration/o-auth-token-repository";
export { SqliteWebhookRepository } from "./repositories/integration/webhook-repository";
export { SqliteFilterRepository } from "./repositories/analytics/filter.repository";
export { SqliteKnowledgeModelRepository } from "./repositories/analytics/knowledge-model.repository";
export { SqliteKpiRepository } from "./repositories/analytics/kpi.repository";
export { SqliteRecordRepository } from "./repositories/analytics/record.repository";
export { SqliteVariableRepository } from "./repositories/analytics/variable.repository";
export { SqliteComponentRepository } from "./repositories/studio/component.repository";
export { SqlitePackageRepository } from "./repositories/studio/package.repository";
export { SqliteSpaceRepository } from "./repositories/studio/space.repository";
export { SqliteViewRepository } from "./repositories/studio/view.repository";
export { SqliteActionFlowRepository } from "./repositories/automation/action-flow.repository";
export { SqliteExecutionRepository } from "./repositories/automation/execution.repository";
export { SqliteSensorRepository } from "./repositories/automation/sensor.repository";
export { SqliteSignalRepository } from "./repositories/automation/signal.repository";
export { SqliteSkillRepository } from "./repositories/automation/skill.repository";
export { SqliteTaskRepository } from "./repositories/automation/task.repository";
