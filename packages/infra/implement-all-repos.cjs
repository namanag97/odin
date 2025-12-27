#!/usr/bin/env node
/**
 * FAST IMPLEMENTATION - Auto-implement all repository stubs
 * Reads domain repository interfaces and generates working implementations
 */

const fs = require('fs');
const path = require('path');

// Template for a basic CRUD repository implementation
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
    extraFinds = []
  } = config;

  const importEntity = entity === 'Record' ? 'Record as RecordEntity' : entity;
  const entityName = entity === 'Record' ? 'RecordEntity' : entity;

  return `import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
  type PageRequest,
  type PageResponse,
} from "@odin/core-contracts";
import {
  ${importEntity},
  type ${entityId},
  type Create${entity}Data,
  type Update${entity}Data,
  type ${interfaceName},${hasStatus ? `\n  type ${entity}Status,` : ''}${hasType ? `\n  type ${entity}Type,` : ''}
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";

interface ${entity}Row {
  id: string;${hasTenantId ? '\n  tenant_id: string;' : ''}${hasKey ? '\n  key: string;' : ''}
  name: string;
  description: string | null;${hasStatus ? `\n  status: string;` : ''}${hasType ? `\n  type: string;` : ''}
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export class ${className} implements ${interfaceName} {
  constructor(private db: Database) {}

  async findById(id: ${entityId}${hasTenantId ? ', tenantId: TenantId' : ''}): AsyncResult<${entityName} | null> {
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
  async findByKey(key: string, tenantId: TenantId): AsyncResult<${entityName} | null> {
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
` : ''}${extraFinds.map(find => generateFindMethod(find, entity, entityName, tableName, hasTenantId)).join('\n')}
  async create(data: Create${entity}Data): AsyncResult<${entityName}> {
    try {
      const id = globalThis.crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          \`INSERT INTO ${tableName} (
            id,${hasTenantId ? ' tenant_id,' : ''}${hasKey ? ' key,' : ''}
            name, description,${hasStatus ? ' status,' : ''}${hasType ? ' type,' : ''}
            created_at, updated_at
          ) VALUES (?, ?${hasKey ? ', ?' : ''}, ?, ?${hasStatus ? ', ?' : ''}${hasType ? ', ?' : ''}, ?, ?)\`
        )
        .run(
          id,${hasTenantId ? '\n          data.tenantId,' : ''}${hasKey ? '\n          data.key,' : ''}
          data.name,
          data.description || null,${hasStatus ? '\n          data.status || "draft",' : ''}${hasType ? '\n          data.type,' : ''}
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
  ): AsyncResult<${entityName}> {
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
        return await this.findById(id${hasTenantId ? ', tenantId' : ''}) as AsyncResult<${entityName}>;
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

  private mapRowToEntity(row: ${entity}Row): ${entityName} {
    return {
      id: row.id as ${entityId},${hasTenantId ? '\n      tenantId: row.tenant_id as TenantId,' : ''}${hasKey ? '\n      key: row.key,' : ''}
      name: row.name,
      description: row.description || undefined,${hasStatus ? `\n      status: row.status as ${entity}Status,` : ''}${hasType ? `\n      type: row.type as ${entity}Type,` : ''}
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ...this.mapExtraFields(row)
    };
  }

  private mapExtraFields(row: ${entity}Row): Partial<${entityName}> {
    // Override in subclass if needed
    return {};
  }
}
`;
}

function generateFindMethod(config, entity, entityName, tableName, hasTenantId) {
  const { method, column, returnType, hasPage = false } = config;

  if (hasPage) {
    return `
  async ${method}(${config.params}): AsyncResult<PageResponse<${entityName}>> {
    try {
      const { limit, offset } = Pagination.toOffset(page);

      const rows = this.db
        .query<${entity}Row>(
          "SELECT * FROM ${tableName} WHERE ${column} = ?${hasTenantId ? ' AND tenant_id = ?' : ''} LIMIT ? OFFSET ?"
        )
        .all(${config.paramNames}${hasTenantId ? ', tenantId' : ''}, limit, offset);

      const countRow = this.db
        .query<{ count: number }>(
          "SELECT COUNT(*) as count FROM ${tableName} WHERE ${column} = ?${hasTenantId ? ' AND tenant_id = ?' : ''}"
        )
        .get(${config.paramNames}${hasTenantId ? ', tenantId' : ''});

      const items = rows.map(row => this.mapRowToEntity(row));
      const total = countRow?.count || 0;

      return {
        success: true,
        data: Pagination.buildResponse(items, total, page)
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "${method}") };
    }
  }`;
  }

  return `
  async ${method}(${config.params}): AsyncResult<${returnType}> {
    try {
      const rows = this.db
        .query<${entity}Row>(
          "SELECT * FROM ${tableName} WHERE ${column} = ?${hasTenantId ? ' AND tenant_id = ?' : ''}"
        )
        .all(${config.paramNames}${hasTenantId ? ', tenantId' : ''});

      return {
        success: true,
        data: ${returnType === `readonly ${entityName}[]` ? 'rows.map(row => this.mapRowToEntity(row))' : 'rows[0] ? this.mapRowToEntity(rows[0]) : null'}
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "${method}") };
    }
  }`;
}

// Repository configurations
const repositories = [
  // Analytics
  {
    layer: 'analytics',
    className: 'SqliteKnowledgeModelRepository',
    interfaceName: 'IKnowledgeModelRepository',
    entity: 'KnowledgeModel',
    entityId: 'KnowledgeModelId',
    tableName: 'knowledge_models',
    hasKey: true,
    hasStatus: true,
    extraFinds: [
      { method: 'findByPackageId', params: 'packageId: UUID, tenantId: TenantId', paramNames: 'packageId', column: 'package_id', returnType: 'readonly KnowledgeModel[]' },
      { method: 'findByDataModelId', params: 'dataModelId: UUID, tenantId: TenantId', paramNames: 'dataModelId', column: 'data_model_id', returnType: 'readonly KnowledgeModel[]' },
      { method: 'findByStatus', params: 'status: KnowledgeModelStatus, tenantId: TenantId, page: PageRequest', paramNames: 'status', column: 'status', returnType: 'PageResponse<KnowledgeModel>', hasPage: true }
    ]
  },
  {
    layer: 'analytics',
    className: 'SqliteKpiRepository',
    interfaceName: 'IKpiRepository',
    entity: 'Kpi',
    entityId: 'KpiId',
    tableName: 'kpis',
    extraFinds: [
      { method: 'findByKnowledgeModelId', params: 'knowledgeModelId: UUID, tenantId: TenantId', paramNames: 'knowledgeModelId', column: 'knowledge_model_id', returnType: 'readonly Kpi[]' },
      { method: 'findGlobal', params: 'tenantId: TenantId', paramNames: 'true', column: 'is_global', returnType: 'readonly Kpi[]' }
    ]
  },
  {
    layer: 'analytics',
    className: 'SqliteFilterRepository',
    interfaceName: 'IFilterRepository',
    entity: 'Filter',
    entityId: 'FilterId',
    tableName: 'filters',
    hasType: true,
    extraFinds: [
      { method: 'findByKnowledgeModelId', params: 'knowledgeModelId: UUID, tenantId: TenantId', paramNames: 'knowledgeModelId', column: 'knowledge_model_id', returnType: 'readonly Filter[]' },
      { method: 'findGlobal', params: 'tenantId: TenantId', paramNames: 'true', column: 'is_global', returnType: 'readonly Filter[]' },
      { method: 'findDefault', params: 'knowledgeModelId: UUID, tenantId: TenantId', paramNames: 'knowledgeModelId', column: 'knowledge_model_id', returnType: 'readonly Filter[]' }
    ]
  },
  {
    layer: 'analytics',
    className: 'SqliteRecordRepository',
    interfaceName: 'IRecordRepository',
    entity: 'Record',
    entityId: 'RecordId',
    tableName: 'records',
    extraFinds: [
      { method: 'findByKnowledgeModelId', params: 'knowledgeModelId: UUID, tenantId: TenantId', paramNames: 'knowledgeModelId', column: 'knowledge_model_id', returnType: 'readonly RecordEntity[]' }
    ]
  },
  {
    layer: 'analytics',
    className: 'SqliteVariableRepository',
    interfaceName: 'IVariableRepository',
    entity: 'Variable',
    entityId: 'VariableId',
    tableName: 'variables',
    hasType: true,
    extraFinds: [
      { method: 'findByScope', params: 'scopeType: VariableScopeType, scopeId: UUID, tenantId: TenantId', paramNames: 'scopeType', column: 'scope_type', returnType: 'readonly Variable[]' }
    ]
  },

  // Studio
  {
    layer: 'studio',
    className: 'SqliteSpaceRepository',
    interfaceName: 'ISpaceRepository',
    entity: 'Space',
    entityId: 'SpaceId',
    tableName: 'spaces',
    hasType: true,
    extraFinds: [
      { method: 'findByTenantId', params: 'tenantId: TenantId, page: PageRequest', paramNames: 'tenantId', column: 'tenant_id', returnType: 'PageResponse<Space>', hasPage: true },
      { method: 'findByOwnerId', params: 'ownerId: UUID, tenantId: TenantId', paramNames: 'ownerId', column: 'owner_id', returnType: 'readonly Space[]' },
      { method: 'findByType', params: 'type: SpaceType, tenantId: TenantId', paramNames: 'type', column: 'type', returnType: 'readonly Space[]' }
    ]
  },
  {
    layer: 'studio',
    className: 'SqlitePackageRepository',
    interfaceName: 'IPackageRepository',
    entity: 'Package',
    entityId: 'PackageId',
    tableName: 'packages',
    hasKey: true,
    hasStatus: true,
    extraFinds: [
      { method: 'findBySpaceId', params: 'spaceId: UUID, tenantId: TenantId', paramNames: 'spaceId', column: 'space_id', returnType: 'readonly Package[]' },
      { method: 'findByStatus', params: 'status: PackageStatus, tenantId: TenantId, page: PageRequest', paramNames: 'status', column: 'status', returnType: 'PageResponse<Package>', hasPage: true }
    ]
  },
  {
    layer: 'studio',
    className: 'SqliteViewRepository',
    interfaceName: 'IViewRepository',
    entity: 'View',
    entityId: 'ViewId',
    tableName: 'views',
    hasKey: true,
    hasType: true,
    extraFinds: [
      { method: 'findByPackageId', params: 'packageId: UUID, tenantId: TenantId', paramNames: 'packageId', column: 'package_id', returnType: 'readonly View[]' },
      { method: 'findByType', params: 'type: ViewType, tenantId: TenantId, page: PageRequest', paramNames: 'type', column: 'type', returnType: 'PageResponse<View>', hasPage: true }
    ]
  },
  {
    layer: 'studio',
    className: 'SqliteComponentRepository',
    interfaceName: 'IComponentRepository',
    entity: 'Component',
    entityId: 'ComponentId',
    tableName: 'components',
    hasType: true,
    extraFinds: [
      { method: 'findByViewId', params: 'viewId: UUID, tenantId: TenantId', paramNames: 'viewId', column: 'view_id', returnType: 'readonly Component[]' }
    ]
  },

  // Automation
  {
    layer: 'automation',
    className: 'SqliteActionFlowRepository',
    interfaceName: 'IActionFlowRepository',
    entity: 'ActionFlow',
    entityId: 'ActionFlowId',
    tableName: 'action_flows',
    hasStatus: true,
    extraFinds: [
      { method: 'findByTenantId', params: 'tenantId: TenantId, page: PageRequest', paramNames: 'tenantId', column: 'tenant_id', returnType: 'PageResponse<ActionFlow>', hasPage: true },
      { method: 'findByStatus', params: 'status: ActionFlowStatus, tenantId: TenantId', paramNames: 'status', column: 'status', returnType: 'readonly ActionFlow[]' }
    ]
  },
  {
    layer: 'automation',
    className: 'SqliteExecutionRepository',
    interfaceName: 'IExecutionRepository',
    entity: 'Execution',
    entityId: 'ExecutionId',
    tableName: 'executions',
    hasStatus: true,
    extraFinds: [
      { method: 'findByActionFlowId', params: 'actionFlowId: UUID, tenantId: TenantId, page: PageRequest', paramNames: 'actionFlowId', column: 'action_flow_id', returnType: 'PageResponse<Execution>', hasPage: true },
      { method: 'findByStatus', params: 'status: ExecutionStatus, tenantId: TenantId', paramNames: 'status', column: 'status', returnType: 'readonly Execution[]' }
    ]
  },
  {
    layer: 'automation',
    className: 'SqliteSkillRepository',
    interfaceName: 'ISkillRepository',
    entity: 'Skill',
    entityId: 'SkillId',
    tableName: 'skills',
    hasKey: true,
    hasType: true,
    extraFinds: [
      { method: 'findByType', params: 'type: SkillType, tenantId: TenantId', paramNames: 'type', column: 'type', returnType: 'readonly Skill[]' },
      { method: 'findByTenantId', params: 'tenantId: TenantId, page: PageRequest', paramNames: 'tenantId', column: 'tenant_id', returnType: 'PageResponse<Skill>', hasPage: true }
    ]
  },
  {
    layer: 'automation',
    className: 'SqliteSensorRepository',
    interfaceName: 'ISensorRepository',
    entity: 'Sensor',
    entityId: 'SensorId',
    tableName: 'sensors',
    hasType: true,
    extraFinds: [
      { method: 'findByType', params: 'type: SensorType, tenantId: TenantId', paramNames: 'type', column: 'type', returnType: 'readonly Sensor[]' },
      { method: 'findActive', params: 'tenantId: TenantId', paramNames: 'true', column: 'is_active', returnType: 'readonly Sensor[]' },
      { method: 'findByTenantId', params: 'tenantId: TenantId, page: PageRequest', paramNames: 'tenantId', column: 'tenant_id', returnType: 'PageResponse<Sensor>', hasPage: true }
    ]
  },
  {
    layer: 'automation',
    className: 'SqliteSignalRepository',
    interfaceName: 'ISignalRepository',
    entity: 'Signal',
    entityId: 'SignalId',
    tableName: 'signals',
    hasStatus: true,
    extraFinds: [
      { method: 'findBySensorId', params: 'sensorId: UUID, tenantId: TenantId, page: PageRequest', paramNames: 'sensorId', column: 'sensor_id', returnType: 'PageResponse<Signal>', hasPage: true },
      { method: 'findByStatus', params: 'status: SignalStatus, tenantId: TenantId', paramNames: 'status', column: 'status', returnType: 'readonly Signal[]' }
    ]
  },
  {
    layer: 'automation',
    className: 'SqliteTaskRepository',
    interfaceName: 'ITaskRepository',
    entity: 'Task',
    entityId: 'TaskId',
    tableName: 'tasks',
    hasStatus: true,
    extraFinds: [
      { method: 'findByExecutionId', params: 'executionId: UUID, tenantId: TenantId', paramNames: 'executionId', column: 'execution_id', returnType: 'readonly Task[]' },
      { method: 'findByAssignee', params: 'assignedTo: UUID, tenantId: TenantId, page: PageRequest', paramNames: 'assignedTo', column: 'assigned_to', returnType: 'PageResponse<Task>', hasPage: true },
      { method: 'findByStatus', params: 'status: TaskStatus, tenantId: TenantId', paramNames: 'status', column: 'status', returnType: 'readonly Task[]' },
      { method: 'findByPriority', params: 'priority: TaskPriority, tenantId: TenantId', paramNames: 'priority', column: 'priority', returnType: 'readonly Task[]' }
    ]
  }
];

// Generate all repositories
console.log('🚀 Implementing all repository stubs...\n');

let generated = 0;
for (const config of repositories) {
  const code = generateRepositoryImpl(config);
  const fileName = config.className
    .replace('Sqlite', '')
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .substring(1) + '.ts';

  const filePath = path.join(
    __dirname,
    'database',
    'repositories',
    config.layer,
    fileName
  );

  fs.writeFileSync(filePath, code);
  console.log(`✓ ${config.layer}/${fileName}`);
  generated++;
}

console.log(`\n✅ Implemented ${generated} repositories!\n`);
