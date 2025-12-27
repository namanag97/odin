# AI DEVELOPER IMPLEMENTATION GUIDE
> Master reference for implementing the Process Mining SaaS platform

---

## IMPLEMENTATION PHASES

```
Phase 1: Foundation (Weeks 1-4)
├── L0 Core Layer
├── Database Schema
├── Basic Auth
└── File Storage

Phase 2: Data Layer (Weeks 5-8)
├── Data Pools & Tables
├── Data Import Pipeline
├── Data Models (OCEL)
└── PM4Py Integration

Phase 3: Process Mining (Weeks 9-12)
├── Process Discovery
├── Conformance Checking
├── Analytics Services
└── Visualization

Phase 4: Studio (Weeks 13-16)
├── Knowledge Models
├── Views & Components
├── Action Flows
└── Skills & Signals

Phase 5: Enterprise (Weeks 17-20)
├── Multi-tenancy
├── Billing Integration
├── Advanced Security
└── Audit & Compliance
```

---

## CONTRACT USAGE RULES

### Rule 1: Contract First Development
```
1. Read the contract interface
2. Understand input/output DTOs
3. Implement to the exact signature
4. Never add unlisted methods
5. Never modify DTO shapes
```

### Rule 2: Error Handling Pattern
```typescript
// ALWAYS return Result<T, E>, never throw
async function createDataPool(
  input: CreateDataPoolInput,
  ctx: OperationContext
): AsyncResult<DataPool> {
  // Validate input
  const validation = validateInput(input);
  if (!validation.valid) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid input',
        violations: validation.errors,
        timestamp: ctx.timestamp,
        traceId: ctx.traceId
      }
    };
  }
  
  try {
    const pool = await repository.create(input);
    return { success: true, data: pool };
  } catch (e) {
    return {
      success: false,
      error: mapDatabaseError(e, ctx)
    };
  }
}
```

### Rule 3: Context Propagation
```typescript
// ALWAYS pass context through the call chain
class DataPoolService implements IDataPoolService {
  async createDataPool(
    input: CreateDataPoolInput,
    ctx: OperationContext
  ): AsyncResult<DataPool> {
    // Log with context
    this.logger.withContext(ctx).info('Creating data pool', { name: input.name });
    
    // Pass context to repository
    const result = await this.repository.create(input, ctx);
    
    // Emit event with context metadata
    await this.eventBus.publish({
      type: 'DataPoolCreated',
      aggregateType: 'DataPool',
      aggregateId: result.id,
      payload: { poolId: result.id, name: result.name },
      metadata: {
        tenantId: ctx.auth.tenantId,
        userId: ctx.auth.userId,
        traceId: ctx.traceId,
        correlationId: ctx.correlationId
      },
      occurredAt: ctx.timestamp,
      version: 1
    });
    
    return { success: true, data: result };
  }
}
```

### Rule 4: Multi-Tenancy Enforcement
```typescript
// ALWAYS scope queries by tenantId
class DataPoolRepository implements IDataPoolRepository {
  async findById(id: DataPoolId, ctx: OperationContext): AsyncResult<DataPool | null> {
    // ALWAYS include tenant filter
    const pool = await this.db.query(
      'SELECT * FROM data_pools WHERE id = ? AND tenant_id = ?',
      [id, ctx.auth.tenantId]
    );
    return { success: true, data: pool };
  }
  
  // NEVER do this:
  // async findById(id: DataPoolId): AsyncResult<DataPool | null> {
  //   const pool = await this.db.query('SELECT * FROM data_pools WHERE id = ?', [id]);
  // }
}
```

### Rule 5: Permission Checking
```typescript
// Check permissions BEFORE business logic
class ViewService implements IViewService {
  async updateView(
    input: UpdateViewInput,
    ctx: OperationContext
  ): AsyncResult<View> {
    // 1. Check permission
    const hasPermission = ctx.auth.permissions.some(
      p => p.resource === 'view' && 
           (p.action === 'update' || p.action === 'manage') &&
           (p.scope === 'tenant' || this.isOwner(input.id, ctx.auth.userId))
    );
    
    if (!hasPermission) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Insufficient permissions to update view',
          timestamp: ctx.timestamp,
          traceId: ctx.traceId
        }
      };
    }
    
    // 2. Execute business logic
    // ...
  }
}
```

---

## PM4PY INTEGRATION PATTERNS

### Pattern 1: Event Log Loading
```typescript
// Service Layer
class ProcessDiscoveryService implements IProcessDiscoveryService {
  constructor(
    private pm4py: IPM4PyAdapter,
    private dataModelRepo: IDataModelRepository,
    private cache: ICacheService
  ) {}
  
  async discoverProcess(
    input: DiscoverProcessInput,
    ctx: OperationContext
  ): AsyncResult<DiscoveryResult> {
    // 1. Get data model configuration
    const modelResult = await this.dataModelRepo.findById(input.dataModelId);
    if (!modelResult.success) return modelResult;
    
    // 2. Load event log into PM4Py
    const eventData = await this.fetchEventData(modelResult.data, input.filters);
    const handleResult = await this.pm4py.loadEventLog({
      data: { type: 'dataframe', rows: eventData.rows, columns: eventData.columns },
      caseIdColumn: modelResult.data.configuration.caseCentric!.caseIdColumn,
      activityColumn: modelResult.data.configuration.caseCentric!.activityColumn,
      timestampColumn: modelResult.data.configuration.caseCentric!.timestampColumn
    });
    
    if (!handleResult.success) return handleResult;
    
    try {
      // 3. Execute discovery algorithm
      const discoveryResult = await this.executeDiscovery(
        handleResult.data,
        input.algorithm,
        input.parameters
      );
      
      // 4. Convert and return
      return {
        success: true,
        data: this.mapToDiscoveryResult(discoveryResult, input)
      };
    } finally {
      // 5. ALWAYS cleanup handle
      await this.pm4py.disposeHandle(handleResult.data);
    }
  }
}
```

### Pattern 2: Algorithm Selection
```typescript
private async executeDiscovery(
  handle: EventLogHandle,
  algorithm: DiscoveryAlgorithm,
  params?: DiscoveryParameters
): AsyncResult<PetriNetResult | ProcessTreeResult> {
  switch (algorithm) {
    case 'alpha':
      return this.pm4py.discoverAlpha({ eventLogHandle: handle });
    
    case 'alpha_plus':
      return this.pm4py.discoverAlphaPlus({ eventLogHandle: handle });
    
    case 'inductive':
      return this.pm4py.discoverInductive({
        eventLogHandle: handle,
        noiseThreshold: params?.noiseThreshold ?? 0.0
      });
    
    case 'inductive_infrequent':
      return this.pm4py.discoverInductiveInfrequent({
        eventLogHandle: handle,
        noiseThreshold: params?.noiseThreshold ?? 0.2
      });
    
    case 'heuristic':
      return this.pm4py.discoverHeuristic({
        eventLogHandle: handle,
        dependencyThreshold: params?.dependencyThreshold,
        andThreshold: params?.andThreshold,
        loopTwoThreshold: params?.loopTwoThreshold
      });
    
    case 'ilp':
      return this.pm4py.discoverILP({ eventLogHandle: handle });
    
    default:
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: `Unknown algorithm: ${algorithm}`,
          timestamp: new Date().toISOString(),
          traceId: ''
        }
      };
  }
}
```

### Pattern 3: OCEL Handling
```typescript
class OCELAnalyticsService implements IOCELAnalyticsService {
  async getObjectLifecycle(
    input: ObjectLifecycleInput,
    ctx: OperationContext
  ): AsyncResult<ObjectLifecycleDetails> {
    // 1. Load OCEL from database
    const ocelData = await this.loadOCELData(input.dataModelId, ctx);
    
    // 2. Load into PM4Py
    const handleResult = await this.pm4py.loadOCEL({
      format: 'json',
      content: JSON.stringify(ocelData)
    });
    
    if (!handleResult.success) return handleResult;
    
    try {
      // 3. Get object-specific events
      const events = await this.queryObjectEvents(
        handleResult.data,
        input.objectType,
        input.objectId
      );
      
      // 4. Compute lifecycle metrics
      const lifecycle = this.computeLifecycle(events);
      
      return {
        success: true,
        data: lifecycle
      };
    } finally {
      await this.pm4py.disposeHandle(handleResult.data);
    }
  }
}
```

---

## DATABASE SCHEMA PATTERNS

### Pattern 1: Multi-Tenant Tables
```sql
-- EVERY table MUST have tenant_id
CREATE TABLE data_pools (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Unique name per tenant
  UNIQUE(tenant_id, name)
);

-- ALWAYS create tenant_id index
CREATE INDEX idx_data_pools_tenant ON data_pools(tenant_id);

-- Row-Level Security
ALTER TABLE data_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON data_pools
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### Pattern 2: Soft Delete
```sql
CREATE TABLE packages (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  -- ... other columns
  deleted_at TIMESTAMPTZ,  -- NULL = not deleted
  
  -- Exclude deleted from unique constraints
  UNIQUE(tenant_id, name) WHERE deleted_at IS NULL
);

-- Default to not showing deleted
CREATE VIEW active_packages AS
  SELECT * FROM packages WHERE deleted_at IS NULL;
```

### Pattern 3: Audit Triggers
```sql
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    tenant_id,
    action_type,
    resource_type,
    resource_id,
    actor_id,
    changes,
    timestamp
  ) VALUES (
    COALESCE(NEW.tenant_id, OLD.tenant_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    current_setting('app.current_user_id', true)::UUID,
    jsonb_build_object(
      'before', row_to_json(OLD),
      'after', row_to_json(NEW)
    ),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER data_pools_audit
  AFTER INSERT OR UPDATE OR DELETE ON data_pools
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

---

## CACHING STRATEGIES

### Strategy 1: Entity Caching
```typescript
class CachedDataModelRepository implements IDataModelRepository {
  constructor(
    private repository: IDataModelRepository,
    private cache: ICacheService
  ) {}
  
  async findById(id: DataModelId, ctx: OperationContext): AsyncResult<DataModel | null> {
    const cacheKey = `entity:data_model:${id}`;
    
    // Try cache first
    const cached = await this.cache.get<DataModel>(cacheKey, ctx);
    if (cached.success && cached.data) {
      return { success: true, data: cached.data };
    }
    
    // Fetch from DB
    const result = await this.repository.findById(id, ctx);
    if (result.success && result.data) {
      // Cache for 5 minutes
      await this.cache.set({
        key: cacheKey,
        value: result.data,
        ttl: 5 * 60 * 1000,
        tags: [`tenant:${ctx.auth.tenantId}`, 'data_model']
      }, ctx);
    }
    
    return result;
  }
}
```

### Strategy 2: Computed Result Caching
```typescript
class CachedProcessDiscoveryService {
  async discoverDFG(
    input: DiscoverDFGInput,
    ctx: OperationContext
  ): AsyncResult<DFGResult> {
    // Create cache key from input hash
    const inputHash = this.hashInput(input);
    const cacheKey = `computed:dfg:${input.dataModelId}:${inputHash}`;
    
    // Use cache-aside pattern
    return this.cache.getOrSet({
      key: cacheKey,
      factory: () => this.service.discoverDFG(input, ctx),
      ttl: 30 * 60 * 1000,  // 30 minutes
      tags: [
        `tenant:${ctx.auth.tenantId}`,
        `data_model:${input.dataModelId}`,
        'dfg'
      ]
    }, ctx);
  }
}
```

### Strategy 3: Cache Invalidation
```typescript
// On data model reload, invalidate all related caches
class DataModelService {
  async loadDataModel(
    input: LoadDataModelInput,
    ctx: OperationContext
  ): AsyncResult<LoadJob> {
    // ... load logic
    
    // Invalidate all caches for this model
    await this.cache.invalidateByTags([
      `data_model:${input.dataModelId}`
    ], ctx);
    
    // ... return result
  }
}
```

---

## JOB QUEUE PATTERNS

### Pattern 1: Long-Running Jobs
```typescript
// Controller/API Layer
async importTable(req: Request): Promise<Response> {
  // Enqueue job, return immediately
  const job = await this.jobQueue.enqueue({
    queue: 'data-import',
    type: 'import_csv',
    payload: {
      tableId: req.body.tableId,
      fileId: req.body.fileId,
      options: req.body.options
    },
    priority: 3,
    timeout: 30 * 60 * 1000  // 30 minutes
  }, req.ctx);
  
  return {
    status: 202,
    body: { jobId: job.id, status: job.status }
  };
}

// Job Handler (Worker)
class ImportJobHandler {
  async handle(job: QueuedJob): Promise<void> {
    const { tableId, fileId, options } = job.payload;
    
    // Report progress
    await this.updateProgress(job.id, { percentage: 0, stage: 'downloading' });
    
    const file = await this.fileStorage.downloadFile(fileId);
    await this.updateProgress(job.id, { percentage: 10, stage: 'parsing' });
    
    const rows = await this.parseFile(file, options);
    const totalRows = rows.length;
    
    // Batch import with progress
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await this.tableService.importBatch(tableId, batch);
      
      const progress = Math.floor(((i + batch.length) / totalRows) * 90) + 10;
      await this.updateProgress(job.id, { 
        percentage: progress, 
        stage: 'importing',
        current: i + batch.length,
        total: totalRows
      });
    }
    
    await this.updateProgress(job.id, { percentage: 100, stage: 'complete' });
  }
}
```

### Pattern 2: Job Dependencies
```typescript
// Data model load requires table import to complete first
async scheduleDataModelLoad(modelId: DataModelId): Promise<void> {
  const model = await this.dataModelRepo.findById(modelId);
  const tables = model.configuration.objectCentric?.objectTypes ?? [];
  
  // First: enqueue table refreshes
  const tableJobs = await Promise.all(
    tables.map(t => this.jobQueue.enqueue({
      queue: 'data-import',
      type: 'refresh_table',
      payload: { tableId: t.tableId }
    }))
  );
  
  // Then: enqueue model load with dependency
  await this.jobQueue.enqueue({
    queue: 'data-model-load',
    type: 'load_data_model',
    payload: { modelId },
    dependsOn: tableJobs.map(j => j.id)
  });
}
```

---

## FILE STRUCTURE

```
src/
├── core/                          # L0 Core Layer
│   ├── types/
│   │   ├── primitives.ts          # Branded types, UUID, DateTime
│   │   ├── result.ts              # Result<T,E> monad
│   │   ├── pagination.ts          # Pagination types
│   │   └── index.ts
│   ├── errors/
│   │   ├── app-error.ts           # Base error
│   │   ├── domain-errors.ts       # Domain-specific errors
│   │   └── index.ts
│   ├── interfaces/
│   │   ├── logger.ts
│   │   ├── event-bus.ts
│   │   ├── cache.ts
│   │   └── index.ts
│   └── index.ts
│
├── domain/                        # L1 Domain Layer
│   ├── existence/                 # Existence layer entities
│   │   ├── tenant/
│   │   │   ├── tenant.entity.ts
│   │   │   ├── tenant.repository.ts
│   │   │   └── tenant.events.ts
│   │   └── organization/
│   ├── identity/                  # Identity layer
│   │   ├── user/
│   │   ├── role/
│   │   └── session/
│   ├── commercial/                # Commercial layer
│   │   ├── plan/
│   │   ├── subscription/
│   │   └── invoice/
│   ├── process-mining/            # Core domain
│   │   ├── data-pool/
│   │   ├── data-model/
│   │   ├── process-model/
│   │   └── ocel/
│   └── studio/
│       ├── knowledge-model/
│       ├── view/
│       └── action-flow/
│
├── services/                      # L2 Service Layer
│   ├── auth/
│   │   ├── auth.service.ts
│   │   └── auth.service.test.ts
│   ├── data-pool/
│   ├── data-model/
│   ├── process-discovery/
│   ├── conformance/
│   └── ...
│
├── infrastructure/                # Infrastructure implementations
│   ├── database/
│   │   ├── migrations/
│   │   ├── repositories/
│   │   └── connection.ts
│   ├── cache/
│   │   └── redis.cache.ts
│   ├── queue/
│   │   └── bull.queue.ts
│   ├── storage/
│   │   └── s3.storage.ts
│   ├── pm4py/
│   │   ├── pm4py.adapter.ts
│   │   └── pm4py.pool.ts
│   └── ...
│
├── api/                           # L3 API Layer
│   ├── rest/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.ts
│   ├── graphql/                   # Optional
│   └── websocket/                 # For real-time updates
│
└── workers/                       # Background job handlers
    ├── import.worker.ts
    ├── discovery.worker.ts
    └── ...
```

---

## TESTING REQUIREMENTS

```typescript
// Every service method MUST have tests for:
// 1. Happy path
// 2. Validation errors
// 3. Not found errors
// 4. Permission denied
// 5. Multi-tenant isolation

describe('DataPoolService', () => {
  describe('createDataPool', () => {
    it('should create a data pool with valid input', async () => {
      const result = await service.createDataPool(validInput, ctx);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe(validInput.name);
    });
    
    it('should reject invalid name', async () => {
      const result = await service.createDataPool({ name: '' }, ctx);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_FAILED');
    });
    
    it('should reject duplicate name in same tenant', async () => {
      await service.createDataPool({ name: 'existing' }, ctx);
      const result = await service.createDataPool({ name: 'existing' }, ctx);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('ENTITY_ALREADY_EXISTS');
    });
    
    it('should allow same name in different tenant', async () => {
      await service.createDataPool({ name: 'shared' }, tenantACtx);
      const result = await service.createDataPool({ name: 'shared' }, tenantBCtx);
      expect(result.success).toBe(true);
    });
    
    it('should require create permission', async () => {
      const result = await service.createDataPool(validInput, viewerCtx);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });
  });
});
```

---

## DEPLOYMENT CHECKLIST

```
□ All contracts implemented exactly as specified
□ Multi-tenancy enforced at database level (RLS)
□ All service methods return Result<T,E>
□ Context propagated through all layers
□ PM4Py adapter pooling configured
□ Job queues for long-running operations
□ Cache invalidation on mutations
□ Audit logging for all mutations
□ Rate limiting per tenant
□ Health checks for all dependencies
□ Metrics and tracing instrumented
□ Error handling returns proper codes
□ API versioning implemented
□ Webhook signatures verified
□ Input validation on all endpoints
```
