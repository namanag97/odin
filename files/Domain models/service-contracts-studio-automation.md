# L2 SERVICE CONTRACTS — STUDIO & AUTOMATION
> Knowledge models, views, action flows, and skills

---

## KNOWLEDGE MODEL SERVICE

```typescript
interface IKnowledgeModelService extends IService {
  // Queries
  getKnowledgeModel(id: UUID, ctx: OperationContext): AsyncResult<KnowledgeModel>;
  getKnowledgeModelByKey(key: string, ctx: OperationContext): AsyncResult<KnowledgeModel>;
  getFullKnowledgeModel(id: UUID, ctx: OperationContext): AsyncResult<FullKnowledgeModel>;
  listKnowledgeModels(input: ListKMInput, ctx: OperationContext): AsyncResult<PaginatedResult<KnowledgeModel>>;
  
  // Commands
  createKnowledgeModel(input: CreateKMInput, ctx: OperationContext): AsyncResult<KnowledgeModel>;
  createExtension(input: CreateExtensionInput, ctx: OperationContext): AsyncResult<KnowledgeModel>;
  updateKnowledgeModel(input: UpdateKMInput, ctx: OperationContext): AsyncResult<KnowledgeModel>;
  deleteKnowledgeModel(id: UUID, ctx: OperationContext): AsyncResult<void>;
  
  // Publishing
  publishKnowledgeModel(id: UUID, ctx: OperationContext): AsyncResult<KnowledgeModel>;
  deprecateKnowledgeModel(id: UUID, ctx: OperationContext): AsyncResult<KnowledgeModel>;
  
  // KPIs
  createKPI(input: CreateKPIInput, ctx: OperationContext): AsyncResult<KPI>;
  updateKPI(input: UpdateKPIInput, ctx: OperationContext): AsyncResult<KPI>;
  deleteKPI(id: UUID, ctx: OperationContext): AsyncResult<void>;
  evaluateKPI(input: EvaluateKPIInput, ctx: OperationContext): AsyncResult<KPIValue>;
  evaluateMultipleKPIs(input: EvaluateMultipleKPIsInput, ctx: OperationContext): AsyncResult<readonly KPIValue[]>;
  
  // Records
  createRecord(input: CreateRecordInput, ctx: OperationContext): AsyncResult<Record>;
  updateRecord(input: UpdateRecordInput, ctx: OperationContext): AsyncResult<Record>;
  deleteRecord(id: UUID, ctx: OperationContext): AsyncResult<void>;
  addRecordAttribute(input: AddAttributeInput, ctx: OperationContext): AsyncResult<RecordAttribute>;
  updateRecordAttribute(input: UpdateAttributeInput, ctx: OperationContext): AsyncResult<RecordAttribute>;
  deleteRecordAttribute(id: UUID, ctx: OperationContext): AsyncResult<void>;
  queryRecordData(input: QueryRecordInput, ctx: OperationContext): AsyncResult<RecordDataResult>;
  
  // Filters
  createFilter(input: CreateFilterInput, ctx: OperationContext): AsyncResult<Filter>;
  updateFilter(input: UpdateFilterInput, ctx: OperationContext): AsyncResult<Filter>;
  deleteFilter(id: UUID, ctx: OperationContext): AsyncResult<void>;
  
  // Variables
  createVariable(input: CreateVariableInput, ctx: OperationContext): AsyncResult<Variable>;
  updateVariable(input: UpdateVariableInput, ctx: OperationContext): AsyncResult<Variable>;
  deleteVariable(id: UUID, ctx: OperationContext): AsyncResult<void>;
  setVariableValue(input: SetVariableValueInput, ctx: OperationContext): AsyncResult<Variable>;
  
  // Event Logs
  createEventLogConfig(input: CreateEventLogConfigInput, ctx: OperationContext): AsyncResult<EventLogConfig>;
  updateEventLogConfig(input: UpdateEventLogConfigInput, ctx: OperationContext): AsyncResult<EventLogConfig>;
  deleteEventLogConfig(id: UUID, ctx: OperationContext): AsyncResult<void>;
  
  // Validation
  validateKnowledgeModel(id: UUID, ctx: OperationContext): AsyncResult<KMValidation>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CreateKMInput {
  readonly packageId: PackageId;
  readonly dataModelId: DataModelId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
}

interface CreateExtensionInput {
  readonly packageId: PackageId;
  readonly baseKnowledgeModelId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
}

interface UpdateKMInput {
  readonly id: UUID;
  readonly name?: string;
  readonly description?: string;
}

interface ListKMInput {
  readonly packageId?: PackageId;
  readonly dataModelId?: DataModelId;
  readonly status?: PublishStatus;
  readonly search?: string;
  readonly pagination?: Pagination;
}

interface CreateKPIInput {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly category?: string;
  readonly expression: KPIExpression;
  readonly format: KPIFormat;
  readonly thresholds?: KPIThresholds;
  readonly isGlobal?: boolean;
}

interface UpdateKPIInput {
  readonly id: UUID;
  readonly name?: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly expression?: KPIExpression;
  readonly format?: KPIFormat;
  readonly thresholds?: KPIThresholds;
}

interface EvaluateKPIInput {
  readonly kpiId: UUID;
  readonly filters?: readonly UUID[];        // Filter IDs to apply
  readonly variables?: Record<string, unknown>;
}

interface KPIValue {
  readonly kpiId: UUID;
  readonly kpiName: string;
  readonly value: unknown;
  readonly formattedValue: string;
  readonly thresholdStatus?: 'ok' | 'warning' | 'critical';
  readonly trend?: KPITrend;
  readonly computedAt: ISODateTime;
}

interface KPITrend {
  readonly direction: 'up' | 'down' | 'stable';
  readonly percentageChange: Percentage;
  readonly comparedTo: ISODateTime;
}

interface EvaluateMultipleKPIsInput {
  readonly kpiIds: readonly UUID[];
  readonly filters?: readonly UUID[];
  readonly variables?: Record<string, unknown>;
}

interface CreateRecordInput {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly objectType: string;
  readonly identifierAttribute: string;
}

interface UpdateRecordInput {
  readonly id: UUID;
  readonly name?: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly identifierAttribute?: string;
}

interface AddAttributeInput {
  readonly recordId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly sourceType: AttributeSourceType;
  readonly source: AttributeSource;
  readonly dataType: DataType;
  readonly format?: string;
  readonly isSearchable?: boolean;
  readonly isFilterable?: boolean;
}

interface UpdateAttributeInput {
  readonly id: UUID;
  readonly displayName?: string;
  readonly format?: string;
  readonly isSearchable?: boolean;
  readonly isFilterable?: boolean;
}

interface QueryRecordInput {
  readonly recordId: UUID;
  readonly attributes?: readonly string[];
  readonly filters?: readonly FilterClause[];
  readonly search?: string;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

interface RecordDataResult {
  readonly recordId: UUID;
  readonly columns: readonly RecordAttribute[];
  readonly rows: PaginatedResult<Record<string, unknown>>;
}

interface CreateFilterInput {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: FilterType;
  readonly config: FilterConfig;
  readonly isGlobal?: boolean;
  readonly isDefault?: boolean;
}

interface UpdateFilterInput {
  readonly id: UUID;
  readonly name?: string;
  readonly displayName?: string;
  readonly config?: FilterConfig;
  readonly isDefault?: boolean;
}

interface CreateVariableInput {
  readonly scopeType: VariableScopeType;
  readonly scopeId: UUID;
  readonly name: string;
  readonly displayName?: string;
  readonly type: VariableType;
  readonly defaultValue: unknown;
  readonly validation?: VariableValidation;
}

interface UpdateVariableInput {
  readonly id: UUID;
  readonly displayName?: string;
  readonly defaultValue?: unknown;
  readonly validation?: VariableValidation;
}

interface SetVariableValueInput {
  readonly variableId: UUID;
  readonly value: unknown;
}

interface CreateEventLogConfigInput {
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly description?: string;
  readonly type: EventLogType;
  readonly config: EventLogConfigDetails;
  readonly isDefault?: boolean;
}

interface UpdateEventLogConfigInput {
  readonly id: UUID;
  readonly name?: string;
  readonly config?: Partial<EventLogConfigDetails>;
  readonly isDefault?: boolean;
}

interface KMValidation {
  readonly valid: boolean;
  readonly errors: readonly KMValidationError[];
  readonly warnings: readonly KMValidationWarning[];
}

interface KMValidationError {
  readonly code: string;
  readonly message: string;
  readonly component: 'kpi' | 'record' | 'filter' | 'event_log';
  readonly componentId?: UUID;
}

interface KMValidationWarning {
  readonly code: string;
  readonly message: string;
  readonly recommendation: string;
}
```

---

## VIEW SERVICE

```typescript
interface IViewService extends IService {
  // Queries
  getView(id: ViewId, ctx: OperationContext): AsyncResult<View>;
  getViewByKey(key: string, ctx: OperationContext): AsyncResult<View>;
  getFullView(id: ViewId, ctx: OperationContext): AsyncResult<FullView>;
  listViews(input: ListViewsInput, ctx: OperationContext): AsyncResult<PaginatedResult<View>>;
  
  // Commands
  createView(input: CreateViewInput, ctx: OperationContext): AsyncResult<View>;
  updateView(input: UpdateViewInput, ctx: OperationContext): AsyncResult<View>;
  deleteView(id: ViewId, ctx: OperationContext): AsyncResult<void>;
  duplicateView(input: DuplicateViewInput, ctx: OperationContext): AsyncResult<View>;
  
  // Components
  addComponent(input: AddComponentInput, ctx: OperationContext): AsyncResult<Component>;
  updateComponent(input: UpdateComponentInput, ctx: OperationContext): AsyncResult<Component>;
  deleteComponent(id: UUID, ctx: OperationContext): AsyncResult<void>;
  moveComponent(input: MoveComponentInput, ctx: OperationContext): AsyncResult<Component>;
  
  // Tabs
  addTab(input: AddTabInput, ctx: OperationContext): AsyncResult<Tab>;
  updateTab(input: UpdateTabInput, ctx: OperationContext): AsyncResult<Tab>;
  deleteTab(id: UUID, ctx: OperationContext): AsyncResult<void>;
  reorderTabs(input: ReorderTabsInput, ctx: OperationContext): AsyncResult<readonly Tab[]>;
  
  // Rendering
  renderView(input: RenderViewInput, ctx: OperationContext): AsyncResult<RenderedView>;
  renderComponent(input: RenderComponentInput, ctx: OperationContext): AsyncResult<RenderedComponent>;
  
  // Sharing
  generateShareLink(input: GenerateShareLinkInput, ctx: OperationContext): AsyncResult<ShareLink>;
  revokeShareLink(linkId: UUID, ctx: OperationContext): AsyncResult<void>;
  
  // Export
  exportView(input: ExportViewInput, ctx: OperationContext): AsyncResult<ExportedView>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CreateViewInput {
  readonly packageId: PackageId;
  readonly knowledgeModelId: UUID;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly type: ViewType;
  readonly layout?: ViewLayout;
  readonly settings?: ViewSettings;
}

interface UpdateViewInput {
  readonly id: ViewId;
  readonly name?: string;
  readonly description?: string;
  readonly layout?: ViewLayout;
  readonly settings?: ViewSettings;
}

interface ListViewsInput {
  readonly packageId?: PackageId;
  readonly knowledgeModelId?: UUID;
  readonly type?: ViewType;
  readonly status?: PublishStatus;
  readonly search?: string;
  readonly pagination?: Pagination;
}

interface DuplicateViewInput {
  readonly viewId: ViewId;
  readonly newKey: string;
  readonly newName: string;
  readonly targetPackageId?: PackageId;
}

interface AddComponentInput {
  readonly viewId: ViewId;
  readonly tabId?: UUID;
  readonly type: ComponentType;
  readonly name?: string;
  readonly position: ComponentPosition;
  readonly config: ComponentConfig;
  readonly dataBinding?: DataBinding;
  readonly interactivity?: InteractivityConfig;
}

interface UpdateComponentInput {
  readonly id: UUID;
  readonly name?: string;
  readonly config?: Partial<ComponentConfig>;
  readonly dataBinding?: DataBinding;
  readonly interactivity?: InteractivityConfig;
}

interface MoveComponentInput {
  readonly componentId: UUID;
  readonly position: ComponentPosition;
  readonly tabId?: UUID;
}

interface AddTabInput {
  readonly viewId: ViewId;
  readonly name: string;
  readonly icon?: string;
  readonly position?: number;
}

interface UpdateTabInput {
  readonly id: UUID;
  readonly name?: string;
  readonly icon?: string;
  readonly visibility?: VisibilityRule;
}

interface ReorderTabsInput {
  readonly viewId: ViewId;
  readonly tabOrder: readonly UUID[];
}

interface RenderViewInput {
  readonly viewId: ViewId;
  readonly filters?: readonly UUID[];
  readonly variables?: Record<string, unknown>;
  readonly dateRange?: DateRange;
}

interface RenderedView {
  readonly view: View;
  readonly tabs: readonly RenderedTab[];
  readonly appliedFilters: readonly Filter[];
  readonly variables: Record<string, unknown>;
  readonly renderedAt: ISODateTime;
}

interface RenderedTab {
  readonly tab: Tab;
  readonly components: readonly RenderedComponent[];
}

interface RenderedComponent {
  readonly component: Component;
  readonly data: ComponentData;
  readonly error?: string;
  readonly renderDuration: Duration;
}

type ComponentData = 
  | { type: 'chart'; chartData: ChartData }
  | { type: 'table'; tableData: TableData }
  | { type: 'kpi'; kpiData: KPIValue[] }
  | { type: 'process'; processData: ProcessVisualizationData }
  | { type: 'static'; content: unknown };

interface ChartData {
  readonly series: readonly ChartSeries[];
  readonly categories?: readonly string[];
  readonly labels?: readonly string[];
}

interface ChartSeries {
  readonly name: string;
  readonly data: readonly ChartDataPoint[];
  readonly color?: string;
}

interface ChartDataPoint {
  readonly x: unknown;
  readonly y: number;
  readonly label?: string;
  readonly metadata?: Record<string, unknown>;
}

interface TableData {
  readonly columns: readonly TableColumn[];
  readonly rows: readonly Record<string, unknown>[];
  readonly total: number;
  readonly aggregations?: Record<string, unknown>;
}

interface TableColumn {
  readonly key: string;
  readonly label: string;
  readonly type: DataType;
  readonly sortable: boolean;
  readonly width?: number;
}

interface ProcessVisualizationData {
  readonly type: ProcessModelType;
  readonly model: ProcessModelContent;
  readonly metrics?: ProcessMetrics;
  readonly highlighting?: ProcessHighlighting;
}

interface ProcessMetrics {
  readonly activityMetrics: Record<string, ActivityMetrics>;
  readonly transitionMetrics: Record<string, TransitionMetrics>;
}

interface ActivityMetrics {
  readonly frequency: number;
  readonly avgDuration?: Duration;
  readonly conformanceRate?: Percentage;
}

interface TransitionMetrics {
  readonly frequency: number;
  readonly avgDuration?: Duration;
}

interface ProcessHighlighting {
  readonly highlightedActivities?: Record<string, string>;  // Activity -> color
  readonly highlightedTransitions?: Record<string, string>;
  readonly annotations?: readonly ProcessAnnotation[];
}

interface ProcessAnnotation {
  readonly elementId: string;
  readonly text: string;
  readonly type: 'info' | 'warning' | 'error';
}

interface RenderComponentInput {
  readonly componentId: UUID;
  readonly filters?: readonly UUID[];
  readonly variables?: Record<string, unknown>;
}

interface GenerateShareLinkInput {
  readonly viewId: ViewId;
  readonly expiresIn?: Duration;
  readonly password?: string;
  readonly allowedEmails?: readonly Email[];
  readonly permissions: SharePermissions;
}

interface SharePermissions {
  readonly canExport: boolean;
  readonly canFilter: boolean;
  readonly visibleTabs?: readonly UUID[];
}

interface ShareLink {
  readonly id: UUID;
  readonly viewId: ViewId;
  readonly token: string;
  readonly url: URL;
  readonly permissions: SharePermissions;
  readonly expiresAt?: ISODateTime;
  readonly createdAt: ISODateTime;
  readonly createdBy: UserId;
}

interface ExportViewInput {
  readonly viewId: ViewId;
  readonly format: ViewExportFormat;
  readonly options?: ViewExportOptions;
}

type ViewExportFormat = 'pdf' | 'png' | 'html' | 'pptx';

interface ViewExportOptions {
  readonly includeFilters?: boolean;
  readonly dateRange?: DateRange;
  readonly selectedTabs?: readonly UUID[];
  readonly pageSize?: 'a4' | 'letter' | 'custom';
  readonly orientation?: 'portrait' | 'landscape';
}

interface ExportedView {
  readonly content: Buffer;
  readonly mimeType: string;
  readonly filename: string;
  readonly exportedAt: ISODateTime;
}
```

---

## ACTION FLOW SERVICE

```typescript
interface IActionFlowService extends IService {
  // Queries
  getActionFlow(id: ActionFlowId, ctx: OperationContext): AsyncResult<ActionFlow>;
  listActionFlows(input: ListActionFlowsInput, ctx: OperationContext): AsyncResult<PaginatedResult<ActionFlow>>;
  getExecutionHistory(input: GetExecutionHistoryInput, ctx: OperationContext): AsyncResult<PaginatedResult<Execution>>;
  getExecution(id: UUID, ctx: OperationContext): AsyncResult<Execution>;
  
  // Commands
  createActionFlow(input: CreateActionFlowInput, ctx: OperationContext): AsyncResult<ActionFlow>;
  updateActionFlow(input: UpdateActionFlowInput, ctx: OperationContext): AsyncResult<ActionFlow>;
  deleteActionFlow(id: ActionFlowId, ctx: OperationContext): AsyncResult<void>;
  duplicateActionFlow(input: DuplicateActionFlowInput, ctx: OperationContext): AsyncResult<ActionFlow>;
  
  // Modules
  addModule(input: AddModuleInput, ctx: OperationContext): AsyncResult<Module>;
  updateModule(input: UpdateModuleInput, ctx: OperationContext): AsyncResult<Module>;
  deleteModule(id: UUID, ctx: OperationContext): AsyncResult<void>;
  reorderModules(input: ReorderModulesInput, ctx: OperationContext): AsyncResult<readonly Module[]>;
  
  // Lifecycle
  activateActionFlow(id: ActionFlowId, ctx: OperationContext): AsyncResult<ActionFlow>;
  deactivateActionFlow(id: ActionFlowId, ctx: OperationContext): AsyncResult<ActionFlow>;
  
  // Execution
  executeActionFlow(input: ExecuteActionFlowInput, ctx: OperationContext): AsyncResult<Execution>;
  cancelExecution(executionId: UUID, ctx: OperationContext): AsyncResult<Execution>;
  retryExecution(executionId: UUID, ctx: OperationContext): AsyncResult<Execution>;
  
  // Testing
  testActionFlow(input: TestActionFlowInput, ctx: OperationContext): AsyncResult<TestResult>;
  validateActionFlow(id: ActionFlowId, ctx: OperationContext): AsyncResult<ActionFlowValidation>;
  
  // Scheduling
  scheduleActionFlow(input: ScheduleActionFlowInput, ctx: OperationContext): AsyncResult<ScheduledJob>;
  unscheduleActionFlow(id: ActionFlowId, ctx: OperationContext): AsyncResult<void>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CreateActionFlowInput {
  readonly packageId: PackageId;
  readonly name: string;
  readonly description?: string;
  readonly trigger: ActionFlowTrigger;
  readonly inputs?: readonly ActionFlowInput[];
  readonly outputs?: readonly ActionFlowOutput[];
  readonly errorHandling?: ErrorHandlingConfig;
}

interface UpdateActionFlowInput {
  readonly id: ActionFlowId;
  readonly name?: string;
  readonly description?: string;
  readonly trigger?: ActionFlowTrigger;
  readonly inputs?: readonly ActionFlowInput[];
  readonly outputs?: readonly ActionFlowOutput[];
  readonly errorHandling?: ErrorHandlingConfig;
}

interface ListActionFlowsInput {
  readonly packageId?: PackageId;
  readonly status?: ActionFlowStatus;
  readonly triggerType?: TriggerType;
  readonly search?: string;
  readonly pagination?: Pagination;
}

interface DuplicateActionFlowInput {
  readonly actionFlowId: ActionFlowId;
  readonly newName: string;
  readonly targetPackageId?: PackageId;
}

interface AddModuleInput {
  readonly actionFlowId: ActionFlowId;
  readonly type: ModuleType;
  readonly name: string;
  readonly description?: string;
  readonly position?: number;
  readonly config: ModuleConfig;
  readonly inputMappings?: readonly InputMapping[];
  readonly outputMappings?: readonly OutputMapping[];
  readonly errorHandling?: ModuleErrorHandling;
  readonly condition?: ModuleCondition;
}

interface UpdateModuleInput {
  readonly id: UUID;
  readonly name?: string;
  readonly config?: ModuleConfig;
  readonly inputMappings?: readonly InputMapping[];
  readonly outputMappings?: readonly OutputMapping[];
  readonly errorHandling?: ModuleErrorHandling;
  readonly condition?: ModuleCondition;
}

interface ReorderModulesInput {
  readonly actionFlowId: ActionFlowId;
  readonly moduleOrder: readonly UUID[];
}

interface ExecuteActionFlowInput {
  readonly actionFlowId: ActionFlowId;
  readonly inputs?: Record<string, unknown>;
  readonly async?: boolean;                   // Return immediately vs wait
}

interface GetExecutionHistoryInput {
  readonly actionFlowId: ActionFlowId;
  readonly status?: ExecutionStatus;
  readonly dateRange?: DateRange;
  readonly pagination?: Pagination;
}

interface TestActionFlowInput {
  readonly actionFlowId: ActionFlowId;
  readonly testInputs: Record<string, unknown>;
  readonly mockExternalCalls?: boolean;
  readonly stopAtModule?: UUID;
}

interface TestResult {
  readonly success: boolean;
  readonly moduleResults: readonly ModuleTestResult[];
  readonly outputs?: Record<string, unknown>;
  readonly error?: ExecutionError;
  readonly duration: Duration;
}

interface ModuleTestResult {
  readonly moduleId: UUID;
  readonly moduleName: string;
  readonly success: boolean;
  readonly inputs: Record<string, unknown>;
  readonly outputs?: Record<string, unknown>;
  readonly error?: string;
  readonly duration: Duration;
  readonly skipped: boolean;
}

interface ActionFlowValidation {
  readonly valid: boolean;
  readonly errors: readonly ActionFlowError[];
  readonly warnings: readonly ActionFlowWarning[];
}

interface ActionFlowError {
  readonly code: string;
  readonly message: string;
  readonly moduleId?: UUID;
  readonly field?: string;
}

interface ActionFlowWarning {
  readonly code: string;
  readonly message: string;
  readonly recommendation: string;
}

interface ScheduleActionFlowInput {
  readonly actionFlowId: ActionFlowId;
  readonly schedule: JobSchedule;
  readonly inputOverrides?: Record<string, unknown>;
}
```

---

## SKILL SERVICE

```typescript
interface ISkillService extends IService {
  // Queries
  getSkill(id: UUID, ctx: OperationContext): AsyncResult<Skill>;
  listSkills(input: ListSkillsInput, ctx: OperationContext): AsyncResult<PaginatedResult<Skill>>;
  
  // Commands
  createSkill(input: CreateSkillInput, ctx: OperationContext): AsyncResult<Skill>;
  updateSkill(input: UpdateSkillInput, ctx: OperationContext): AsyncResult<Skill>;
  deleteSkill(id: UUID, ctx: OperationContext): AsyncResult<void>;
  
  // Sensor
  configureSensor(input: ConfigureSensorInput, ctx: OperationContext): AsyncResult<Sensor>;
  evaluateSensor(sensorId: UUID, ctx: OperationContext): AsyncResult<SensorEvaluationResult>;
  
  // Actions
  addSkillAction(input: AddSkillActionInput, ctx: OperationContext): AsyncResult<SkillAction>;
  updateSkillAction(input: UpdateSkillActionInput, ctx: OperationContext): AsyncResult<SkillAction>;
  deleteSkillAction(id: UUID, ctx: OperationContext): AsyncResult<void>;
  
  // Lifecycle
  activateSkill(id: UUID, ctx: OperationContext): AsyncResult<Skill>;
  deactivateSkill(id: UUID, ctx: OperationContext): AsyncResult<Skill>;
  
  // Signals
  getSignals(input: GetSignalsInput, ctx: OperationContext): AsyncResult<PaginatedResult<Signal>>;
  getSignal(id: UUID, ctx: OperationContext): AsyncResult<Signal>;
  acknowledgeSignal(id: UUID, ctx: OperationContext): AsyncResult<Signal>;
  resolveSignal(input: ResolveSignalInput, ctx: OperationContext): AsyncResult<Signal>;
  snoozeSignal(input: SnoozeSignalInput, ctx: OperationContext): AsyncResult<Signal>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CreateSkillInput {
  readonly packageId: PackageId;
  readonly name: string;
  readonly description?: string;
  readonly settings?: SkillSettings;
}

interface UpdateSkillInput {
  readonly id: UUID;
  readonly name?: string;
  readonly description?: string;
  readonly settings?: SkillSettings;
}

interface ListSkillsInput {
  readonly packageId?: PackageId;
  readonly status?: EntityStatus;
  readonly search?: string;
  readonly pagination?: Pagination;
}

interface ConfigureSensorInput {
  readonly skillId: UUID;
  readonly knowledgeModelId: UUID;
  readonly name: string;
  readonly type: SensorType;
  readonly config: SensorConfig;
  readonly evaluationSchedule: JobSchedule;
}

interface SensorEvaluationResult {
  readonly sensorId: UUID;
  readonly evaluatedAt: ISODateTime;
  readonly signalsGenerated: number;
  readonly signals: readonly Signal[];
  readonly duration: Duration;
}

interface AddSkillActionInput {
  readonly skillId: UUID;
  readonly type: SkillActionType;
  readonly config: SkillActionConfig;
  readonly order?: number;
}

interface UpdateSkillActionInput {
  readonly id: UUID;
  readonly config?: SkillActionConfig;
  readonly order?: number;
}

interface GetSignalsInput {
  readonly skillId?: UUID;
  readonly sensorId?: UUID;
  readonly status?: SignalStatus;
  readonly severity?: SignalSeverity;
  readonly dateRange?: DateRange;
  readonly pagination?: Pagination;
}

interface ResolveSignalInput {
  readonly signalId: UUID;
  readonly resolutionNote?: string;
}

interface SnoozeSignalInput {
  readonly signalId: UUID;
  readonly snoozeDuration: Duration;
  readonly reason?: string;
}
```

---

## TASK SERVICE

```typescript
interface ITaskService extends IService {
  // Queries
  getTask(id: UUID, ctx: OperationContext): AsyncResult<Task>;
  listTasks(input: ListTasksInput, ctx: OperationContext): AsyncResult<PaginatedResult<Task>>;
  getMyTasks(input: GetMyTasksInput, ctx: OperationContext): AsyncResult<PaginatedResult<Task>>;
  getTaskStatistics(input: TaskStatsInput, ctx: OperationContext): AsyncResult<TaskStatistics>;
  
  // Commands
  createTask(input: CreateTaskInput, ctx: OperationContext): AsyncResult<Task>;
  updateTask(input: UpdateTaskInput, ctx: OperationContext): AsyncResult<Task>;
  deleteTask(id: UUID, ctx: OperationContext): AsyncResult<void>;
  
  // Workflow
  assignTask(input: AssignTaskInput, ctx: OperationContext): AsyncResult<Task>;
  unassignTask(id: UUID, ctx: OperationContext): AsyncResult<Task>;
  changeStatus(input: ChangeTaskStatusInput, ctx: OperationContext): AsyncResult<Task>;
  
  // Comments
  addComment(input: AddCommentInput, ctx: OperationContext): AsyncResult<TaskComment>;
  updateComment(input: UpdateCommentInput, ctx: OperationContext): AsyncResult<TaskComment>;
  deleteComment(id: UUID, ctx: OperationContext): AsyncResult<void>;
  
  // Bulk Operations
  bulkAssign(input: BulkAssignInput, ctx: OperationContext): AsyncResult<BulkOperationResult>;
  bulkChangeStatus(input: BulkChangeStatusInput, ctx: OperationContext): AsyncResult<BulkOperationResult>;
  
  // Task Types
  createTaskType(input: CreateTaskTypeInput, ctx: OperationContext): AsyncResult<TaskType>;
  updateTaskType(input: UpdateTaskTypeInput, ctx: OperationContext): AsyncResult<TaskType>;
  deleteTaskType(id: UUID, ctx: OperationContext): AsyncResult<void>;
  listTaskTypes(ctx: OperationContext): AsyncResult<readonly TaskType[]>;
}

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

interface CreateTaskInput {
  readonly taskTypeId: UUID;
  readonly title: string;
  readonly description?: string;
  readonly priority?: TaskPriority;
  readonly assigneeId?: UserId;
  readonly dueDate?: ISODateTime;
  readonly context?: TaskContext;
  readonly customFields?: Record<string, unknown>;
}

interface UpdateTaskInput {
  readonly id: UUID;
  readonly title?: string;
  readonly description?: string;
  readonly priority?: TaskPriority;
  readonly dueDate?: ISODateTime;
  readonly customFields?: Record<string, unknown>;
}

interface ListTasksInput {
  readonly taskTypeId?: UUID;
  readonly status?: TaskStatus;
  readonly priority?: TaskPriority;
  readonly assigneeId?: UserId;
  readonly signalId?: UUID;
  readonly dueBefore?: ISODateTime;
  readonly dueAfter?: ISODateTime;
  readonly search?: string;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

interface GetMyTasksInput {
  readonly status?: TaskStatus;
  readonly includeUnassigned?: boolean;
  readonly pagination?: Pagination;
}

interface TaskStatsInput {
  readonly taskTypeId?: UUID;
  readonly dateRange?: DateRange;
  readonly groupBy?: 'status' | 'priority' | 'assignee' | 'type';
}

interface TaskStatistics {
  readonly total: number;
  readonly byStatus: Record<TaskStatus, number>;
  readonly byPriority: Record<TaskPriority, number>;
  readonly overdue: number;
  readonly avgResolutionTime?: Duration;
  readonly completionRate: Percentage;
  readonly groups?: readonly TaskStatGroup[];
}

interface TaskStatGroup {
  readonly key: string;
  readonly count: number;
  readonly avgResolutionTime?: Duration;
}

interface AssignTaskInput {
  readonly taskId: UUID;
  readonly assigneeId: UserId;
  readonly notify?: boolean;
}

interface ChangeTaskStatusInput {
  readonly taskId: UUID;
  readonly status: TaskStatus;
  readonly note?: string;
}

interface AddCommentInput {
  readonly taskId: UUID;
  readonly content: string;
}

interface UpdateCommentInput {
  readonly id: UUID;
  readonly content: string;
}

interface BulkAssignInput {
  readonly taskIds: readonly UUID[];
  readonly assigneeId: UserId;
}

interface BulkChangeStatusInput {
  readonly taskIds: readonly UUID[];
  readonly status: TaskStatus;
}

interface BulkOperationResult {
  readonly succeeded: number;
  readonly failed: number;
  readonly errors: readonly { taskId: UUID; error: string }[];
}

interface CreateTaskTypeInput {
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly defaultPriority?: TaskPriority;
  readonly customFields?: readonly TaskCustomField[];
  readonly workflow?: TaskWorkflow;
}

interface UpdateTaskTypeInput {
  readonly id: UUID;
  readonly name?: string;
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly customFields?: readonly TaskCustomField[];
  readonly workflow?: TaskWorkflow;
}
```
