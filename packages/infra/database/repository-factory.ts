/**
 * Repository Factory
 *
 * Centralized factory for creating all repository instances.
 * Provides dependency injection container pattern.
 */

import type { Database } from "bun:sqlite";

// Repository imports
import { SqliteEnvironmentRepository } from "./repositories/existence/environment.repository";
import { SqliteOrganizationRepository } from "./repositories/existence/organization.repository";
import { SqliteTenantRepository } from "./repositories/existence/tenant.repository";
import { SqliteIdentityProviderRepository } from "./repositories/identity/identity-provider.repository";
import { SqliteMfaDeviceRepository } from "./repositories/identity/mfa-device.repository";
import { SqliteRoleRepository } from "./repositories/identity/role.repository";
import { SqliteSessionRepository } from "./repositories/identity/session.repository";
import { SqliteTeamRepository } from "./repositories/identity/team.repository";
import { SqliteUserRepository } from "./repositories/identity/user.repository";
import { SqliteCouponRepository } from "./repositories/commercial/coupon-repository";
import { SqliteInvoiceRepository } from "./repositories/commercial/invoice-repository";
import { SqlitePaymentMethodRepository } from "./repositories/commercial/payment-method-repository";
import { SqlitePlanRepository } from "./repositories/commercial/plan-repository";
import { SqliteSubscriptionRepository } from "./repositories/commercial/subscription-repository";
import { SqliteUsageRepository } from "./repositories/commercial/usage-repository";
import { SqliteFeatureFlagRepository } from "./repositories/operational/feature-flag-repository";
import { SqliteSystemConfigRepository } from "./repositories/operational/system-config-repository";
import { SqliteTenantSettingsRepository } from "./repositories/operational/tenant-settings-repository";
import { SqliteCaseRepository } from "./repositories/process-mining/case-repository";
import { SqliteDataModelRepository } from "./repositories/process-mining/data-model-repository";
import { SqliteDataPoolRepository } from "./repositories/process-mining/data-pool-repository";
import { SqliteProcessModelRepository } from "./repositories/process-mining/process-model-repository";
import { SqliteTableRepository } from "./repositories/process-mining/table-repository";
import { SqliteVariantRepository } from "./repositories/process-mining/variant-repository";
import { SqliteAuditLogRepository } from "./repositories/temporal/audit-log-repository";
import { SqliteEntityHistoryRepository } from "./repositories/temporal/entity-history-repository";
import { SqliteScheduledJobRepository } from "./repositories/temporal/scheduled-job-repository";
import { SqliteApiKeyRepository } from "./repositories/integration/api-key-repository";
import { SqliteIntegrationRepository } from "./repositories/integration/integration-repository";
import { SqliteOAuthTokenRepository } from "./repositories/integration/o-auth-token-repository";
import { SqliteWebhookRepository } from "./repositories/integration/webhook-repository";
import { SqliteFilterRepository } from "./repositories/analytics/filter.repository";
import { SqliteKnowledgeModelRepository } from "./repositories/analytics/knowledge-model.repository";
import { SqliteKpiRepository } from "./repositories/analytics/kpi.repository";
import { SqliteRecordRepository } from "./repositories/analytics/record.repository";
import { SqliteVariableRepository } from "./repositories/analytics/variable.repository";
import { SqliteComponentRepository } from "./repositories/studio/component.repository";
import { SqlitePackageRepository } from "./repositories/studio/package.repository";
import { SqliteSpaceRepository } from "./repositories/studio/space.repository";
import { SqliteViewRepository } from "./repositories/studio/view.repository";
import { SqliteActionFlowRepository } from "./repositories/automation/action-flow.repository";
import { SqliteExecutionRepository } from "./repositories/automation/execution.repository";
import { SqliteSensorRepository } from "./repositories/automation/sensor.repository";
import { SqliteSignalRepository } from "./repositories/automation/signal.repository";
import { SqliteSkillRepository } from "./repositories/automation/skill.repository";
import { SqliteTaskRepository } from "./repositories/automation/task.repository";

/**
 * Repository container interface
 */
export interface IRepositoryContainer {
  readonly environment: SqliteEnvironmentRepository;
  readonly organization: SqliteOrganizationRepository;
  readonly tenant: SqliteTenantRepository;
  readonly identityProvider: SqliteIdentityProviderRepository;
  readonly mfaDevice: SqliteMfaDeviceRepository;
  readonly role: SqliteRoleRepository;
  readonly session: SqliteSessionRepository;
  readonly team: SqliteTeamRepository;
  readonly user: SqliteUserRepository;
  readonly coupon: SqliteCouponRepository;
  readonly invoice: SqliteInvoiceRepository;
  readonly paymentMethod: SqlitePaymentMethodRepository;
  readonly plan: SqlitePlanRepository;
  readonly subscription: SqliteSubscriptionRepository;
  readonly usage: SqliteUsageRepository;
  readonly featureFlag: SqliteFeatureFlagRepository;
  readonly systemConfig: SqliteSystemConfigRepository;
  readonly tenantSettings: SqliteTenantSettingsRepository;
  readonly case: SqliteCaseRepository;
  readonly dataModel: SqliteDataModelRepository;
  readonly dataPool: SqliteDataPoolRepository;
  readonly processModel: SqliteProcessModelRepository;
  readonly table: SqliteTableRepository;
  readonly variant: SqliteVariantRepository;
  readonly auditLog: SqliteAuditLogRepository;
  readonly entityHistory: SqliteEntityHistoryRepository;
  readonly scheduledJob: SqliteScheduledJobRepository;
  readonly apiKey: SqliteApiKeyRepository;
  readonly integration: SqliteIntegrationRepository;
  readonly oAuthToken: SqliteOAuthTokenRepository;
  readonly webhook: SqliteWebhookRepository;
  readonly filter: SqliteFilterRepository;
  readonly knowledgeModel: SqliteKnowledgeModelRepository;
  readonly kpi: SqliteKpiRepository;
  readonly record: SqliteRecordRepository;
  readonly variable: SqliteVariableRepository;
  readonly component: SqliteComponentRepository;
  readonly package: SqlitePackageRepository;
  readonly space: SqliteSpaceRepository;
  readonly view: SqliteViewRepository;
  readonly actionFlow: SqliteActionFlowRepository;
  readonly execution: SqliteExecutionRepository;
  readonly sensor: SqliteSensorRepository;
  readonly signal: SqliteSignalRepository;
  readonly skill: SqliteSkillRepository;
  readonly task: SqliteTaskRepository;
}

/**
 * Create repository container with all repositories
 */
export function createRepositoryContainer(db: Database): IRepositoryContainer {
  return {
    environment: new SqliteEnvironmentRepository(db),
    organization: new SqliteOrganizationRepository(db),
    tenant: new SqliteTenantRepository(db),
    identityProvider: new SqliteIdentityProviderRepository(db),
    mfaDevice: new SqliteMfaDeviceRepository(db),
    role: new SqliteRoleRepository(db),
    session: new SqliteSessionRepository(db),
    team: new SqliteTeamRepository(db),
    user: new SqliteUserRepository(db),
    coupon: new SqliteCouponRepository(db),
    invoice: new SqliteInvoiceRepository(db),
    paymentMethod: new SqlitePaymentMethodRepository(db),
    plan: new SqlitePlanRepository(db),
    subscription: new SqliteSubscriptionRepository(db),
    usage: new SqliteUsageRepository(db),
    featureFlag: new SqliteFeatureFlagRepository(db),
    systemConfig: new SqliteSystemConfigRepository(db),
    tenantSettings: new SqliteTenantSettingsRepository(db),
    case: new SqliteCaseRepository(db),
    dataModel: new SqliteDataModelRepository(db),
    dataPool: new SqliteDataPoolRepository(db),
    processModel: new SqliteProcessModelRepository(db),
    table: new SqliteTableRepository(db),
    variant: new SqliteVariantRepository(db),
    auditLog: new SqliteAuditLogRepository(db),
    entityHistory: new SqliteEntityHistoryRepository(db),
    scheduledJob: new SqliteScheduledJobRepository(db),
    apiKey: new SqliteApiKeyRepository(db),
    integration: new SqliteIntegrationRepository(db),
    oAuthToken: new SqliteOAuthTokenRepository(db),
    webhook: new SqliteWebhookRepository(db),
    filter: new SqliteFilterRepository(db),
    knowledgeModel: new SqliteKnowledgeModelRepository(db),
    kpi: new SqliteKpiRepository(db),
    record: new SqliteRecordRepository(db),
    variable: new SqliteVariableRepository(db),
    component: new SqliteComponentRepository(db),
    package: new SqlitePackageRepository(db),
    space: new SqliteSpaceRepository(db),
    view: new SqliteViewRepository(db),
    actionFlow: new SqliteActionFlowRepository(db),
    execution: new SqliteExecutionRepository(db),
    sensor: new SqliteSensorRepository(db),
    signal: new SqliteSignalRepository(db),
    skill: new SqliteSkillRepository(db),
    task: new SqliteTaskRepository(db),
  };
}

// Singleton instance
let repositoryContainer: IRepositoryContainer | null = null;

/**
 * Get or create the repository container singleton
 */
export function getRepositoryContainer(db: Database): IRepositoryContainer {
  if (!repositoryContainer) {
    repositoryContainer = createRepositoryContainer(db);
  }
  return repositoryContainer;
}

/**
 * Reset the repository container (useful for testing)
 */
export function resetRepositoryContainer(): void {
  repositoryContainer = null;
}
