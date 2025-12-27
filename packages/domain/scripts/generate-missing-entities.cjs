#!/usr/bin/env node
/**
 * Generate missing domain entities and repositories
 * Fast automation to complete the domain layer
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// ANALYTICS ENTITIES
// ============================================================================

const analyticsEntities = {
  'knowledge-model': {
    entity: `import type { UUID, TenantId, UserId, ISODateTime, PositiveInt } from "@odin/core-contracts";

export type KnowledgeModelId = UUID;
export type KnowledgeModelType = 'base' | 'extension';
export type PublishStatus = 'draft' | 'published' | 'deprecated';

export interface KnowledgeModel {
  readonly id: KnowledgeModelId;
  readonly tenantId: TenantId;
  readonly packageId: UUID;
  readonly dataModelId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: KnowledgeModelType;
  readonly baseKnowledgeModelId?: KnowledgeModelId;
  readonly status: PublishStatus;
  readonly version: PositiveInt;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly publishedAt?: ISODateTime;
  readonly createdBy: UserId;
}

export interface CreateKnowledgeModelData {
  readonly tenantId: TenantId;
  readonly packageId: UUID;
  readonly dataModelId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type?: KnowledgeModelType;
  readonly baseKnowledgeModelId?: KnowledgeModelId;
  readonly createdBy: UserId;
}

export interface UpdateKnowledgeModelData {
  readonly name?: string;
  readonly description?: string;
  readonly status?: PublishStatus;
}
`,
    repository: `import type { AsyncResult, TenantId, UUID, PageRequest, PageResponse } from "@odin/core-contracts";
import type { KnowledgeModel, KnowledgeModelId, CreateKnowledgeModelData, UpdateKnowledgeModelData, PublishStatus } from "../../entities/analytics/knowledge-model";

export interface IKnowledgeModelRepository {
  findById(id: KnowledgeModelId, tenantId: TenantId): AsyncResult<KnowledgeModel | null>;
  findByKey(key: string, tenantId: TenantId): AsyncResult<KnowledgeModel | null>;
  findByPackageId(packageId: UUID, tenantId: TenantId): AsyncResult<readonly KnowledgeModel[]>;
  findByDataModelId(dataModelId: UUID, tenantId: TenantId): AsyncResult<readonly KnowledgeModel[]>;
  findByStatus(status: PublishStatus, tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<KnowledgeModel>>;

  create(data: CreateKnowledgeModelData): AsyncResult<KnowledgeModel>;
  update(id: KnowledgeModelId, data: UpdateKnowledgeModelData, tenantId: TenantId): AsyncResult<KnowledgeModel>;
  delete(id: KnowledgeModelId, tenantId: TenantId): AsyncResult<void>;

  publish(id: KnowledgeModelId, tenantId: TenantId): AsyncResult<KnowledgeModel>;
  unpublish(id: KnowledgeModelId, tenantId: TenantId): AsyncResult<KnowledgeModel>;
}
`
  },
  'kpi': {
    entity: `import type { UUID, ISODateTime } from "@odin/core-contracts";

export type KpiId = UUID;

export interface Kpi {
  readonly id: KpiId;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly category?: string;
  readonly expression: string;
  readonly format: string;
  readonly isGlobal: boolean;
  readonly sortOrder: number;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateKpiData {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly category?: string;
  readonly expression: string;
  readonly format: string;
  readonly isGlobal?: boolean;
  readonly sortOrder?: number;
}

export interface UpdateKpiData {
  readonly name?: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly expression?: string;
  readonly format?: string;
}
`,
    repository: `import type { AsyncResult, TenantId, UUID } from "@odin/core-contracts";
import type { Kpi, KpiId, CreateKpiData, UpdateKpiData } from "../../entities/analytics/kpi";

export interface IKpiRepository {
  findById(id: KpiId, tenantId: TenantId): AsyncResult<Kpi | null>;
  findByKnowledgeModelId(knowledgeModelId: UUID, tenantId: TenantId): AsyncResult<readonly Kpi[]>;
  findGlobal(tenantId: TenantId): AsyncResult<readonly Kpi[]>;

  create(data: CreateKpiData, tenantId: TenantId): AsyncResult<Kpi>;
  update(id: KpiId, data: UpdateKpiData, tenantId: TenantId): AsyncResult<Kpi>;
  delete(id: KpiId, tenantId: TenantId): AsyncResult<void>;
}
`
  },
  'filter': {
    entity: `import type { UUID, ISODateTime } from "@odin/core-contracts";

export type FilterId = UUID;
export type FilterType = 'date_range' | 'attribute' | 'object_type' | 'activity' | 'custom';

export interface Filter {
  readonly id: FilterId;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: FilterType;
  readonly config: Record<string, unknown>;
  readonly isGlobal: boolean;
  readonly isDefault: boolean;
  readonly sortOrder: number;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateFilterData {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: FilterType;
  readonly config: Record<string, unknown>;
  readonly isGlobal?: boolean;
  readonly isDefault?: boolean;
}

export interface UpdateFilterData {
  readonly name?: string;
  readonly displayName?: string;
  readonly config?: Record<string, unknown>;
  readonly isDefault?: boolean;
}
`,
    repository: `import type { AsyncResult, TenantId, UUID } from "@odin/core-contracts";
import type { Filter, FilterId, CreateFilterData, UpdateFilterData } from "../../entities/analytics/filter";

export interface IFilterRepository {
  findById(id: FilterId, tenantId: TenantId): AsyncResult<Filter | null>;
  findByKnowledgeModelId(knowledgeModelId: UUID, tenantId: TenantId): AsyncResult<readonly Filter[]>;
  findGlobal(tenantId: TenantId): AsyncResult<readonly Filter[]>;
  findDefault(knowledgeModelId: UUID, tenantId: TenantId): AsyncResult<readonly Filter[]>;

  create(data: CreateFilterData, tenantId: TenantId): AsyncResult<Filter>;
  update(id: FilterId, data: UpdateFilterData, tenantId: TenantId): AsyncResult<Filter>;
  delete(id: FilterId, tenantId: TenantId): AsyncResult<void>;
}
`
  },
  'record': {
    entity: `import type { UUID } from "@odin/core-contracts";

export type RecordId = UUID;

export interface Record {
  readonly id: RecordId;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly objectType: string;
  readonly identifierAttribute: string;
  readonly sortOrder: number;
}

export interface CreateRecordData {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly objectType: string;
  readonly identifierAttribute: string;
}

export interface UpdateRecordData {
  readonly name?: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly identifierAttribute?: string;
}
`,
    repository: `import type { AsyncResult, TenantId, UUID } from "@odin/core-contracts";
import type { Record, RecordId, CreateRecordData, UpdateRecordData } from "../../entities/analytics/record";

export interface IRecordRepository {
  findById(id: RecordId, tenantId: TenantId): AsyncResult<Record | null>;
  findByKnowledgeModelId(knowledgeModelId: UUID, tenantId: TenantId): AsyncResult<readonly Record[]>;

  create(data: CreateRecordData, tenantId: TenantId): AsyncResult<Record>;
  update(id: RecordId, data: UpdateRecordData, tenantId: TenantId): AsyncResult<Record>;
  delete(id: RecordId, tenantId: TenantId): AsyncResult<void>;
}
`
  },
  'variable': {
    entity: `import type { UUID, ISODateTime } from "@odin/core-contracts";

export type VariableId = UUID;
export type VariableScopeType = 'knowledge_model' | 'view' | 'component';
export type VariableType = 'string' | 'number' | 'boolean' | 'date' | 'list';

export interface Variable {
  readonly id: VariableId;
  readonly scopeType: VariableScopeType;
  readonly scopeId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: VariableType;
  readonly defaultValue: unknown;
  readonly currentValue?: unknown;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateVariableData {
  readonly scopeType: VariableScopeType;
  readonly scopeId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: VariableType;
  readonly defaultValue: unknown;
}

export interface UpdateVariableData {
  readonly displayName?: string;
  readonly defaultValue?: unknown;
  readonly currentValue?: unknown;
}
`,
    repository: `import type { AsyncResult, TenantId, UUID } from "@odin/core-contracts";
import type { Variable, VariableId, CreateVariableData, UpdateVariableData, VariableScopeType } from "../../entities/analytics/variable";

export interface IVariableRepository {
  findById(id: VariableId, tenantId: TenantId): AsyncResult<Variable | null>;
  findByScope(scopeType: VariableScopeType, scopeId: UUID, tenantId: TenantId): AsyncResult<readonly Variable[]>;

  create(data: CreateVariableData, tenantId: TenantId): AsyncResult<Variable>;
  update(id: VariableId, data: UpdateVariableData, tenantId: TenantId): AsyncResult<Variable>;
  delete(id: VariableId, tenantId: TenantId): AsyncResult<void>;
}
`
  }
};

// ============================================================================
// STUDIO ENTITIES
// ============================================================================

const studioEntities = {
  'space': {
    entity: `import type { UUID, TenantId, UserId, ISODateTime } from "@odin/core-contracts";

export type SpaceId = UUID;
export type SpaceType = 'personal' | 'team' | 'public';

export interface Space {
  readonly id: SpaceId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly type: SpaceType;
  readonly ownerId: UserId;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateSpaceData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly type: SpaceType;
  readonly ownerId: UserId;
}

export interface UpdateSpaceData {
  readonly name?: string;
  readonly description?: string;
}
`,
    repository: `import type { AsyncResult, TenantId, UserId, PageRequest, PageResponse } from "@odin/core-contracts";
import type { Space, SpaceId, CreateSpaceData, UpdateSpaceData, SpaceType } from "../../entities/studio/space";

export interface ISpaceRepository {
  findById(id: SpaceId, tenantId: TenantId): AsyncResult<Space | null>;
  findByTenantId(tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Space>>;
  findByOwnerId(ownerId: UserId, tenantId: TenantId): AsyncResult<readonly Space[]>;
  findByType(type: SpaceType, tenantId: TenantId): AsyncResult<readonly Space[]>;

  create(data: CreateSpaceData): AsyncResult<Space>;
  update(id: SpaceId, data: UpdateSpaceData, tenantId: TenantId): AsyncResult<Space>;
  delete(id: SpaceId, tenantId: TenantId): AsyncResult<void>;
}
`
  },
  'package': {
    entity: `import type { UUID, TenantId, UserId, ISODateTime } from "@odin/core-contracts";

export type PackageId = UUID;
export type PackageStatus = 'draft' | 'published' | 'deprecated';

export interface Package {
  readonly id: PackageId;
  readonly tenantId: TenantId;
  readonly spaceId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly version: string;
  readonly status: PackageStatus;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly publishedAt?: ISODateTime;
  readonly createdBy: UserId;
}

export interface CreatePackageData {
  readonly tenantId: TenantId;
  readonly spaceId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly createdBy: UserId;
}

export interface UpdatePackageData {
  readonly name?: string;
  readonly description?: string;
  readonly status?: PackageStatus;
}
`,
    repository: `import type { AsyncResult, TenantId, UUID, PageRequest, PageResponse } from "@odin/core-contracts";
import type { Package, PackageId, CreatePackageData, UpdatePackageData, PackageStatus } from "../../entities/studio/package";

export interface IPackageRepository {
  findById(id: PackageId, tenantId: TenantId): AsyncResult<Package | null>;
  findByKey(key: string, tenantId: TenantId): AsyncResult<Package | null>;
  findBySpaceId(spaceId: UUID, tenantId: TenantId): AsyncResult<readonly Package[]>;
  findByStatus(status: PackageStatus, tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Package>>;

  create(data: CreatePackageData): AsyncResult<Package>;
  update(id: PackageId, data: UpdatePackageData, tenantId: TenantId): AsyncResult<Package>;
  delete(id: PackageId, tenantId: TenantId): AsyncResult<void>;
}
`
  },
  'view': {
    entity: `import type { UUID, TenantId, UserId, ISODateTime } from "@odin/core-contracts";

export type ViewId = UUID;
export type ViewType = 'dashboard' | 'report' | 'analysis';

export interface View {
  readonly id: ViewId;
  readonly tenantId: TenantId;
  readonly packageId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: ViewType;
  readonly layout: Record<string, unknown>;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

export interface CreateViewData {
  readonly tenantId: TenantId;
  readonly packageId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: ViewType;
  readonly layout?: Record<string, unknown>;
  readonly createdBy: UserId;
}

export interface UpdateViewData {
  readonly name?: string;
  readonly description?: string;
  readonly layout?: Record<string, unknown>;
}
`,
    repository: `import type { AsyncResult, TenantId, UUID, PageRequest, PageResponse } from "@odin/core-contracts";
import type { View, ViewId, CreateViewData, UpdateViewData, ViewType } from "../../entities/studio/view";

export interface IViewRepository {
  findById(id: ViewId, tenantId: TenantId): AsyncResult<View | null>;
  findByKey(key: string, tenantId: TenantId): AsyncResult<View | null>;
  findByPackageId(packageId: UUID, tenantId: TenantId): AsyncResult<readonly View[]>;
  findByType(type: ViewType, tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<View>>;

  create(data: CreateViewData): AsyncResult<View>;
  update(id: ViewId, data: UpdateViewData, tenantId: TenantId): AsyncResult<View>;
  delete(id: ViewId, tenantId: TenantId): AsyncResult<void>;
}
`
  },
  'component': {
    entity: `import type { UUID, ISODateTime } from "@odin/core-contracts";

export type ComponentId = UUID;
export type ComponentType = 'chart' | 'table' | 'kpi' | 'filter' | 'text';

export interface Component {
  readonly id: ComponentId;
  readonly viewId: UUID;
  readonly type: ComponentType;
  readonly config: Record<string, unknown>;
  readonly position: ComponentPosition;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface ComponentPosition {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface CreateComponentData {
  readonly viewId: UUID;
  readonly type: ComponentType;
  readonly config: Record<string, unknown>;
  readonly position: ComponentPosition;
}

export interface UpdateComponentData {
  readonly config?: Record<string, unknown>;
  readonly position?: ComponentPosition;
}
`,
    repository: `import type { AsyncResult, TenantId, UUID } from "@odin/core-contracts";
import type { Component, ComponentId, CreateComponentData, UpdateComponentData } from "../../entities/studio/component";

export interface IComponentRepository {
  findById(id: ComponentId, tenantId: TenantId): AsyncResult<Component | null>;
  findByViewId(viewId: UUID, tenantId: TenantId): AsyncResult<readonly Component[]>;

  create(data: CreateComponentData, tenantId: TenantId): AsyncResult<Component>;
  update(id: ComponentId, data: UpdateComponentData, tenantId: TenantId): AsyncResult<Component>;
  delete(id: ComponentId, tenantId: TenantId): AsyncResult<void>;
}
`
  }
};

// ============================================================================
// AUTOMATION ENTITIES
// ============================================================================

const automationEntities = {
  'action-flow': {
    entity: `import type { UUID, TenantId, UserId, ISODateTime } from "@odin/core-contracts";

export type ActionFlowId = UUID;
export type ActionFlowStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface ActionFlow {
  readonly id: ActionFlowId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly trigger: Record<string, unknown>;
  readonly actions: readonly Record<string, unknown>[];
  readonly status: ActionFlowStatus;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

export interface CreateActionFlowData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly trigger: Record<string, unknown>;
  readonly actions: readonly Record<string, unknown>[];
  readonly createdBy: UserId;
}

export interface UpdateActionFlowData {
  readonly name?: string;
  readonly description?: string;
  readonly trigger?: Record<string, unknown>;
  readonly actions?: readonly Record<string, unknown>[];
  readonly status?: ActionFlowStatus;
}
`,
    repository: `import type { AsyncResult, TenantId, PageRequest, PageResponse } from "@odin/core-contracts";
import type { ActionFlow, ActionFlowId, CreateActionFlowData, UpdateActionFlowData, ActionFlowStatus } from "../../entities/automation/action-flow";

export interface IActionFlowRepository {
  findById(id: ActionFlowId, tenantId: TenantId): AsyncResult<ActionFlow | null>;
  findByTenantId(tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<ActionFlow>>;
  findByStatus(status: ActionFlowStatus, tenantId: TenantId): AsyncResult<readonly ActionFlow[]>;

  create(data: CreateActionFlowData): AsyncResult<ActionFlow>;
  update(id: ActionFlowId, data: UpdateActionFlowData, tenantId: TenantId): AsyncResult<ActionFlow>;
  delete(id: ActionFlowId, tenantId: TenantId): AsyncResult<void>;
}
`
  },
  'execution': {
    entity: `import type { UUID, TenantId, ISODateTime } from "@odin/core-contracts";

export type ExecutionId = UUID;
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Execution {
  readonly id: ExecutionId;
  readonly tenantId: TenantId;
  readonly actionFlowId: UUID;
  readonly status: ExecutionStatus;
  readonly input: Record<string, unknown>;
  readonly output?: Record<string, unknown>;
  readonly error?: string;
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
}

export interface CreateExecutionData {
  readonly tenantId: TenantId;
  readonly actionFlowId: UUID;
  readonly input: Record<string, unknown>;
}

export interface UpdateExecutionData {
  readonly status?: ExecutionStatus;
  readonly output?: Record<string, unknown>;
  readonly error?: string;
  readonly completedAt?: ISODateTime;
}
`,
    repository: `import type { AsyncResult, TenantId, UUID, PageRequest, PageResponse } from "@odin/core-contracts";
import type { Execution, ExecutionId, CreateExecutionData, UpdateExecutionData, ExecutionStatus } from "../../entities/automation/execution";

export interface IExecutionRepository {
  findById(id: ExecutionId, tenantId: TenantId): AsyncResult<Execution | null>;
  findByActionFlowId(actionFlowId: UUID, tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Execution>>;
  findByStatus(status: ExecutionStatus, tenantId: TenantId): AsyncResult<readonly Execution[]>;

  create(data: CreateExecutionData): AsyncResult<Execution>;
  update(id: ExecutionId, data: UpdateExecutionData, tenantId: TenantId): AsyncResult<Execution>;
  delete(id: ExecutionId, tenantId: TenantId): AsyncResult<void>;
}
`
  },
  'skill': {
    entity: `import type { UUID, TenantId, UserId, ISODateTime } from "@odin/core-contracts";

export type SkillId = UUID;
export type SkillType = 'builtin' | 'custom';

export interface Skill {
  readonly id: SkillId;
  readonly tenantId: TenantId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: SkillType;
  readonly schema: Record<string, unknown>;
  readonly implementation: string;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

export interface CreateSkillData {
  readonly tenantId: TenantId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: SkillType;
  readonly schema: Record<string, unknown>;
  readonly implementation: string;
  readonly createdBy: UserId;
}

export interface UpdateSkillData {
  readonly name?: string;
  readonly description?: string;
  readonly schema?: Record<string, unknown>;
  readonly implementation?: string;
}
`,
    repository: `import type { AsyncResult, TenantId, PageRequest, PageResponse } from "@odin/core-contracts";
import type { Skill, SkillId, CreateSkillData, UpdateSkillData, SkillType } from "../../entities/automation/skill";

export interface ISkillRepository {
  findById(id: SkillId, tenantId: TenantId): AsyncResult<Skill | null>;
  findByKey(key: string, tenantId: TenantId): AsyncResult<Skill | null>;
  findByType(type: SkillType, tenantId: TenantId): AsyncResult<readonly Skill[]>;
  findByTenantId(tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Skill>>;

  create(data: CreateSkillData): AsyncResult<Skill>;
  update(id: SkillId, data: UpdateSkillData, tenantId: TenantId): AsyncResult<Skill>;
  delete(id: SkillId, tenantId: TenantId): AsyncResult<void>;
}
`
  },
  'sensor': {
    entity: `import type { UUID, TenantId, UserId, ISODateTime } from "@odin/core-contracts";

export type SensorId = UUID;
export type SensorType = 'schedule' | 'webhook' | 'event';

export interface Sensor {
  readonly id: SensorId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly type: SensorType;
  readonly config: Record<string, unknown>;
  readonly isActive: boolean;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

export interface CreateSensorData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly type: SensorType;
  readonly config: Record<string, unknown>;
  readonly createdBy: UserId;
}

export interface UpdateSensorData {
  readonly name?: string;
  readonly config?: Record<string, unknown>;
  readonly isActive?: boolean;
}
`,
    repository: `import type { AsyncResult, TenantId, PageRequest, PageResponse } from "@odin/core-contracts";
import type { Sensor, SensorId, CreateSensorData, UpdateSensorData, SensorType } from "../../entities/automation/sensor";

export interface ISensorRepository {
  findById(id: SensorId, tenantId: TenantId): AsyncResult<Sensor | null>;
  findByType(type: SensorType, tenantId: TenantId): AsyncResult<readonly Sensor[]>;
  findActive(tenantId: TenantId): AsyncResult<readonly Sensor[]>;
  findByTenantId(tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Sensor>>;

  create(data: CreateSensorData): AsyncResult<Sensor>;
  update(id: SensorId, data: UpdateSensorData, tenantId: TenantId): AsyncResult<Sensor>;
  delete(id: SensorId, tenantId: TenantId): AsyncResult<void>;
}
`
  },
  'signal': {
    entity: `import type { UUID, TenantId, ISODateTime } from "@odin/core-contracts";

export type SignalId = UUID;
export type SignalStatus = 'pending' | 'processed' | 'failed';

export interface Signal {
  readonly id: SignalId;
  readonly tenantId: TenantId;
  readonly sensorId: UUID;
  readonly payload: Record<string, unknown>;
  readonly status: SignalStatus;
  readonly processedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

export interface CreateSignalData {
  readonly tenantId: TenantId;
  readonly sensorId: UUID;
  readonly payload: Record<string, unknown>;
}

export interface UpdateSignalData {
  readonly status?: SignalStatus;
  readonly processedAt?: ISODateTime;
}
`,
    repository: `import type { AsyncResult, TenantId, UUID, PageRequest, PageResponse } from "@odin/core-contracts";
import type { Signal, SignalId, CreateSignalData, UpdateSignalData, SignalStatus } from "../../entities/automation/signal";

export interface ISignalRepository {
  findById(id: SignalId, tenantId: TenantId): AsyncResult<Signal | null>;
  findBySensorId(sensorId: UUID, tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Signal>>;
  findByStatus(status: SignalStatus, tenantId: TenantId): AsyncResult<readonly Signal[]>;

  create(data: CreateSignalData): AsyncResult<Signal>;
  update(id: SignalId, data: UpdateSignalData, tenantId: TenantId): AsyncResult<Signal>;
  delete(id: SignalId, tenantId: TenantId): AsyncResult<void>;
}
`
  },
  'task': {
    entity: `import type { UUID, TenantId, UserId, ISODateTime } from "@odin/core-contracts";

export type TaskId = UUID;
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  readonly id: TaskId;
  readonly tenantId: TenantId;
  readonly executionId: UUID;
  readonly name: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly assignedTo?: UserId;
  readonly dueAt?: ISODateTime;
  readonly startedAt?: ISODateTime;
  readonly completedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateTaskData {
  readonly tenantId: TenantId;
  readonly executionId: UUID;
  readonly name: string;
  readonly priority: TaskPriority;
  readonly assignedTo?: UserId;
  readonly dueAt?: ISODateTime;
}

export interface UpdateTaskData {
  readonly status?: TaskStatus;
  readonly assignedTo?: UserId;
  readonly dueAt?: ISODateTime;
  readonly startedAt?: ISODateTime;
  readonly completedAt?: ISODateTime;
}
`,
    repository: `import type { AsyncResult, TenantId, UUID, UserId, PageRequest, PageResponse } from "@odin/core-contracts";
import type { Task, TaskId, CreateTaskData, UpdateTaskData, TaskStatus, TaskPriority } from "../../entities/automation/task";

export interface ITaskRepository {
  findById(id: TaskId, tenantId: TenantId): AsyncResult<Task | null>;
  findByExecutionId(executionId: UUID, tenantId: TenantId): AsyncResult<readonly Task[]>;
  findByAssignee(assignedTo: UserId, tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Task>>;
  findByStatus(status: TaskStatus, tenantId: TenantId): AsyncResult<readonly Task[]>;
  findByPriority(priority: TaskPriority, tenantId: TenantId): AsyncResult<readonly Task[]>;

  create(data: CreateTaskData): AsyncResult<Task>;
  update(id: TaskId, data: UpdateTaskData, tenantId: TenantId): AsyncResult<Task>;
  delete(id: TaskId, tenantId: TenantId): AsyncResult<void>;
}
`
  }
};

// ============================================================================
// GENERATION LOGIC
// ============================================================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateLayer(layerName, entities, basePath) {
  console.log(`\n📦 Generating ${layerName} layer...`);

  const entitiesDir = path.join(basePath, 'entities', layerName);
  const repositoriesDir = path.join(basePath, 'repositories', layerName);

  ensureDir(entitiesDir);
  ensureDir(repositoriesDir);

  const entityExports = [];
  const repositoryExports = [];

  for (const [name, specs] of Object.entries(entities)) {
    // Generate entity file
    const entityFile = path.join(entitiesDir, `${name}.ts`);
    fs.writeFileSync(entityFile, specs.entity);
    console.log(`  ✓ ${name}.ts (entity)`);
    entityExports.push(`export * from './${name}';`);

    // Generate repository file
    const repoFile = path.join(repositoriesDir, `${name}-repository.ts`);
    fs.writeFileSync(repoFile, specs.repository);
    console.log(`  ✓ ${name}-repository.ts`);
    repositoryExports.push(`export * from './${name}-repository';`);
  }

  // Generate index files
  fs.writeFileSync(
    path.join(entitiesDir, 'index.ts'),
    entityExports.join('\n') + '\n'
  );

  fs.writeFileSync(
    path.join(repositoriesDir, 'index.ts'),
    repositoryExports.join('\n') + '\n'
  );

  console.log(`  ✓ index.ts files generated`);
}

// ============================================================================
// MAIN
// ============================================================================

const basePath = path.join(__dirname, '..');

console.log('🚀 Generating missing domain entities and repositories...\n');

generateLayer('analytics', analyticsEntities, basePath);
generateLayer('studio', studioEntities, basePath);
generateLayer('automation', automationEntities, basePath);

// Update main entity index
const entityIndexPath = path.join(basePath, 'entities', 'index.ts');
const currentEntityIndex = fs.readFileSync(entityIndexPath, 'utf-8');

if (!currentEntityIndex.includes('export * from \'./analytics\'')) {
  const updatedIndex = currentEntityIndex + `
// ============================================================================
// Analytics Layer
// ============================================================================

export * from './analytics';

// ============================================================================
// Studio Layer
// ============================================================================

export * from './studio';

// ============================================================================
// Automation Layer
// ============================================================================

export * from './automation';
`;
  fs.writeFileSync(entityIndexPath, updatedIndex);
  console.log('\n✓ Updated main entities/index.ts');
}

// Update main repository index
const repoIndexPath = path.join(basePath, 'repositories', 'index.ts');
const currentRepoIndex = fs.readFileSync(repoIndexPath, 'utf-8');

if (!currentRepoIndex.includes('export * from \'./analytics\'')) {
  const updatedRepoIndex = currentRepoIndex + `
// ============================================================================
// Analytics Layer
// ============================================================================

export * from './analytics';

// ============================================================================
// Studio Layer
// ============================================================================

export * from './studio';

// ============================================================================
// Automation Layer
// ============================================================================

export * from './automation';
`;
  fs.writeFileSync(repoIndexPath, updatedRepoIndex);
  console.log('✓ Updated main repositories/index.ts');
}

console.log('\n✅ Generation complete!');
console.log('\nGenerated:');
console.log('  • 5 Analytics entities + repositories');
console.log('  • 4 Studio entities + repositories');
console.log('  • 6 Automation entities + repositories');
console.log('  • Total: 15 entities + 15 repositories = 30 files\n');
