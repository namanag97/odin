# L1 DOMAIN CONTRACTS — PROCESS MINING DOMAIN
> PM4Py-aligned data models with OCEL 2.0 support

---

## DATA INTEGRATION SUBLAYER

### Entity: DataPool

```typescript
/**
 * Container for all data tables within a tenant.
 * Provides isolation and versioning for data sources.
 */
interface DataPool {
  readonly id: DataPoolId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly status: DataPoolStatus;
  readonly version: PositiveInt;
  readonly settings: DataPoolSettings;
  readonly statistics: DataPoolStatistics;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

type DataPoolStatus = 'active' | 'archived' | 'error';

interface DataPoolSettings {
  readonly timezone: string;
  readonly dateFormat: string;
  readonly nullHandling: NullHandling;
  readonly deduplicationEnabled: boolean;
}

type NullHandling = 'keep' | 'empty_string' | 'default';

interface DataPoolStatistics {
  readonly tableCount: NonNegativeInt;
  readonly totalRows: NonNegativeInt;
  readonly totalSizeBytes: NonNegativeInt;
  readonly lastRefreshedAt?: ISODateTime;
}
```

### Repository: IDataPoolRepository

```typescript
interface IDataPoolRepository {
  findById(id: DataPoolId): AsyncResult<DataPool | null>;
  findByTenantId(tenantId: TenantId, options?: QueryOptions): AsyncResult<PaginatedResult<DataPool>>;
  findByName(tenantId: TenantId, name: string): AsyncResult<DataPool | null>;
  
  create(data: CreateDataPoolData): AsyncResult<DataPool>;
  update(id: DataPoolId, data: UpdateDataPoolData): AsyncResult<DataPool>;
  updateStatistics(id: DataPoolId, stats: Partial<DataPoolStatistics>): AsyncResult<DataPool>;
  archive(id: DataPoolId): AsyncResult<void>;
  delete(id: DataPoolId): AsyncResult<void>;
  
  getTables(poolId: DataPoolId): AsyncResult<readonly Table[]>;
  getDataModels(poolId: DataPoolId): AsyncResult<readonly DataModel[]>;
}
```

---

### Entity: Table

```typescript
interface Table {
  readonly id: UUID;
  readonly dataPoolId: DataPoolId;
  readonly name: string;
  readonly displayName?: string;
  readonly sourceType: TableSourceType;
  readonly sourceConfig?: TableSourceConfig;
  readonly columns: readonly Column[];
  readonly primaryKey?: readonly string[];
  readonly rowCount: NonNegativeInt;
  readonly sizeBytes: NonNegativeInt;
  readonly lastLoadedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

type TableSourceType = 'csv' | 'xlsx' | 'parquet' | 'json' | 'database' | 'api';

interface TableSourceConfig {
  readonly connectionId?: UUID;
  readonly query?: string;
  readonly filePath?: string;
  readonly sheetName?: string;
  readonly options?: Record<string, unknown>;
}

interface Column {
  readonly name: string;
  readonly displayName?: string;
  readonly dataType: DataType;
  readonly nullable: boolean;
  readonly isPrimaryKey: boolean;
  readonly isIndexed: boolean;
  readonly statistics?: ColumnStatistics;
}

interface ColumnStatistics {
  readonly distinctCount: number;
  readonly nullCount: number;
  readonly minValue?: unknown;
  readonly maxValue?: unknown;
  readonly sampleValues?: readonly unknown[];
}
```

### Repository: ITableRepository

```typescript
interface ITableRepository {
  findById(id: UUID): AsyncResult<Table | null>;
  findByDataPoolId(poolId: DataPoolId): AsyncResult<readonly Table[]>;
  findByName(poolId: DataPoolId, name: string): AsyncResult<Table | null>;
  
  create(data: CreateTableData): AsyncResult<Table>;
  update(id: UUID, data: UpdateTableData): AsyncResult<Table>;
  delete(id: UUID): AsyncResult<void>;
  
  // Data Operations
  importData(tableId: UUID, data: TableImportData): AsyncResult<ImportResult>;
  truncate(tableId: UUID): AsyncResult<void>;
  preview(tableId: UUID, limit?: number): AsyncResult<readonly Record<string, unknown>[]>;
  
  // Schema Operations
  updateSchema(tableId: UUID, columns: readonly Column[]): AsyncResult<Table>;
  addColumn(tableId: UUID, column: Column): AsyncResult<Table>;
  removeColumn(tableId: UUID, columnName: string): AsyncResult<Table>;
  
  // Statistics
  refreshStatistics(tableId: UUID): AsyncResult<Table>;
}

interface TableImportData {
  readonly source: ImportSource;
  readonly options: ImportOptions;
}

type ImportSource = 
  | { type: 'file'; fileId: UUID }
  | { type: 'raw'; data: readonly Record<string, unknown>[] }
  | { type: 'query'; connectionId: UUID; query: string };

interface ImportOptions {
  readonly mode: ImportMode;
  readonly batchSize?: number;
  readonly skipErrors?: boolean;
  readonly validateTypes?: boolean;
  readonly transformations?: readonly ColumnTransformation[];
}

type ImportMode = 'replace' | 'append' | 'upsert';

interface ImportResult {
  readonly rowsImported: number;
  readonly rowsSkipped: number;
  readonly errors: readonly ImportError[];
  readonly duration: Duration;
}
```

---

## OCEL DATA MODEL SUBLAYER

### Entity: DataModel (OCEL-Centric)

```typescript
/**
 * OCEL 2.0 compliant data model for object-centric process mining.
 * Unlike case-centric models, OCEL supports multiple object types per event.
 */
interface DataModel {
  readonly id: DataModelId;
  readonly tenantId: TenantId;
  readonly dataPoolId: DataPoolId;
  readonly name: string;
  readonly description?: string;
  readonly type: DataModelType;
  readonly version: PositiveInt;
  readonly status: LoadStatus;
  readonly configuration: DataModelConfiguration;
  readonly statistics?: DataModelStatistics;
  readonly lastLoadedAt?: ISODateTime;
  readonly loadError?: string;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

type DataModelType = 'case_centric' | 'object_centric';

interface DataModelConfiguration {
  // For case-centric (traditional)
  readonly caseCentric?: CaseCentricConfig;
  
  // For object-centric (OCEL 2.0)
  readonly objectCentric?: ObjectCentricConfig;
}

interface CaseCentricConfig {
  readonly activityTableId: UUID;
  readonly caseIdColumn: string;
  readonly activityColumn: string;
  readonly timestampColumn: string;
  readonly sortingColumn?: string;
  readonly additionalAttributes?: readonly AttributeMapping[];
}

interface ObjectCentricConfig {
  // OCEL 2.0 structure
  readonly eventTableId: UUID;
  readonly eventIdColumn: string;
  readonly activityColumn: string;
  readonly timestampColumn: string;
  
  readonly objectTypes: readonly ObjectTypeConfig[];
  readonly eventToObjectTableId?: UUID;      // E2O relation table
}

interface ObjectTypeConfig {
  readonly name: string;
  readonly displayName?: string;
  readonly tableId: UUID;
  readonly objectIdColumn: string;
  readonly attributes: readonly AttributeMapping[];
  readonly color?: string;                   // For visualization
}

interface AttributeMapping {
  readonly name: string;
  readonly displayName?: string;
  readonly columnName: string;
  readonly dataType: DataType;
  readonly aggregation?: AggregationType;
}

type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'first' | 'last';

interface DataModelStatistics {
  readonly eventCount: number;
  readonly objectCounts: Record<string, number>;  // By object type
  readonly activityCount: number;
  readonly uniqueActivities: readonly string[];
  readonly timeRange: DateRange;
  readonly avgEventsPerObject: Record<string, number>;
}
```

### Repository: IDataModelRepository

```typescript
interface IDataModelRepository {
  findById(id: DataModelId): AsyncResult<DataModel | null>;
  findByTenantId(tenantId: TenantId, options?: QueryOptions): AsyncResult<PaginatedResult<DataModel>>;
  findByDataPoolId(poolId: DataPoolId): AsyncResult<readonly DataModel[]>;
  
  create(data: CreateDataModelData): AsyncResult<DataModel>;
  update(id: DataModelId, data: UpdateDataModelData): AsyncResult<DataModel>;
  delete(id: DataModelId): AsyncResult<void>;
  
  // Configuration
  updateConfiguration(id: DataModelId, config: Partial<DataModelConfiguration>): AsyncResult<DataModel>;
  addObjectType(id: DataModelId, objectType: ObjectTypeConfig): AsyncResult<DataModel>;
  removeObjectType(id: DataModelId, objectTypeName: string): AsyncResult<DataModel>;
  
  // Loading
  updateStatus(id: DataModelId, status: LoadStatus, error?: string): AsyncResult<DataModel>;
  updateStatistics(id: DataModelId, stats: DataModelStatistics): AsyncResult<DataModel>;
}
```

---

### Entity: Event (OCEL)

```typescript
/**
 * OCEL 2.0 Event - can relate to multiple objects of different types.
 */
interface OCELEvent {
  readonly id: EventId;
  readonly dataModelId: DataModelId;
  readonly activity: string;
  readonly timestamp: ISODateTime;
  readonly objects: readonly EventObject[];     // Multiple object references
  readonly attributes: Record<string, unknown>;
}

interface EventObject {
  readonly objectType: string;
  readonly objectId: ObjectId;
  readonly qualifier?: string;                  // Relationship qualifier
}

/**
 * OCEL 2.0 Object - lifecycle entity tracked across events.
 */
interface OCELObject {
  readonly id: ObjectId;
  readonly dataModelId: DataModelId;
  readonly type: ObjectTypeId;
  readonly attributes: Record<string, unknown>;
  readonly lifecycle: ObjectLifecycle;
}

interface ObjectLifecycle {
  readonly createdAt: ISODateTime;
  readonly lastEventAt: ISODateTime;
  readonly eventCount: number;
  readonly activities: readonly string[];       // Unique activities
}

/**
 * Relationship between objects (O2O in OCEL 2.0).
 */
interface ObjectRelation {
  readonly sourceObjectId: ObjectId;
  readonly targetObjectId: ObjectId;
  readonly qualifier: string;                   // Relationship type
  readonly timestamp?: ISODateTime;             // When relation was established
}
```

### Repository: IOCELRepository

```typescript
interface IOCELRepository {
  // Events
  getEvents(
    modelId: DataModelId,
    options?: OCELQueryOptions
  ): AsyncResult<PaginatedResult<OCELEvent>>;
  
  getEventById(
    modelId: DataModelId,
    eventId: EventId
  ): AsyncResult<OCELEvent | null>;
  
  getEventsByObject(
    modelId: DataModelId,
    objectType: string,
    objectId: ObjectId,
    options?: QueryOptions
  ): AsyncResult<readonly OCELEvent[]>;
  
  getEventsByActivity(
    modelId: DataModelId,
    activity: string,
    options?: QueryOptions
  ): AsyncResult<PaginatedResult<OCELEvent>>;
  
  // Objects
  getObjects(
    modelId: DataModelId,
    objectType: string,
    options?: QueryOptions
  ): AsyncResult<PaginatedResult<OCELObject>>;
  
  getObjectById(
    modelId: DataModelId,
    objectType: string,
    objectId: ObjectId
  ): AsyncResult<OCELObject | null>;
  
  getObjectTypes(modelId: DataModelId): AsyncResult<readonly string[]>;
  
  getObjectLifecycle(
    modelId: DataModelId,
    objectType: string,
    objectId: ObjectId
  ): AsyncResult<ObjectLifecycle>;
  
  // Relations
  getObjectRelations(
    modelId: DataModelId,
    objectId: ObjectId
  ): AsyncResult<readonly ObjectRelation[]>;
  
  getRelatedObjects(
    modelId: DataModelId,
    objectId: ObjectId,
    qualifier?: string
  ): AsyncResult<readonly OCELObject[]>;
  
  // Aggregations
  getActivityStatistics(
    modelId: DataModelId,
    filters?: OCELFilter[]
  ): AsyncResult<readonly ActivityStatistic[]>;
  
  getObjectTypeStatistics(
    modelId: DataModelId
  ): AsyncResult<readonly ObjectTypeStatistic[]>;
}

interface OCELQueryOptions extends QueryOptions {
  readonly objectTypes?: readonly string[];
  readonly activities?: readonly string[];
  readonly dateRange?: DateRange;
  readonly objectFilters?: readonly OCELFilter[];
}

interface OCELFilter {
  readonly type: 'event' | 'object';
  readonly objectType?: string;
  readonly field: string;
  readonly operator: FilterOperator;
  readonly value: unknown;
}

interface ActivityStatistic {
  readonly activity: string;
  readonly eventCount: number;
  readonly objectTypeCounts: Record<string, number>;
  readonly avgDuration?: Duration;
  readonly firstOccurrence: ISODateTime;
  readonly lastOccurrence: ISODateTime;
}

interface ObjectTypeStatistic {
  readonly objectType: string;
  readonly objectCount: number;
  readonly totalEvents: number;
  readonly avgEventsPerObject: number;
  readonly uniqueActivities: number;
}
```

---

### Entity: Case (Case-Centric Compatibility)

```typescript
/**
 * Traditional case-centric view - also derivable from OCEL.
 */
interface Case {
  readonly id: string;                         // Business case ID
  readonly dataModelId: DataModelId;
  readonly variant: VariantId;
  readonly events: readonly CaseEvent[];
  readonly attributes: Record<string, unknown>;
  readonly metrics: CaseMetrics;
}

type VariantId = Brand<string, 'VariantId'>;

interface CaseEvent {
  readonly eventId: EventId;
  readonly activity: string;
  readonly timestamp: ISODateTime;
  readonly attributes: Record<string, unknown>;
}

interface CaseMetrics {
  readonly eventCount: number;
  readonly startTime: ISODateTime;
  readonly endTime: ISODateTime;
  readonly throughputTime: Duration;
  readonly waitingTime?: Duration;
  readonly processingTime?: Duration;
}

interface Variant {
  readonly id: VariantId;
  readonly dataModelId: DataModelId;
  readonly activitySequence: readonly string[];
  readonly hash: string;                        // For deduplication
  readonly caseCount: number;
  readonly frequency: Percentage;
  readonly avgThroughputTime: Duration;
  readonly minThroughputTime: Duration;
  readonly maxThroughputTime: Duration;
}
```

### Repository: ICaseRepository

```typescript
interface ICaseRepository {
  findById(
    modelId: DataModelId,
    caseId: string
  ): AsyncResult<Case | null>;
  
  findByModelId(
    modelId: DataModelId,
    options?: CaseQueryOptions
  ): AsyncResult<PaginatedResult<Case>>;
  
  findByVariant(
    modelId: DataModelId,
    variantId: VariantId,
    options?: QueryOptions
  ): AsyncResult<PaginatedResult<Case>>;
  
  getCaseEvents(
    modelId: DataModelId,
    caseId: string
  ): AsyncResult<readonly CaseEvent[]>;
  
  // Variants
  getVariants(
    modelId: DataModelId,
    options?: VariantQueryOptions
  ): AsyncResult<PaginatedResult<Variant>>;
  
  getVariantById(
    modelId: DataModelId,
    variantId: VariantId
  ): AsyncResult<Variant | null>;
  
  // Metrics
  getCaseMetrics(
    modelId: DataModelId,
    caseId: string
  ): AsyncResult<CaseMetrics>;
  
  getAggregatedMetrics(
    modelId: DataModelId,
    filters?: CaseFilter[]
  ): AsyncResult<AggregatedCaseMetrics>;
}

interface CaseQueryOptions extends QueryOptions {
  readonly variantIds?: readonly VariantId[];
  readonly dateRange?: DateRange;
  readonly minEvents?: number;
  readonly maxEvents?: number;
  readonly throughputTimeRange?: { min?: Duration; max?: Duration };
}

interface VariantQueryOptions extends QueryOptions {
  readonly minCaseCount?: number;
  readonly minFrequency?: Percentage;
  readonly containsActivity?: string;
  readonly startsWithActivity?: string;
  readonly endsWithActivity?: string;
}

interface AggregatedCaseMetrics {
  readonly totalCases: number;
  readonly totalEvents: number;
  readonly uniqueVariants: number;
  readonly avgThroughputTime: Duration;
  readonly medianThroughputTime: Duration;
  readonly percentile95ThroughputTime: Duration;
  readonly throughputTimeDistribution: readonly HistogramBucket[];
}

interface HistogramBucket {
  readonly min: number;
  readonly max: number;
  readonly count: number;
}
```

---

## PROCESS MODEL SUBLAYER

### Entity: ProcessModel

```typescript
/**
 * Discovered or imported process model.
 * Supports multiple formats aligned with PM4Py.
 */
interface ProcessModel {
  readonly id: ProcessModelId;
  readonly tenantId: TenantId;
  readonly dataModelId?: DataModelId;          // null if imported
  readonly name: string;
  readonly description?: string;
  readonly type: ProcessModelType;
  readonly source: ModelSource;
  readonly format: ModelFormat;
  readonly content: ProcessModelContent;
  readonly metadata: ProcessModelMetadata;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly createdBy: UserId;
}

type ModelSource = 'discovered' | 'imported' | 'designed';

type ModelFormat = 
  | 'petri_net' | 'process_tree' | 'bpmn' 
  | 'dfg' | 'ocel_net' | 'powl';

interface ProcessModelContent {
  // Petri Net (most common in PM4Py)
  readonly petriNet?: PetriNet;
  
  // Process Tree
  readonly processTree?: ProcessTree;
  
  // DFG
  readonly dfg?: DirectlyFollowsGraph;
  
  // BPMN
  readonly bpmn?: BPMNModel;
  
  // OC-PN (Object-Centric Petri Net)
  readonly ocelNet?: OCELPetriNet;
  
  // Serialized format for storage
  readonly serialized?: string;
  readonly serializationFormat?: 'json' | 'pnml' | 'bpmn_xml';
}

interface ProcessModelMetadata {
  readonly discoveryAlgorithm?: DiscoveryAlgorithm;
  readonly discoveryParameters?: Record<string, unknown>;
  readonly sourceEventCount?: number;
  readonly sourceCaseCount?: number;
  readonly discoveredAt?: ISODateTime;
  readonly qualityMetrics?: ModelQualityMetrics;
}

interface ModelQualityMetrics {
  readonly fitness?: number;
  readonly precision?: number;
  readonly generalization?: number;
  readonly simplicity?: number;
}
```

---

### PM4Py Process Model Types

```typescript
// ═══════════════════════════════════════════════════════════════
// PETRI NET (Core PM4Py representation)
// ═══════════════════════════════════════════════════════════════

interface PetriNet {
  readonly places: readonly Place[];
  readonly transitions: readonly Transition[];
  readonly arcs: readonly Arc[];
  readonly initialMarking: Marking;
  readonly finalMarkings: readonly Marking[];
}

interface Place {
  readonly id: string;
  readonly name?: string;
  readonly properties?: Record<string, unknown>;
}

interface Transition {
  readonly id: string;
  readonly name?: string;                      // null = silent/tau
  readonly label?: string;
  readonly isSilent: boolean;
  readonly properties?: Record<string, unknown>;
}

interface Arc {
  readonly id: string;
  readonly source: string;                     // Place or Transition ID
  readonly target: string;
  readonly weight: PositiveInt;
}

interface Marking {
  readonly tokens: Record<string, number>;     // Place ID -> token count
}

// ═══════════════════════════════════════════════════════════════
// PROCESS TREE
// ═══════════════════════════════════════════════════════════════

interface ProcessTree {
  readonly root: ProcessTreeNode;
}

interface ProcessTreeNode {
  readonly id: string;
  readonly type: ProcessTreeNodeType;
  readonly label?: string;                     // For leaf nodes
  readonly children?: readonly ProcessTreeNode[];
}

type ProcessTreeNodeType = 
  | 'sequence'      // →
  | 'xor'           // ×
  | 'parallel'      // +
  | 'loop'          // ↺
  | 'or'            // ∨
  | 'activity'      // Leaf
  | 'tau';          // Silent

// ═══════════════════════════════════════════════════════════════
// DIRECTLY-FOLLOWS GRAPH (DFG)
// ═══════════════════════════════════════════════════════════════

interface DirectlyFollowsGraph {
  readonly activities: readonly DFGActivity[];
  readonly edges: readonly DFGEdge[];
  readonly startActivities: Record<string, number>;
  readonly endActivities: Record<string, number>;
}

interface DFGActivity {
  readonly name: string;
  readonly frequency: number;
  readonly totalDuration?: Duration;
  readonly avgDuration?: Duration;
}

interface DFGEdge {
  readonly source: string;
  readonly target: string;
  readonly frequency: number;
  readonly performance?: EdgePerformance;
}

interface EdgePerformance {
  readonly avgDuration: Duration;
  readonly minDuration: Duration;
  readonly maxDuration: Duration;
  readonly medianDuration: Duration;
}

// ═══════════════════════════════════════════════════════════════
// BPMN MODEL
// ═══════════════════════════════════════════════════════════════

interface BPMNModel {
  readonly id: string;
  readonly name: string;
  readonly elements: readonly BPMNElement[];
  readonly flows: readonly BPMNFlow[];
}

interface BPMNElement {
  readonly id: string;
  readonly type: BPMNElementType;
  readonly name?: string;
  readonly position?: Position;
  readonly properties?: Record<string, unknown>;
}

type BPMNElementType = 
  | 'startEvent' | 'endEvent' | 'intermediateEvent'
  | 'task' | 'userTask' | 'serviceTask' | 'scriptTask'
  | 'exclusiveGateway' | 'parallelGateway' | 'inclusiveGateway'
  | 'subProcess' | 'callActivity';

interface BPMNFlow {
  readonly id: string;
  readonly sourceRef: string;
  readonly targetRef: string;
  readonly condition?: string;
}

interface Position {
  readonly x: number;
  readonly y: number;
  readonly width?: number;
  readonly height?: number;
}

// ═══════════════════════════════════════════════════════════════
// OBJECT-CENTRIC PETRI NET (OC-PN)
// ═══════════════════════════════════════════════════════════════

interface OCELPetriNet {
  readonly objectTypes: readonly string[];
  readonly places: readonly OCPlace[];
  readonly transitions: readonly OCTransition[];
  readonly arcs: readonly OCArc[];
}

interface OCPlace {
  readonly id: string;
  readonly name?: string;
  readonly objectType: string;                 // Associated object type
  readonly isInitial: boolean;
  readonly isFinal: boolean;
}

interface OCTransition {
  readonly id: string;
  readonly name?: string;
  readonly label?: string;
  readonly isSilent: boolean;
  readonly consumedObjectTypes: readonly string[];
  readonly producedObjectTypes: readonly string[];
}

interface OCArc {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly objectType: string;
  readonly isVariable: boolean;                // Variable arc
}
```

### Repository: IProcessModelRepository

```typescript
interface IProcessModelRepository {
  findById(id: ProcessModelId): AsyncResult<ProcessModel | null>;
  findByTenantId(tenantId: TenantId, options?: QueryOptions): AsyncResult<PaginatedResult<ProcessModel>>;
  findByDataModelId(dataModelId: DataModelId): AsyncResult<readonly ProcessModel[]>;
  
  create(data: CreateProcessModelData): AsyncResult<ProcessModel>;
  update(id: ProcessModelId, data: UpdateProcessModelData): AsyncResult<ProcessModel>;
  updateContent(id: ProcessModelId, content: ProcessModelContent): AsyncResult<ProcessModel>;
  updateMetrics(id: ProcessModelId, metrics: ModelQualityMetrics): AsyncResult<ProcessModel>;
  delete(id: ProcessModelId): AsyncResult<void>;
  
  // Format Conversion
  convertTo(id: ProcessModelId, targetFormat: ModelFormat): AsyncResult<ProcessModelContent>;
  
  // Export
  exportToPNML(id: ProcessModelId): AsyncResult<string>;
  exportToBPMN(id: ProcessModelId): AsyncResult<string>;
  exportToImage(id: ProcessModelId, format: 'svg' | 'png'): AsyncResult<Buffer>;
}
```

---

## Domain Events: Process Mining

```typescript
type DataPoolCreatedEvent = DomainEvent<{
  poolId: DataPoolId;
  tenantId: TenantId;
  name: string;
}>;

type TableImportedEvent = DomainEvent<{
  tableId: UUID;
  poolId: DataPoolId;
  rowCount: number;
  duration: Duration;
}>;

type DataModelCreatedEvent = DomainEvent<{
  modelId: DataModelId;
  poolId: DataPoolId;
  type: DataModelType;
}>;

type DataModelLoadStartedEvent = DomainEvent<{
  modelId: DataModelId;
  triggeredBy: UserId | 'system';
}>;

type DataModelLoadCompletedEvent = DomainEvent<{
  modelId: DataModelId;
  eventCount: number;
  duration: Duration;
  statistics: DataModelStatistics;
}>;

type DataModelLoadFailedEvent = DomainEvent<{
  modelId: DataModelId;
  error: string;
  stage: string;
}>;

type ProcessDiscoveredEvent = DomainEvent<{
  modelId: ProcessModelId;
  dataModelId: DataModelId;
  algorithm: DiscoveryAlgorithm;
  format: ModelFormat;
  duration: Duration;
}>;

type ConformanceCheckedEvent = DomainEvent<{
  dataModelId: DataModelId;
  processModelId: ProcessModelId;
  method: ConformanceMethod;
  fitness: number;
  duration: Duration;
}>;
```
