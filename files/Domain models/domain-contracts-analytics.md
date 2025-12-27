# L1 DOMAIN CONTRACTS — ANALYTICS, STUDIO & AUTOMATION - implemented

> Knowledge models, views, dashboards, and workflows

---

## KNOWLEDGE MODEL SUBLAYER

### Entity: KnowledgeModel

```typescript
/**
 * Semantic layer on top of data models.
 * Provides business-friendly abstractions for analytics.
 */
interface KnowledgeModel {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly packageId: PackageId;
  readonly dataModelId: DataModelId;
  readonly key: string; // Unique identifier
  readonly name: string;
  readonly description?: string;
  readonly type: KnowledgeModelType;
  readonly baseKnowledgeModelId?: UUID; // For extensions
  readonly status: PublishStatus;
  readonly version: PositiveInt;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly publishedAt?: ISODateTime;
  readonly createdBy: UserId;
}

type KnowledgeModelType = "base" | "extension";

interface FullKnowledgeModel extends KnowledgeModel {
  readonly kpis: readonly KPI[];
  readonly records: readonly Record[];
  readonly filters: readonly Filter[];
  readonly variables: readonly Variable[];
  readonly eventLogs: readonly EventLogConfig[];
}
```

### Repository: IKnowledgeModelRepository

```typescript
interface IKnowledgeModelRepository {
  findById(id: UUID): AsyncResult<KnowledgeModel | null>;
  findByKey(key: string): AsyncResult<KnowledgeModel | null>;
  findByPackageId(packageId: PackageId): AsyncResult<readonly KnowledgeModel[]>;
  findByDataModelId(
    dataModelId: DataModelId
  ): AsyncResult<readonly KnowledgeModel[]>;
  findExtensions(baseId: UUID): AsyncResult<readonly KnowledgeModel[]>;

  create(data: CreateKnowledgeModelData): AsyncResult<KnowledgeModel>;
  update(id: UUID, data: UpdateKnowledgeModelData): AsyncResult<KnowledgeModel>;
  delete(id: UUID): AsyncResult<void>;

  publish(id: UUID): AsyncResult<KnowledgeModel>;
  unpublish(id: UUID): AsyncResult<KnowledgeModel>;
  deprecate(id: UUID): AsyncResult<KnowledgeModel>;

  getFullModel(id: UUID): AsyncResult<FullKnowledgeModel>;
  getMergedModel(id: UUID): AsyncResult<FullKnowledgeModel>; // With base model
}
```

---

### Entity: KPI

```typescript
/**
 * Key Performance Indicator - computed metric.
 * Uses PM4Py-compatible expressions instead of PQL.
 */
interface KPI {
  readonly id: UUID;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly category?: string;
  readonly expression: KPIExpression;
  readonly format: KPIFormat;
  readonly thresholds?: KPIThresholds;
  readonly isGlobal: boolean;
  readonly sortOrder: number;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

interface KPIExpression {
  readonly type: KPIExpressionType;
  readonly config: KPIExpressionConfig;
}

type KPIExpressionType =
  | "aggregate" // Simple aggregation
  | "time_metric" // Throughput, waiting time, etc.
  | "conformance" // Fitness, precision
  | "custom_python" // PM4Py custom expression
  | "ratio"; // Calculated ratio

interface KPIExpressionConfig {
  // For aggregate
  readonly aggregation?: AggregationType;
  readonly field?: string;
  readonly objectType?: string;

  // For time_metric
  readonly timeMetric?: TimeMetricType;
  readonly startActivity?: string;
  readonly endActivity?: string;
  readonly unit?: TimeUnit;

  // For conformance
  readonly processModelId?: ProcessModelId;
  readonly conformanceMethod?: ConformanceMethod;
  readonly metric?: MetricType;

  // For ratio
  readonly numerator?: string; // KPI reference
  readonly denominator?: string;

  // For custom
  readonly pythonExpression?: string;
}

type TimeMetricType =
  | "throughput_time"
  | "waiting_time"
  | "processing_time"
  | "lead_time"
  | "cycle_time"
  | "service_time";

type TimeUnit = "seconds" | "minutes" | "hours" | "days" | "weeks";

interface KPIFormat {
  readonly type: FormatType;
  readonly decimals?: number;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly locale?: string;
}

type FormatType = "number" | "percentage" | "currency" | "duration" | "date";

interface KPIThresholds {
  readonly warning?: number;
  readonly critical?: number;
  readonly target?: number;
  readonly direction: "higher_is_better" | "lower_is_better";
}
```

---

### Entity: Record

```typescript
/**
 * Business entity abstraction over data model objects.
 */
interface Record {
  readonly id: UUID;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly objectType: string; // OCEL object type reference
  readonly identifierAttribute: string;
  readonly attributes: readonly RecordAttribute[];
  readonly sortOrder: number;
}

interface RecordAttribute {
  readonly id: UUID;
  readonly recordId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly sourceType: AttributeSourceType;
  readonly source: AttributeSource;
  readonly dataType: DataType;
  readonly format?: string;
  readonly isSearchable: boolean;
  readonly isFilterable: boolean;
  readonly sortOrder: number;
}

type AttributeSourceType = "column" | "computed" | "augmented";

type AttributeSource =
  | { type: "column"; columnName: string }
  | { type: "computed"; expression: string }
  | { type: "augmented"; augmentedAttributeId: UUID };
```

---

### Entity: Filter & Variable

```typescript
interface Filter {
  readonly id: UUID;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly type: FilterType;
  readonly config: FilterConfig;
  readonly isGlobal: boolean;
  readonly isDefault: boolean;
}

type FilterType =
  | "attribute"
  | "time_range"
  | "variant"
  | "activity"
  | "object_type"
  | "custom";

interface FilterConfig {
  readonly objectType?: string;
  readonly field?: string;
  readonly operator?: FilterOperator;
  readonly value?: unknown;
  readonly values?: readonly unknown[];
  readonly dateField?: string;
  readonly activities?: readonly string[];
  readonly variantIds?: readonly string[];
  readonly pythonFilter?: string;
}

interface Variable {
  readonly id: UUID;
  readonly scopeType: VariableScopeType;
  readonly scopeId: UUID; // KnowledgeModel or View ID
  readonly name: string;
  readonly displayName?: string;
  readonly type: VariableType;
  readonly defaultValue: unknown;
  readonly currentValue?: unknown;
  readonly validation?: VariableValidation;
}

type VariableScopeType = "knowledge_model" | "view";

type VariableType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "date_range"
  | "selection"
  | "multi_selection";

interface VariableValidation {
  readonly required?: boolean;
  readonly options?: readonly VariableOption[];
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: string;
}

interface VariableOption {
  readonly value: unknown;
  readonly label: string;
}
```

---

### Entity: EventLogConfig

```typescript
/**
 * Configuration for extracting event logs for process mining.
 */
interface EventLogConfig {
  readonly id: UUID;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly description?: string;
  readonly type: EventLogType;
  readonly config: EventLogConfigDetails;
  readonly isDefault: boolean;
}

type EventLogType = "case_centric" | "object_centric";

interface EventLogConfigDetails {
  // Case-centric
  readonly caseDefinition?: CaseDefinition;

  // Object-centric (OCEL)
  readonly objectTypes?: readonly string[];
  readonly eventFilter?: FilterConfig;

  // Common
  readonly activityMapping?: ActivityMapping;
  readonly timestampConfig?: TimestampConfig;
  readonly attributeInclusion?: readonly string[];
}

interface CaseDefinition {
  readonly objectType: string;
  readonly caseIdAttribute: string;
}

interface ActivityMapping {
  readonly sourceAttribute: string;
  readonly mapping?: Record<string, string>; // Original -> Display name
}

interface TimestampConfig {
  readonly primaryTimestamp: string;
  readonly sortingAttribute?: string;
  readonly timezone?: string;
}
```

---

## STUDIO SUBLAYER

### Entity: Space

```typescript
interface Space {
  readonly id: SpaceId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly visibility: SpaceVisibility;
  readonly settings: SpaceSettings;
  readonly memberCount: number;
  readonly packageCount: number;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

type SpaceVisibility = "private" | "team" | "organization" | "public";

interface SpaceSettings {
  readonly defaultPermissions: readonly Permission[];
  readonly allowPublicPackages: boolean;
  readonly dataPoolRestrictions?: readonly DataPoolId[];
}

interface SpaceMembership {
  readonly spaceId: SpaceId;
  readonly userId: UserId;
  readonly role: SpaceRole;
  readonly joinedAt: ISODateTime;
}

type SpaceRole = "viewer" | "editor" | "admin" | "owner";
```

---

### Entity: Package

```typescript
interface Package {
  readonly id: PackageId;
  readonly tenantId: TenantId;
  readonly spaceId: SpaceId;
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly version: string;
  readonly status: PublishStatus;
  readonly settings: PackageSettings;
  readonly statistics: PackageStatistics;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly publishedAt?: ISODateTime;
  readonly createdBy: UserId;
}

interface PackageSettings {
  readonly defaultKnowledgeModelId?: UUID;
  readonly defaultViewId?: UUID;
  readonly sharingEnabled: boolean;
  readonly exportEnabled: boolean;
}

interface PackageStatistics {
  readonly viewCount: number;
  readonly knowledgeModelCount: number;
  readonly actionFlowCount: number;
  readonly skillCount: number;
}

interface PackageExport {
  readonly version: string;
  readonly exportedAt: ISODateTime;
  readonly package: Package;
  readonly knowledgeModels: readonly FullKnowledgeModel[];
  readonly views: readonly FullView[];
  readonly actionFlows: readonly ActionFlow[];
  readonly checksum: string;
}
```

---

### Entity: View

```typescript
interface View {
  readonly id: ViewId;
  readonly packageId: PackageId;
  readonly knowledgeModelId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: ViewType;
  readonly layout: ViewLayout;
  readonly settings: ViewSettings;
  readonly status: PublishStatus;
  readonly baseViewId?: UUID;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

type ViewType = "analysis" | "profile" | "dashboard" | "report";

interface ViewLayout {
  readonly type: LayoutType;
  readonly gridColumns: number;
  readonly height?: number;
  readonly responsive: boolean;
}

type LayoutType = "grid" | "freeform" | "flow";

interface ViewSettings {
  readonly refreshInterval?: Duration;
  readonly defaultFilters?: readonly UUID[];
  readonly allowExport: boolean;
  readonly showFilters: boolean;
  readonly embedEnabled: boolean;
}

interface FullView extends View {
  readonly tabs: readonly Tab[];
  readonly components: readonly Component[];
  readonly variables: readonly Variable[];
}
```

---

### Entity: Component

```typescript
interface Component {
  readonly id: UUID;
  readonly viewId: ViewId;
  readonly tabId?: UUID;
  readonly type: ComponentType;
  readonly name?: string;
  readonly position: ComponentPosition;
  readonly config: ComponentConfig;
  readonly dataBinding?: DataBinding;
  readonly interactivity?: InteractivityConfig;
  readonly visibility?: VisibilityRule;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

type ComponentType =
  // Charts
  | "bar_chart"
  | "line_chart"
  | "pie_chart"
  | "area_chart"
  | "scatter_chart"
  | "histogram"
  | "heatmap"
  | "funnel"
  // Tables
  | "data_table"
  | "pivot_table"
  | "kpi_table"
  // Process Mining Specific
  | "process_explorer"
  | "variant_explorer"
  | "case_explorer"
  | "dfg_view"
  | "bpmn_view"
  | "conformance_view"
  | "dotted_chart"
  | "performance_spectrum"
  // KPIs
  | "kpi_card"
  | "kpi_list"
  | "gauge"
  | "sparkline"
  // Controls
  | "filter_bar"
  | "dropdown"
  | "date_picker"
  | "text_input"
  | "button"
  | "slider"
  | "toggle"
  // Layout
  | "container"
  | "tab_container"
  | "accordion"
  | "card"
  // Content
  | "text"
  | "image"
  | "markdown"
  | "iframe";

interface ComponentPosition {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly zIndex?: number;
}

interface ComponentConfig {
  readonly title?: string;
  readonly subtitle?: string;
  readonly style?: StyleConfig;
  readonly chartConfig?: ChartConfig;
  readonly tableConfig?: TableConfig;
  readonly processConfig?: ProcessConfig;
  readonly customConfig?: Record<string, unknown>;
}

interface DataBinding {
  readonly type: BindingType;
  readonly kpis?: readonly string[];
  readonly recordId?: UUID;
  readonly attributes?: readonly string[];
  readonly filters?: readonly UUID[];
  readonly groupBy?: readonly string[];
  readonly sortBy?: readonly SortConfig[];
  readonly limit?: number;
}

type BindingType = "kpi" | "record" | "event_log" | "process_model" | "static";

interface InteractivityConfig {
  readonly clickAction?: ClickAction;
  readonly hoverAction?: HoverAction;
  readonly selectionMode?: SelectionMode;
  readonly drilldownEnabled?: boolean;
  readonly linkedComponentIds?: readonly UUID[];
}

type ClickAction =
  | { type: "navigate"; viewId: ViewId; params?: Record<string, string> }
  | { type: "filter"; filterId: UUID }
  | { type: "drill_down"; dimension: string }
  | { type: "trigger_action_flow"; actionFlowId: ActionFlowId };

type SelectionMode = "single" | "multiple" | "range";
```

---

### Entity: Tab

```typescript
interface Tab {
  readonly id: UUID;
  readonly viewId: ViewId;
  readonly name: string;
  readonly icon?: string;
  readonly position: number;
  readonly visibility?: VisibilityRule;
}

interface VisibilityRule {
  readonly type: "always" | "conditional" | "permission";
  readonly condition?: string;
  readonly permissionRequired?: string;
}
```

---

## AUTOMATION SUBLAYER

### Entity: ActionFlow

```typescript
interface ActionFlow {
  readonly id: ActionFlowId;
  readonly tenantId: TenantId;
  readonly packageId: PackageId;
  readonly name: string;
  readonly description?: string;
  readonly status: ActionFlowStatus;
  readonly trigger: ActionFlowTrigger;
  readonly modules: readonly Module[];
  readonly inputs: readonly ActionFlowInput[];
  readonly outputs: readonly ActionFlowOutput[];
  readonly errorHandling: ErrorHandlingConfig;
  readonly scheduling?: ScheduleConfig;
  readonly statistics: ActionFlowStatistics;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly activatedAt?: ISODateTime;
  readonly createdBy: UserId;
}

type ActionFlowStatus = "draft" | "active" | "paused" | "disabled" | "error";

interface ActionFlowTrigger {
  readonly type: TriggerType;
  readonly config: TriggerConfig;
}

type TriggerType = "manual" | "scheduled" | "event" | "sensor" | "webhook";

type TriggerConfig =
  | { type: "manual" }
  | { type: "scheduled"; schedule: JobSchedule }
  | { type: "event"; eventTypes: readonly string[] }
  | { type: "sensor"; sensorId: UUID }
  | { type: "webhook"; secret: string };

interface ActionFlowInput {
  readonly name: string;
  readonly type: DataType;
  readonly required: boolean;
  readonly defaultValue?: unknown;
  readonly validation?: VariableValidation;
}

interface ActionFlowOutput {
  readonly name: string;
  readonly type: DataType;
  readonly source: string; // Module output reference
}

interface ErrorHandlingConfig {
  readonly maxRetries: number;
  readonly retryDelay: Duration;
  readonly consecutiveErrorsLimit: number;
  readonly errorNotification?: UUID; // Notification template
  readonly fallbackActionFlowId?: ActionFlowId;
}

interface ScheduleConfig extends JobSchedule {
  readonly inputOverrides?: Record<string, unknown>;
}

interface ActionFlowStatistics {
  readonly totalExecutions: number;
  readonly successfulExecutions: number;
  readonly failedExecutions: number;
  readonly avgDuration: Duration;
  readonly lastExecutionAt?: ISODateTime;
  readonly lastExecutionStatus?: ExecutionStatus;
}
```

---

### Entity: Module

```typescript
interface Module {
  readonly id: UUID;
  readonly actionFlowId: ActionFlowId;
  readonly type: ModuleType;
  readonly name: string;
  readonly description?: string;
  readonly position: number;
  readonly config: ModuleConfig;
  readonly inputMappings: readonly InputMapping[];
  readonly outputMappings: readonly OutputMapping[];
  readonly errorHandling?: ModuleErrorHandling;
  readonly condition?: ModuleCondition;
}

type ModuleType =
  // Data Operations
  | "query_data"
  | "filter_data"
  | "transform_data"
  | "aggregate_data"
  // Process Mining
  | "discover_process"
  | "check_conformance"
  | "calculate_kpi"
  // Integration
  | "http_request"
  | "send_email"
  | "send_slack"
  | "webhook_call"
  // Control Flow
  | "condition"
  | "loop"
  | "parallel"
  | "delay"
  | "error"
  // Task Management
  | "create_task"
  | "update_task"
  | "assign_task"
  // Custom
  | "python_script"
  | "javascript";

interface ModuleConfig {
  readonly [key: string]: unknown;
}

interface InputMapping {
  readonly parameterName: string;
  readonly source: MappingSource;
}

interface OutputMapping {
  readonly outputName: string;
  readonly variableName: string;
}

type MappingSource =
  | { type: "input"; inputName: string }
  | { type: "module_output"; moduleId: UUID; outputName: string }
  | { type: "variable"; variableName: string }
  | { type: "literal"; value: unknown }
  | { type: "expression"; expression: string };

interface ModuleErrorHandling {
  readonly onError: "fail" | "continue" | "retry";
  readonly maxRetries?: number;
  readonly fallbackValue?: unknown;
}

interface ModuleCondition {
  readonly expression: string;
  readonly skipOnFalse: boolean;
}
```

---

### Entity: Execution

```typescript
interface Execution {
  readonly id: UUID;
  readonly actionFlowId: ActionFlowId;
  readonly status: ExecutionStatus;
  readonly trigger: ExecutionTrigger;
  readonly inputs: Record<string, unknown>;
  readonly outputs?: Record<string, unknown>;
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
  readonly duration?: Duration;
  readonly steps: readonly ExecutionStep[];
  readonly error?: ExecutionError;
  readonly triggeredBy?: UserId;
}

interface ExecutionTrigger {
  readonly type: TriggerType;
  readonly source?: string;
  readonly eventId?: UUID;
  readonly signalId?: UUID;
}

interface ExecutionStep {
  readonly moduleId: UUID;
  readonly moduleName: string;
  readonly status: ExecutionStatus;
  readonly startedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
  readonly duration?: Duration;
  readonly inputs: Record<string, unknown>;
  readonly outputs?: Record<string, unknown>;
  readonly error?: ExecutionError;
  readonly retryCount: number;
}

interface ExecutionError {
  readonly code: string;
  readonly message: string;
  readonly moduleId?: UUID;
  readonly stackTrace?: string;
  readonly retryable: boolean;
}
```

---

### Entity: Skill & Sensor

```typescript
interface Skill {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly packageId: PackageId;
  readonly name: string;
  readonly description?: string;
  readonly status: EntityStatus;
  readonly sensor: Sensor;
  readonly actions: readonly SkillAction[];
  readonly settings: SkillSettings;
  readonly statistics: SkillStatistics;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

interface Sensor {
  readonly id: UUID;
  readonly skillId: UUID;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly type: SensorType;
  readonly config: SensorConfig;
  readonly evaluationSchedule: JobSchedule;
  readonly lastEvaluatedAt?: ISODateTime;
}

type SensorType = "threshold" | "anomaly" | "pattern" | "deadline" | "custom";

interface SensorConfig {
  readonly objectType?: string;
  readonly filter?: FilterConfig;
  readonly threshold?: ThresholdConfig;
  readonly anomalyConfig?: AnomalyConfig;
  readonly patternConfig?: PatternConfig;
  readonly deadlineConfig?: DeadlineConfig;
  readonly customExpression?: string;
}

interface ThresholdConfig {
  readonly kpiId: UUID;
  readonly operator: "gt" | "gte" | "lt" | "lte" | "eq" | "neq";
  readonly value: number;
  readonly duration?: Duration; // Sustained threshold
}

interface AnomalyConfig {
  readonly kpiId: UUID;
  readonly method: "zscore" | "iqr" | "isolation_forest";
  readonly sensitivity: number;
}

interface PatternConfig {
  readonly activities: readonly string[];
  readonly sequence: boolean;
  readonly within?: Duration;
}

interface DeadlineConfig {
  readonly startActivity: string;
  readonly endActivity: string;
  readonly maxDuration: Duration;
  readonly warningThreshold?: Percentage;
}

interface SkillAction {
  readonly id: UUID;
  readonly skillId: UUID;
  readonly type: SkillActionType;
  readonly config: SkillActionConfig;
  readonly order: number;
}

type SkillActionType =
  | "create_task"
  | "send_notification"
  | "trigger_action_flow"
  | "call_webhook"
  | "update_attribute";

interface SkillActionConfig {
  readonly [key: string]: unknown;
}

interface SkillSettings {
  readonly autoResolve: boolean;
  readonly resolutionCriteria?: FilterConfig;
  readonly cooldownPeriod?: Duration;
  readonly maxOpenSignals?: number;
}

interface SkillStatistics {
  readonly totalSignals: number;
  readonly openSignals: number;
  readonly resolvedSignals: number;
  readonly avgResolutionTime?: Duration;
  readonly lastSignalAt?: ISODateTime;
}
```

---

### Entity: Signal & Task

```typescript
interface Signal {
  readonly id: UUID;
  readonly sensorId: UUID;
  readonly skillId: UUID;
  readonly tenantId: TenantId;
  readonly status: SignalStatus;
  readonly severity: SignalSeverity;
  readonly affectedObjects: readonly AffectedObject[];
  readonly context: SignalContext;
  readonly actionsExecuted: readonly ExecutedAction[];
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly resolvedAt?: ISODateTime;
  readonly resolvedBy?: UserId;
  readonly resolutionNote?: string;
}

type SignalStatus =
  | "open"
  | "acknowledged"
  | "in_progress"
  | "snoozed"
  | "resolved";
type SignalSeverity = "low" | "medium" | "high" | "critical";

interface AffectedObject {
  readonly objectType: string;
  readonly objectId: ObjectId;
  readonly attributes?: Record<string, unknown>;
}

interface SignalContext {
  readonly triggerValue?: unknown;
  readonly thresholdValue?: unknown;
  readonly kpiName?: string;
  readonly patternMatched?: readonly string[];
  readonly additionalData?: Record<string, unknown>;
}

interface ExecutedAction {
  readonly actionId: UUID;
  readonly type: SkillActionType;
  readonly status: ExecutionStatus;
  readonly executedAt: ISODateTime;
  readonly result?: Record<string, unknown>;
  readonly error?: string;
}

interface Task {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly signalId?: UUID;
  readonly taskTypeId: UUID;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly assigneeId?: UserId;
  readonly dueDate?: ISODateTime;
  readonly context: TaskContext;
  readonly comments: readonly TaskComment[];
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly completedAt?: ISODateTime;
  readonly createdBy: UserId;
}

type TaskStatus =
  | "open"
  | "in_progress"
  | "blocked"
  | "completed"
  | "cancelled";
type TaskPriority = "low" | "normal" | "high" | "urgent";

interface TaskContext {
  readonly objectType?: string;
  readonly objectIds?: readonly ObjectId[];
  readonly viewId?: ViewId;
  readonly customFields?: Record<string, unknown>;
}

interface TaskComment {
  readonly id: UUID;
  readonly taskId: UUID;
  readonly content: string;
  readonly authorId: UserId;
  readonly createdAt: ISODateTime;
  readonly updatedAt?: ISODateTime;
}

interface TaskType {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly defaultPriority: TaskPriority;
  readonly customFields: readonly TaskCustomField[];
  readonly workflow?: TaskWorkflow;
  readonly createdAt: ISODateTime;
}

interface TaskCustomField {
  readonly name: string;
  readonly type: DataType;
  readonly required: boolean;
  readonly options?: readonly string[];
}

interface TaskWorkflow {
  readonly statuses: readonly string[];
  readonly transitions: readonly WorkflowTransition[];
}

interface WorkflowTransition {
  readonly from: string;
  readonly to: string;
  readonly condition?: string;
}
```
