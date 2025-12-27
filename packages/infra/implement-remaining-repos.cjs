#!/usr/bin/env node
/**
 * COMPREHENSIVE REPOSITORY IMPLEMENTATION
 * Generates all 22 missing repository implementations
 */

const fs = require('fs');
const path = require('path');

// Template for repository implementation
function generateRepositoryImpl(config) {
  const {
    className,
    interfaceName,
    entity,
    entityId,
    tableName,
    layer,
    hasKey = false,
    hasTenantId = true,
    hasStatus = false,
    hasType = false,
    customFields = [],
    customImports = [],
    extraFinds = []
  } = config;

  const baseImports = `import type { Database } from "bun:sqlite";
import {
  type AsyncResult,${hasTenantId ? '\n  type TenantId,' : ''}
  type UUID,${extraFinds.some(f => f.hasPage) ? '\n  type PageRequest,\n  type PageResponse,' : ''}
} from "@odin/core-contracts";
import {
  type ${entity},
  type ${entityId},
  type Create${entity}Data,
  type Update${entity}Data,
  type ${interfaceName},${hasStatus ? `\n  type ${entity}Status,` : ''}${hasType ? `\n  type ${entity}Type,` : ''}${customImports.length > 0 ? `\n  ${customImports.join(',\n  ')},` : ''}
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";`;

  const rowInterface = `
interface ${entity}Row {
  id: string;${hasTenantId ? '\n  tenant_id: string;' : ''}${hasKey ? '\n  key: string;' : ''}
  name: string;
  description: string | null;${hasStatus ? `\n  status: string;` : ''}${hasType ? `\n  type: string;` : ''}${customFields.map(f => `\n  ${f.dbColumn}: ${f.dbType};`).join('')}
  created_at: string;
  updated_at: string;${hasTenantId ? '' : '\n  [key: string]: unknown;'}
}`;

  const mapRowToEntity = `
  private mapRowToEntity(row: ${entity}Row): ${entity} {
    return {
      id: row.id as ${entityId},${hasTenantId ? '\n      tenantId: row.tenant_id as TenantId,' : ''}${hasKey ? '\n      key: row.key,' : ''}
      name: row.name,
      description: row.description || undefined,${hasStatus ? `\n      status: row.status as ${entity}Status,` : ''}${hasType ? `\n      type: row.type as ${entity}Type,` : ''}${customFields.map(f => `\n      ${f.entityField}: ${f.mapper || `row.${f.dbColumn}`},`).join('')}
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }`;

  const findMethods = extraFinds.map(find => {
    if (find.hasPage) {
      return `
  async ${find.method}(${find.params}): AsyncResult<PageResponse<${entity}>> {
    try {
      const { limit, offset } = Pagination.toOffset(page);

      const rows = this.db
        .query<${entity}Row>(
          "SELECT * FROM ${tableName} WHERE ${find.column} = ?${hasTenantId && !find.noTenantFilter ? ' AND tenant_id = ?' : ''} LIMIT ? OFFSET ?"
        )
        .all(${find.paramNames}${hasTenantId && !find.noTenantFilter ? ', tenantId' : ''}, limit, offset);

      const countRow = this.db
        .query<{ count: number }>(
          "SELECT COUNT(*) as count FROM ${tableName} WHERE ${find.column} = ?${hasTenantId && !find.noTenantFilter ? ' AND tenant_id = ?' : ''}"
        )
        .get(${find.paramNames}${hasTenantId && !find.noTenantFilter ? ', tenantId' : ''});

      const items = rows.map(row => this.mapRowToEntity(row));
      const total = countRow?.count || 0;

      return {
        success: true,
        data: Pagination.buildResponse(items, total, page)
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "${find.method}") };
    }
  }`;
    }

    return `
  async ${find.method}(${find.params}): AsyncResult<${find.returnType}> {
    try {
      const ${find.single ? 'row' : 'rows'} = this.db
        .query<${entity}Row>(
          "SELECT * FROM ${tableName} WHERE ${find.column} = ?${hasTenantId && !find.noTenantFilter ? ' AND tenant_id = ?' : ''}"
        )
        .${find.single ? 'get' : 'all'}(${find.paramNames}${hasTenantId && !find.noTenantFilter ? ', tenantId' : ''});

      ${find.single ? `
      if (!row) {
        return { success: true, data: null };
      }
      return { success: true, data: this.mapRowToEntity(row) };` : `
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };`}
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "${find.method}") };
    }
  }`;
  }).join('\n');

  return `${baseImports}

${rowInterface}

export class ${className} implements ${interfaceName} {
  constructor(private db: Database) {}

  async findById(id: ${entityId}${hasTenantId ? ', tenantId: TenantId' : ''}): AsyncResult<${entity} | null> {
    try {
      const row = this.db
        .query<${entity}Row, [string${hasTenantId ? ', string' : ''}]>(
          "SELECT * FROM ${tableName} WHERE id = ?${hasTenantId ? ' AND tenant_id = ?' : ''}"
        )
        .get(id${hasTenantId ? ', tenantId' : ''});

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }
${hasKey ? `
  async findByKey(key: string, tenantId: TenantId): AsyncResult<${entity} | null> {
    try {
      const row = this.db
        .query<${entity}Row, [string, string]>(
          "SELECT * FROM ${tableName} WHERE key = ? AND tenant_id = ?"
        )
        .get(key, tenantId);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByKey") };
    }
  }
` : ''}${findMethods}

  async create(data: Create${entity}Data): AsyncResult<${entity}> {
    try {
      const id = globalThis.crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          \`INSERT INTO ${tableName} (
            id,${hasTenantId ? ' tenant_id,' : ''}${hasKey ? ' key,' : ''}
            name, description,${hasStatus ? ' status,' : ''}${hasType ? ' type,' : ''}${customFields.filter(f => f.inCreate).map(f => ` ${f.dbColumn},`).join('')}
            created_at, updated_at
          ) VALUES (?${hasTenantId ? ', ?' : ''}${hasKey ? ', ?' : ''}, ?, ?${hasStatus ? ', ?' : ''}${hasType ? ', ?' : ''}${customFields.filter(f => f.inCreate).map(() => ', ?').join('')}, ?, ?)\`
        )
        .run(
          id,${hasTenantId ? '\n          data.tenantId,' : ''}${hasKey ? '\n          data.key,' : ''}
          data.name,
          data.description || null,${hasStatus ? '\n          data.status || "draft",' : ''}${hasType ? '\n          data.type,' : ''}${customFields.filter(f => f.inCreate).map(f => `\n          ${f.createValue || `data.${f.entityField}`},`).join('')}
          now,
          now
        );

      const result = await this.findById(id as ${entityId}${hasTenantId ? ', data.tenantId' : ''});
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create ${entity}"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: ${entityId},
    data: Update${entity}Data,${hasTenantId ? '\n    tenantId: TenantId' : ''}
  ): AsyncResult<${entity}> {
    try {
      const updates: string[] = [];
      const params: unknown[] = [];

      if (data.name !== undefined) {
        updates.push("name = ?");
        params.push(data.name);
      }
      if (data.description !== undefined) {
        updates.push("description = ?");
        params.push(data.description);
      }${hasStatus ? `
      if (data.status !== undefined) {
        updates.push("status = ?");
        params.push(data.status);
      }` : ''}

      if (updates.length === 0) {
        return await this.findById(id${hasTenantId ? ', tenantId' : ''}) as AsyncResult<${entity}>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);${hasTenantId ? '\n      params.push(tenantId);' : ''}

      this.db
        .query(
          \`UPDATE ${tableName} SET \${updates.join(", ")} WHERE id = ?${hasTenantId ? ' AND tenant_id = ?' : ''}\`
        )
        .run(...params);

      const result = await this.findById(id${hasTenantId ? ', tenantId' : ''});
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("${entity} not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: ${entityId}${hasTenantId ? ', tenantId: TenantId' : ''}): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM ${tableName} WHERE id = ?${hasTenantId ? ' AND tenant_id = ?' : ''}")
        .run(id${hasTenantId ? ', tenantId' : ''});

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }
${mapRowToEntity}
}
`;
}

// Repository configurations for all 22 missing repositories
const repositories = [
  // ===== Commercial Layer (6) =====
  {
    layer: 'commercial',
    className: 'SqlitePlanRepository',
    interfaceName: 'IPlanRepository',
    entity: 'Plan',
    entityId: 'PlanId',
    tableName: 'plans',
    hasKey: true,
    customFields: [
      { entityField: 'tier', dbColumn: 'tier', dbType: 'string', inCreate: true },
      { entityField: 'billingInterval', dbColumn: 'billing_interval', dbType: 'string', inCreate: true },
      { entityField: 'basePrice', dbColumn: 'base_price', dbType: 'number', inCreate: true },
      { entityField: 'currency', dbColumn: 'currency', dbType: 'string', inCreate: true },
    ],
    customImports: ['PlanTier', 'BillingInterval'],
    hasTenantId: false,
    extraFinds: [
      { method: 'findByTier', params: 'tier: PlanTier', paramNames: 'tier', column: 'tier', returnType: 'readonly Plan[]', noTenantFilter: true },
      { method: 'findActive', params: '', paramNames: '1', column: 'is_active', returnType: 'readonly Plan[]', noTenantFilter: true },
    ]
  },
  {
    layer: 'commercial',
    className: 'SqliteSubscriptionRepository',
    interfaceName: 'ISubscriptionRepository',
    entity: 'Subscription',
    entityId: 'SubscriptionId',
    tableName: 'subscriptions',
    hasStatus: true,
    customFields: [
      { entityField: 'planId', dbColumn: 'plan_id', dbType: 'string', inCreate: true },
      { entityField: 'currentPeriodStart', dbColumn: 'current_period_start', dbType: 'string', inCreate: true },
      { entityField: 'currentPeriodEnd', dbColumn: 'current_period_end', dbType: 'string', inCreate: true },
    ],
    extraFinds: [
      { method: 'findByTenantId', params: 'tenantId: TenantId', paramNames: 'tenantId', column: 'tenant_id', returnType: 'readonly Subscription[]' },
      { method: 'findByPlanId', params: 'planId: UUID, tenantId: TenantId', paramNames: 'planId', column: 'plan_id', returnType: 'readonly Subscription[]' },
      { method: 'findByStatus', params: 'status: SubscriptionStatus, tenantId: TenantId', paramNames: 'status', column: 'status', returnType: 'readonly Subscription[]' },
    ]
  },
  {
    layer: 'commercial',
    className: 'SqliteInvoiceRepository',
    interfaceName: 'IInvoiceRepository',
    entity: 'Invoice',
    entityId: 'InvoiceId',
    tableName: 'invoices',
    hasStatus: true,
    customFields: [
      { entityField: 'number', dbColumn: 'number', dbType: 'string', inCreate: true },
      { entityField: 'total', dbColumn: 'total', dbType: 'number', inCreate: true },
      { entityField: 'amountDue', dbColumn: 'amount_due', dbType: 'number', inCreate: true },
      { entityField: 'dueDate', dbColumn: 'due_date', dbType: 'string', inCreate: true },
    ],
    extraFinds: [
      { method: 'findByTenantId', params: 'tenantId: TenantId, page: PageRequest', paramNames: 'tenantId', column: 'tenant_id', returnType: 'PageResponse<Invoice>', hasPage: true },
      { method: 'findByStatus', params: 'status: InvoiceStatus, tenantId: TenantId', paramNames: 'status', column: 'status', returnType: 'readonly Invoice[]' },
    ]
  },
  {
    layer: 'commercial',
    className: 'SqlitePaymentMethodRepository',
    interfaceName: 'IPaymentMethodRepository',
    entity: 'PaymentMethod',
    entityId: 'PaymentMethodId',
    tableName: 'payment_methods',
    hasType: true,
    customFields: [
      { entityField: 'provider', dbColumn: 'provider', dbType: 'string', inCreate: true },
      { entityField: 'isDefault', dbColumn: 'is_default', dbType: 'number', inCreate: true, createValue: 'data.isDefault ? 1 : 0' },
    ],
    customImports: ['PaymentProvider'],
    extraFinds: [
      { method: 'findByTenantId', params: 'tenantId: TenantId', paramNames: 'tenantId', column: 'tenant_id', returnType: 'readonly PaymentMethod[]' },
      { method: 'findDefault', params: 'tenantId: TenantId', paramNames: '1', column: 'is_default', returnType: 'PaymentMethod | null', single: true },
    ]
  },
  {
    layer: 'commercial',
    className: 'SqliteUsageRepository',
    interfaceName: 'IUsageRepository',
    entity: 'UsageRecord',
    entityId: 'UsageRecordId',
    tableName: 'usage_records',
    customFields: [
      { entityField: 'subscriptionId', dbColumn: 'subscription_id', dbType: 'string', inCreate: true },
      { entityField: 'resourceType', dbColumn: 'resource_type', dbType: 'string', inCreate: true },
      { entityField: 'quantity', dbColumn: 'quantity', dbType: 'number', inCreate: true },
      { entityField: 'timestamp', dbColumn: 'timestamp', dbType: 'string', inCreate: true },
    ],
    extraFinds: [
      { method: 'findBySubscriptionId', params: 'subscriptionId: UUID, tenantId: TenantId', paramNames: 'subscriptionId', column: 'subscription_id', returnType: 'readonly UsageRecord[]' },
      { method: 'findByResourceType', params: 'resourceType: string, tenantId: TenantId', paramNames: 'resourceType', column: 'resource_type', returnType: 'readonly UsageRecord[]' },
    ]
  },
  {
    layer: 'commercial',
    className: 'SqliteCouponRepository',
    interfaceName: 'ICouponRepository',
    entity: 'Coupon',
    entityId: 'CouponId',
    tableName: 'coupons',
    hasKey: true,
    hasTenantId: false,
    customFields: [
      { entityField: 'discountType', dbColumn: 'discount_type', dbType: 'string', inCreate: true },
      { entityField: 'discountValue', dbColumn: 'discount_value', dbType: 'number', inCreate: true },
      { entityField: 'isActive', dbColumn: 'is_active', dbType: 'number', inCreate: true, createValue: 'data.isActive ? 1 : 0' },
    ],
    customImports: ['DiscountType'],
    extraFinds: [
      { method: 'findActive', params: '', paramNames: '1', column: 'is_active', returnType: 'readonly Coupon[]', noTenantFilter: true },
    ]
  },

  // ===== Operational Layer (3) =====
  {
    layer: 'operational',
    className: 'SqliteTenantSettingsRepository',
    interfaceName: 'ITenantSettingsRepository',
    entity: 'ExtendedTenantSettings',
    entityId: 'TenantSettingsId',
    tableName: 'tenant_settings',
    customFields: [
      { entityField: 'timezone', dbColumn: 'timezone', dbType: 'string', inCreate: true },
      { entityField: 'locale', dbColumn: 'locale', dbType: 'string', inCreate: true },
      { entityField: 'currency', dbColumn: 'currency', dbType: 'string', inCreate: true },
    ],
    extraFinds: [
      { method: 'findByTenantId', params: 'tenantId: TenantId', paramNames: 'tenantId', column: 'tenant_id', returnType: 'ExtendedTenantSettings | null', single: true },
    ]
  },
  {
    layer: 'operational',
    className: 'SqliteFeatureFlagRepository',
    interfaceName: 'IFeatureFlagRepository',
    entity: 'FeatureFlag',
    entityId: 'FeatureFlagId',
    tableName: 'feature_flags',
    hasKey: true,
    hasType: true,
    hasTenantId: false,
    customFields: [
      { entityField: 'defaultValue', dbColumn: 'default_value', dbType: 'string', inCreate: true },
      { entityField: 'isEnabled', dbColumn: 'is_enabled', dbType: 'number', inCreate: true, createValue: 'data.isEnabled ? 1 : 0' },
    ],
    extraFinds: [
      { method: 'findEnabled', params: '', paramNames: '1', column: 'is_enabled', returnType: 'readonly FeatureFlag[]', noTenantFilter: true },
    ]
  },
  {
    layer: 'operational',
    className: 'SqliteSystemConfigRepository',
    interfaceName: 'ISystemConfigRepository',
    entity: 'SystemConfig',
    entityId: 'SystemConfigId',
    tableName: 'system_configs',
    hasKey: true,
    hasType: true,
    hasTenantId: false,
    customFields: [
      { entityField: 'value', dbColumn: 'value', dbType: 'string', inCreate: true },
      { entityField: 'isSensitive', dbColumn: 'is_sensitive', dbType: 'number', inCreate: true, createValue: 'data.isSensitive ? 1 : 0' },
    ],
    extraFinds: []
  },

  // ===== Temporal Layer (3) =====
  {
    layer: 'temporal',
    className: 'SqliteAuditLogRepository',
    interfaceName: 'IAuditLogRepository',
    entity: 'AuditLog',
    entityId: 'AuditLogId',
    tableName: 'audit_logs',
    customFields: [
      { entityField: 'actorType', dbColumn: 'actor_type', dbType: 'string', inCreate: true },
      { entityField: 'actorId', dbColumn: 'actor_id', dbType: 'string', inCreate: true },
      { entityField: 'action', dbColumn: 'action', dbType: 'string', inCreate: true },
      { entityField: 'resourceType', dbColumn: 'resource_type', dbType: 'string', inCreate: true },
      { entityField: 'resourceId', dbColumn: 'resource_id', dbType: 'string', inCreate: true },
    ],
    customImports: ['ActorType', 'AuditAction', 'AuditResourceType'],
    extraFinds: [
      { method: 'findByTenantId', params: 'tenantId: TenantId, page: PageRequest', paramNames: 'tenantId', column: 'tenant_id', returnType: 'PageResponse<AuditLog>', hasPage: true },
      { method: 'findByActor', params: 'actorId: string, tenantId: TenantId, page: PageRequest', paramNames: 'actorId', column: 'actor_id', returnType: 'PageResponse<AuditLog>', hasPage: true },
      { method: 'findByResource', params: 'resourceType: AuditResourceType, resourceId: string, tenantId: TenantId', paramNames: 'resourceType', column: 'resource_type', returnType: 'readonly AuditLog[]' },
    ]
  },
  {
    layer: 'temporal',
    className: 'SqliteEntityHistoryRepository',
    interfaceName: 'IEntityHistoryRepository',
    entity: 'EntityHistory',
    entityId: 'EntityHistoryId',
    tableName: 'entity_history',
    hasTenantId: false,
    customFields: [
      { entityField: 'entityType', dbColumn: 'entity_type', dbType: 'string', inCreate: true },
      { entityField: 'entityId', dbColumn: 'entity_id', dbType: 'string', inCreate: true },
      { entityField: 'version', dbColumn: 'version', dbType: 'number', inCreate: true },
      { entityField: 'operation', dbColumn: 'operation', dbType: 'string', inCreate: true },
    ],
    customImports: ['HistoryOperation'],
    extraFinds: [
      { method: 'findByEntityId', params: 'entityType: string, entityId: string', paramNames: 'entityType', column: 'entity_type', returnType: 'readonly EntityHistory[]', noTenantFilter: true },
    ]
  },
  {
    layer: 'temporal',
    className: 'SqliteScheduledJobRepository',
    interfaceName: 'IScheduledJobRepository',
    entity: 'ScheduledJob',
    entityId: 'ScheduledJobId',
    tableName: 'scheduled_jobs',
    hasStatus: true,
    hasType: true,
    customFields: [
      { entityField: 'schedule', dbColumn: 'schedule', dbType: 'string', inCreate: true },
      { entityField: 'nextRunAt', dbColumn: 'next_run_at', dbType: 'string | null', inCreate: true },
    ],
    extraFinds: [
      { method: 'findByTenantId', params: 'tenantId: TenantId, page: PageRequest', paramNames: 'tenantId', column: 'tenant_id', returnType: 'PageResponse<ScheduledJob>', hasPage: true },
      { method: 'findByStatus', params: 'status: ScheduledJobStatus, tenantId: TenantId', paramNames: 'status', column: 'status', returnType: 'readonly ScheduledJob[]' },
      { method: 'findDue', params: 'tenantId: TenantId', paramNames: 'tenantId', column: 'tenant_id', returnType: 'readonly ScheduledJob[]' },
    ]
  },

  // ===== Integration Layer (4) =====
  {
    layer: 'integration',
    className: 'SqliteApiKeyRepository',
    interfaceName: 'IApiKeyRepository',
    entity: 'ApiKey',
    entityId: 'ApiKeyId',
    tableName: 'api_keys',
    customFields: [
      { entityField: 'keyPrefix', dbColumn: 'key_prefix', dbType: 'string', inCreate: true },
      { entityField: 'keyHash', dbColumn: 'key_hash', dbType: 'string', inCreate: true },
      { entityField: 'createdBy', dbColumn: 'created_by', dbType: 'string', inCreate: true },
    ],
    extraFinds: [
      { method: 'findByTenantId', params: 'tenantId: TenantId', paramNames: 'tenantId', column: 'tenant_id', returnType: 'readonly ApiKey[]' },
      { method: 'findByKeyHash', params: 'keyHash: string, tenantId: TenantId', paramNames: 'keyHash', column: 'key_hash', returnType: 'ApiKey | null', single: true },
    ]
  },
  {
    layer: 'integration',
    className: 'SqliteWebhookRepository',
    interfaceName: 'IWebhookRepository',
    entity: 'Webhook',
    entityId: 'WebhookId',
    tableName: 'webhooks',
    customFields: [
      { entityField: 'url', dbColumn: 'url', dbType: 'string', inCreate: true },
      { entityField: 'isActive', dbColumn: 'is_active', dbType: 'number', inCreate: true, createValue: 'data.isActive ? 1 : 0' },
    ],
    extraFinds: [
      { method: 'findByTenantId', params: 'tenantId: TenantId', paramNames: 'tenantId', column: 'tenant_id', returnType: 'readonly Webhook[]' },
      { method: 'findActive', params: 'tenantId: TenantId', paramNames: '1', column: 'is_active', returnType: 'readonly Webhook[]' },
    ]
  },
  {
    layer: 'integration',
    className: 'SqliteIntegrationRepository',
    interfaceName: 'IIntegrationRepository',
    entity: 'Integration',
    entityId: 'IntegrationId',
    tableName: 'integrations',
    hasStatus: true,
    hasType: true,
    customFields: [
      { entityField: 'provider', dbColumn: 'provider', dbType: 'string', inCreate: true },
    ],
    extraFinds: [
      { method: 'findByTenantId', params: 'tenantId: TenantId', paramNames: 'tenantId', column: 'tenant_id', returnType: 'readonly Integration[]' },
      { method: 'findByProvider', params: 'provider: string, tenantId: TenantId', paramNames: 'provider', column: 'provider', returnType: 'readonly Integration[]' },
      { method: 'findByStatus', params: 'status: IntegrationStatus, tenantId: TenantId', paramNames: 'status', column: 'status', returnType: 'readonly Integration[]' },
    ]
  },
  {
    layer: 'integration',
    className: 'SqliteOAuthTokenRepository',
    interfaceName: 'IOAuthTokenRepository',
    entity: 'OAuthToken',
    entityId: 'OAuthTokenId',
    tableName: 'oauth_tokens',
    hasTenantId: false,
    customFields: [
      { entityField: 'integrationId', dbColumn: 'integration_id', dbType: 'string', inCreate: true },
      { entityField: 'tokenType', dbColumn: 'token_type', dbType: 'string', inCreate: true },
      { entityField: 'expiresAt', dbColumn: 'expires_at', dbType: 'string', inCreate: true },
    ],
    extraFinds: [
      { method: 'findByIntegrationId', params: 'integrationId: UUID', paramNames: 'integrationId', column: 'integration_id', returnType: 'readonly OAuthToken[]', noTenantFilter: true },
    ]
  },

  // ===== Process Mining Layer (6) =====
  {
    layer: 'process-mining',
    className: 'SqliteDataPoolRepository',
    interfaceName: 'IDataPoolRepository',
    entity: 'DataPool',
    entityId: 'DataPoolId',
    tableName: 'data_pools',
    hasStatus: true,
    hasType: true,
    customFields: [
      { entityField: 'poolType', dbColumn: 'pool_type', dbType: 'string', inCreate: true },
    ],
    customImports: ['DataPoolType'],
    extraFinds: [
      { method: 'findByTenantId', params: 'tenantId: TenantId, page: PageRequest', paramNames: 'tenantId', column: 'tenant_id', returnType: 'PageResponse<DataPool>', hasPage: true },
      { method: 'findByType', params: 'poolType: DataPoolType, tenantId: TenantId', paramNames: 'poolType', column: 'pool_type', returnType: 'readonly DataPool[]' },
    ]
  },
  {
    layer: 'process-mining',
    className: 'SqliteTableRepository',
    interfaceName: 'ITableRepository',
    entity: 'Table',
    entityId: 'TableId',
    tableName: 'tables',
    hasType: true,
    customFields: [
      { entityField: 'dataPoolId', dbColumn: 'data_pool_id', dbType: 'string', inCreate: true },
      { entityField: 'rowCount', dbColumn: 'row_count', dbType: 'number', inCreate: true },
    ],
    customImports: ['TableType'],
    extraFinds: [
      { method: 'findByDataPoolId', params: 'dataPoolId: UUID, tenantId: TenantId', paramNames: 'dataPoolId', column: 'data_pool_id', returnType: 'readonly Table[]' },
      { method: 'findByType', params: 'tableType: TableType, tenantId: TenantId', paramNames: 'tableType', column: 'type', returnType: 'readonly Table[]' },
    ]
  },
  {
    layer: 'process-mining',
    className: 'SqliteDataModelRepository',
    interfaceName: 'IDataModelRepository',
    entity: 'DataModel',
    entityId: 'DataModelId',
    tableName: 'data_models',
    hasStatus: true,
    hasType: true,
    customFields: [
      { entityField: 'dataPoolId', dbColumn: 'data_pool_id', dbType: 'string', inCreate: true },
      { entityField: 'modelType', dbColumn: 'model_type', dbType: 'string', inCreate: true },
    ],
    customImports: ['DataModelType'],
    extraFinds: [
      { method: 'findByDataPoolId', params: 'dataPoolId: UUID, tenantId: TenantId', paramNames: 'dataPoolId', column: 'data_pool_id', returnType: 'readonly DataModel[]' },
      { method: 'findByType', params: 'modelType: DataModelType, tenantId: TenantId', paramNames: 'modelType', column: 'model_type', returnType: 'readonly DataModel[]' },
    ]
  },
  {
    layer: 'process-mining',
    className: 'SqliteCaseRepository',
    interfaceName: 'ICaseRepository',
    entity: 'Case',
    entityId: 'CaseId',
    tableName: 'cases',
    customFields: [
      { entityField: 'dataModelId', dbColumn: 'data_model_id', dbType: 'string', inCreate: true },
      { entityField: 'caseKey', dbColumn: 'case_key', dbType: 'string', inCreate: true },
      { entityField: 'eventCount', dbColumn: 'event_count', dbType: 'number', inCreate: true },
    ],
    extraFinds: [
      { method: 'findByDataModelId', params: 'dataModelId: UUID, tenantId: TenantId, page: PageRequest', paramNames: 'dataModelId', column: 'data_model_id', returnType: 'PageResponse<Case>', hasPage: true },
    ]
  },
  {
    layer: 'process-mining',
    className: 'SqliteVariantRepository',
    interfaceName: 'IVariantRepository',
    entity: 'Variant',
    entityId: 'VariantId',
    tableName: 'variants',
    customFields: [
      { entityField: 'dataModelId', dbColumn: 'data_model_id', dbType: 'string', inCreate: true },
      { entityField: 'frequency', dbColumn: 'frequency', dbType: 'number', inCreate: true },
    ],
    extraFinds: [
      { method: 'findByDataModelId', params: 'dataModelId: UUID, tenantId: TenantId', paramNames: 'dataModelId', column: 'data_model_id', returnType: 'readonly Variant[]' },
    ]
  },
  {
    layer: 'process-mining',
    className: 'SqliteProcessModelRepository',
    interfaceName: 'IProcessModelRepository',
    entity: 'ProcessModel',
    entityId: 'ProcessModelId',
    tableName: 'process_models',
    hasType: true,
    customFields: [
      { entityField: 'dataModelId', dbColumn: 'data_model_id', dbType: 'string', inCreate: true },
      { entityField: 'modelType', dbColumn: 'model_type', dbType: 'string', inCreate: true },
    ],
    customImports: ['ProcessModelType'],
    extraFinds: [
      { method: 'findByDataModelId', params: 'dataModelId: UUID, tenantId: TenantId', paramNames: 'dataModelId', column: 'data_model_id', returnType: 'readonly ProcessModel[]' },
      { method: 'findByType', params: 'modelType: ProcessModelType, tenantId: TenantId', paramNames: 'modelType', column: 'model_type', returnType: 'readonly ProcessModel[]' },
    ]
  },
];

// Generate all repositories
console.log('🚀 Implementing 22 missing repositories...\n');

let generated = 0;
let failed = 0;

for (const config of repositories) {
  try {
    const code = generateRepositoryImpl(config);
    const fileName = config.className
      .replace('Sqlite', '')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .substring(1) + '.ts';

    const dirPath = path.join(__dirname, 'database', 'repositories', config.layer);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, fileName);

    fs.writeFileSync(filePath, code);
    console.log(`✓ ${config.layer}/${fileName}`);
    generated++;
  } catch (error) {
    console.error(`✗ Failed to generate ${config.layer}/${config.className}:`, error.message);
    failed++;
  }
}

console.log(`\n✅ Successfully implemented ${generated} repositories!`);
if (failed > 0) {
  console.log(`⚠️  Failed to implement ${failed} repositories`);
}
console.log('\n📝 Next steps:');
console.log('1. Run: node packages/infra/update-factory.cjs');
console.log('2. Run: pnpm typecheck');
console.log('3. Fix any remaining type errors');
