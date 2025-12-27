# DOMAIN-DRIVEN DESIGN ARCHITECTURE
> Process Mining SaaS — Strategic & Tactical Design

---

## STRATEGIC DESIGN

### Domain Vision Statement
```
A multi-tenant process mining platform that enables organizations to 
discover, analyze, and optimize their business processes using 
object-centric event logs (OCEL 2.0) and PM4Py algorithms, with 
self-service analytics, automated monitoring, and actionable insights.
```

---

## BOUNDED CONTEXTS

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PLATFORM DOMAIN                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │    IDENTITY     │  │   COMMERCIAL    │  │   OPERATIONAL   │         │
│  │    CONTEXT      │  │    CONTEXT      │  │    CONTEXT      │         │
│  │                 │  │                 │  │                 │         │
│  │ • Tenant        │  │ • Plan          │  │ • FeatureFlag   │         │
│  │ • Organization  │  │ • Subscription  │  │ • SystemConfig  │         │
│  │ • User          │  │ • Invoice       │  │ • TenantSettings│         │
│  │ • Role          │  │ • Payment       │  │                 │         │
│  │ • Session       │  │ • Usage         │  │                 │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                            CORE DOMAIN                                   │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │      DATA INTEGRATION           │  │     PROCESS MINING          │  │
│  │         CONTEXT                 │  │        CONTEXT              │  │
│  │                                 │  │                             │  │
│  │ • DataPool (Aggregate Root)     │  │ • DataModel (Aggregate Root)│  │
│  │ • Table                         │  │ • OCELEvent                 │  │
│  │ • Column                        │  │ • OCELObject                │  │
│  │ • DataConnection                │  │ • Case                      │  │
│  │ • ImportJob                     │  │ • Variant                   │  │
│  │                                 │  │ • ProcessModel              │  │
│  └─────────────────────────────────┘  └─────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │        ANALYTICS                │  │       CONFORMANCE           │  │
│  │         CONTEXT                 │  │        CONTEXT              │  │
│  │                                 │  │                             │  │
│  │ • KnowledgeModel (Agg Root)     │  │ • ConformanceCheck          │  │
│  │ • KPI                           │  │ • Alignment                 │  │
│  │ • Record                        │  │ • Deviation                 │  │
│  │ • Filter                        │  │ • QualityMetrics            │  │
│  │ • EventLogConfig                │  │                             │  │
│  └─────────────────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          SUPPORTING DOMAIN                               │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │          STUDIO                 │  │       AUTOMATION            │  │
│  │          CONTEXT                │  │        CONTEXT              │  │
│  │                                 │  │                             │  │
│  │ • Package (Aggregate Root)      │  │ • ActionFlow (Agg Root)     │  │
│  │ • Space                         │  │ • Module                    │  │
│  │ • View                          │  │ • Execution                 │  │
│  │ • Component                     │  │ • Skill (Aggregate Root)    │  │
│  │ • Tab                           │  │ • Sensor                    │  │
│  │                                 │  │ • Signal                    │  │
│  │                                 │  │ • Task                      │  │
│  └─────────────────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          GENERIC SUBDOMAINS                              │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐ │
│  │   AUDIT       │ │ INTEGRATION   │ │ NOTIFICATION  │ │  SCHEDULING │ │
│  │   CONTEXT     │ │   CONTEXT     │ │   CONTEXT     │ │   CONTEXT   │ │
│  │               │ │               │ │               │ │             │ │
│  │ • AuditLog    │ │ • ApiKey      │ │ • Notification│ │ • Schedule  │ │
│  │ • EntityHist  │ │ • Webhook     │ │ • Template    │ │ • Job       │ │
│  │ • Compliance  │ │ • Integration │ │ • Channel     │ │ • Execution │ │
│  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## CONTEXT MAP

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CONTEXT RELATIONSHIPS                           │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │  IDENTITY   │
                    │  (Upstream) │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │ U            │ U            │ U
            │              │              │
     ┌──────▼─────┐ ┌──────▼──────┐ ┌─────▼──────┐
     │ COMMERCIAL │ │    DATA     │ │   STUDIO   │
     │            │ │ INTEGRATION │ │            │
     └──────┬─────┘ └──────┬──────┘ └─────┬──────┘
            │              │              │
            │         ┌────▼────┐         │
            │         │ PROCESS │         │
            │         │ MINING  │◄────────┘
            │         │ (Core)  │    Partnership
            │         └────┬────┘
            │              │
            │    ┌─────────┼─────────┐
            │    │ U       │ U       │ U
            │    │         │         │
            │ ┌──▼───┐ ┌───▼────┐ ┌──▼────────┐
            │ │ANALYT│ │CONFORM-│ │AUTOMATION │
            │ │ ICS  │ │ ANCE   │ │           │
            │ └──────┘ └────────┘ └───────────┘
            │
     ┌──────▼──────┐
     │   AUDIT     │ ◄─── All contexts publish to Audit
     │ (Downstream)│
     └─────────────┘

LEGEND:
─────────────────────────────────────
U = Upstream (provides data/services)
D = Downstream (consumes)
◄─── = Conformist (follows upstream model)
←→ = Partnership (mutual collaboration)
```

### Relationship Types

| Upstream | Downstream | Relationship | Description |
|----------|------------|--------------|-------------|
| Identity | All | **Customer/Supplier** | Identity provides auth context to all |
| Data Integration | Process Mining | **Customer/Supplier** | Data feeds mining |
| Process Mining | Analytics | **Partnership** | Shared event/case model |
| Process Mining | Conformance | **Shared Kernel** | Share ProcessModel |
| Studio | Process Mining | **Conformist** | Studio consumes PM models |
| Automation | Process Mining | **Conformist** | Skills monitor PM data |
| All | Audit | **Published Language** | Standardized audit events |

---

## AGGREGATES & BOUNDARIES

### 1. IDENTITY CONTEXT

```
┌─────────────────────────────────────────────────────────────┐
│ TENANT AGGREGATE                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Tenant (Root)                                           │ │
│ │ ├── TenantSettings (Value Object)                       │ │
│ │ ├── TenantMetadata (Value Object)                       │ │
│ │ └── TenantFeatures (Value Object)                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Invariants:                                                 │
│ • Slug must be unique globally                              │
│ • Settings must respect tier limits                         │
│ • Cannot delete with active subscriptions                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ USER AGGREGATE                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ User (Root)                                             │ │
│ │ ├── UserProfile (Entity)                                │ │
│ │ ├── UserPreferences (Value Object)                      │ │
│ │ └── MfaDevice[] (Entity)                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Invariants:                                                 │
│ • Email unique per tenant                                   │
│ • At least one MFA device if MFA enabled                    │
│ • Password meets tenant policy                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SESSION AGGREGATE                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Session (Root)                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Invariants:                                                 │
│ • Must reference valid User                                 │
│ • ExpiresAt > CreatedAt                                     │
│ • Cannot modify after revoked                               │
└─────────────────────────────────────────────────────────────┘
```

### 2. DATA INTEGRATION CONTEXT

```
┌─────────────────────────────────────────────────────────────┐
│ DATA POOL AGGREGATE                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ DataPool (Root)                                         │ │
│ │ ├── DataPoolSettings (Value Object)                     │ │
│ │ ├── DataPoolStatistics (Value Object)                   │ │
│ │ ├── Table[] (Entity)                                    │ │
│ │ │   ├── Column[] (Value Object)                         │ │
│ │ │   └── ColumnStatistics (Value Object)                 │ │
│ │ └── DataConnection[] (Entity)                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Invariants:                                                 │
│ • Name unique per tenant                                    │
│ • Table names unique within pool                            │
│ • Column names unique within table                          │
│ • Cannot delete pool with dependent DataModels              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ IMPORT JOB AGGREGATE                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ImportJob (Root)                                        │ │
│ │ ├── ImportProgress (Value Object)                       │ │
│ │ └── ImportResult (Value Object)                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Invariants:                                                 │
│ • Status transitions: queued→running→completed/failed       │
│ • Cannot modify completed job                               │
└─────────────────────────────────────────────────────────────┘
```

### 3. PROCESS MINING CONTEXT (Core Domain)

```
┌─────────────────────────────────────────────────────────────┐
│ DATA MODEL AGGREGATE (Central to Domain)                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ DataModel (Root)                                        │ │
│ │ ├── DataModelConfiguration (Value Object)               │ │
│ │ │   ├── CaseCentricConfig (Value Object)                │ │
│ │ │   └── ObjectCentricConfig (Value Object)              │ │
│ │ │       └── ObjectTypeConfig[] (Value Object)           │ │
│ │ └── DataModelStatistics (Value Object)                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Invariants:                                                 │
│ • Must have valid DataPool reference                        │
│ • Type (case/object-centric) immutable after creation       │
│ • Config must reference existing tables                     │
│ • Cannot load without complete configuration                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PROCESS MODEL AGGREGATE                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ProcessModel (Root)                                     │ │
│ │ ├── ProcessModelContent (Value Object)                  │ │
│ │ │   ├── PetriNet (Value Object)                         │ │
│ │ │   │   ├── Place[] (Value Object)                      │ │
│ │ │   │   ├── Transition[] (Value Object)                 │ │
│ │ │   │   ├── Arc[] (Value Object)                        │ │
│ │ │   │   └── Marking (Value Object)                      │ │
│ │ │   ├── ProcessTree (Value Object)                      │ │
│ │ │   ├── DirectlyFollowsGraph (Value Object)             │ │
│ │ │   ├── BPMNModel (Value Object)                        │ │
│ │ │   └── OCELPetriNet (Value Object)                     │ │
│ │ ├── ProcessModelMetadata (Value Object)                 │ │
│ │ └── ModelQualityMetrics (Value Object)                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Invariants:                                                 │
│ • Content must match declared format                        │
│ • Quality metrics only for discovered models                │
│ • Source (discovered/imported) immutable                    │
└─────────────────────────────────────────────────────────────┘

NOTE: Events, Objects, Cases, Variants are READ MODELS
      They are computed/queried, not stored as aggregates
```

### 4. ANALYTICS CONTEXT

```
┌─────────────────────────────────────────────────────────────┐
│ KNOWLEDGE MODEL AGGREGATE                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ KnowledgeModel (Root)                                   │ │
│ │ ├── KPI[] (Entity)                                      │ │
│ │ │   ├── KPIExpression (Value Object)                    │ │
│ │ │   ├── KPIFormat (Value Object)                        │ │
│ │ │   └── KPIThresholds (Value Object)                    │ │
│ │ ├── Record[] (Entity)                                   │ │
│ │ │   └── RecordAttribute[] (Value Object)                │ │
│ │ ├── Filter[] (Entity)                                   │ │
│ │ │   └── FilterConfig (Value Object)                     │ │
│ │ ├── Variable[] (Entity)                                 │ │
│ │ │   └── VariableValidation (Value Object)               │ │
│ │ └── EventLogConfig[] (Entity)                           │ │
│ │     └── EventLogConfigDetails (Value Object)            │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Invariants:                                                 │
│ • Must reference valid DataModel                            │
│ • KPI names unique within KM                                │
│ • Record must reference valid object type                   │
│ • Extension KM cannot override base KPIs                    │
│ • Cannot publish with validation errors                     │
└─────────────────────────────────────────────────────────────┘
```

### 5. STUDIO CONTEXT

```
┌─────────────────────────────────────────────────────────────┐
│ PACKAGE AGGREGATE                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Package (Root)                                          │ │
│ │ ├── PackageSettings (Value Object)                      │ │
│ │ └── PackageStatistics (Value Object)                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Contains references to: View[], KnowledgeModel[], ActionFlow│
│ Invariants:                                                 │
│ • Name unique within Space                                  │
│ • Cannot delete published package                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ VIEW AGGREGATE                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ View (Root)                                             │ │
│ │ ├── ViewLayout (Value Object)                           │ │
│ │ ├── ViewSettings (Value Object)                         │ │
│ │ ├── Tab[] (Entity)                                      │ │
│ │ ├── Component[] (Entity)                                │ │
│ │ │   ├── ComponentPosition (Value Object)                │ │
│ │ │   ├── ComponentConfig (Value Object)                  │ │
│ │ │   ├── DataBinding (Value Object)                      │ │
│ │ │   └── InteractivityConfig (Value Object)              │ │
│ │ └── Variable[] (Entity) - view-scoped                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Invariants:                                                 │
│ • Must reference valid KnowledgeModel                       │
│ • Key unique within Package                                 │
│ • Components must have valid positions                      │
│ • Tab components must reference existing tab                │
└─────────────────────────────────────────────────────────────┘
```

### 6. AUTOMATION CONTEXT

```
┌─────────────────────────────────────────────────────────────┐
│ ACTION FLOW AGGREGATE                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ActionFlow (Root)                                       │ │
│ │ ├── ActionFlowTrigger (Value Object)                    │ │
│ │ ├── ActionFlowInput[] (Value Object)                    │ │
│ │ ├── ActionFlowOutput[] (Value Object)                   │ │
│ │ ├── ErrorHandlingConfig (Value Object)                  │ │
│ │ ├── ActionFlowStatistics (Value Object)                 │ │
│ │ └── Module[] (Entity)                                   │ │
│ │     ├── ModuleConfig (Value Object)                     │ │
│ │     ├── InputMapping[] (Value Object)                   │ │
│ │     ├── OutputMapping[] (Value Object)                  │ │
│ │     └── ModuleCondition (Value Object)                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Invariants:                                                 │
│ • Module order must be contiguous                           │
│ • Input mappings must reference valid sources               │
│ • Cannot activate with validation errors                    │
│ • Status: draft→active→paused (reversible)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ EXECUTION AGGREGATE                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Execution (Root)                                        │ │
│ │ ├── ExecutionTrigger (Value Object)                     │ │
│ │ ├── ExecutionStep[] (Entity)                            │ │
│ │ │   └── ExecutionError (Value Object)                   │ │
│ │ └── ExecutionError (Value Object)                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Invariants:                                                 │
│ • Status: pending→running→completed/failed/cancelled        │
│ • Steps must match ActionFlow modules                       │
│ • Immutable after completion                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SKILL AGGREGATE                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Skill (Root)                                            │ │
│ │ ├── SkillSettings (Value Object)                        │ │
│ │ ├── SkillStatistics (Value Object)                      │ │
│ │ ├── Sensor (Entity) - exactly one                       │ │
│ │ │   └── SensorConfig (Value Object)                     │ │
│ │ └── SkillAction[] (Entity)                              │ │
│ │     └── SkillActionConfig (Value Object)                │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Invariants:                                                 │
│ • Must have exactly one Sensor                              │
│ • Sensor must reference valid KnowledgeModel                │
│ • At least one SkillAction required                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SIGNAL AGGREGATE                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Signal (Root)                                           │ │
│ │ ├── AffectedObject[] (Value Object)                     │ │
│ │ ├── SignalContext (Value Object)                        │ │
│ │ └── ExecutedAction[] (Value Object)                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Invariants:                                                 │
│ • Status: open→acknowledged→in_progress→resolved            │
│ • Cannot reopen resolved signal                             │
│ • Snooze has expiration                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TASK AGGREGATE                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Task (Root)                                             │ │
│ │ ├── TaskContext (Value Object)                          │ │
│ │ └── TaskComment[] (Entity)                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Invariants:                                                 │
│ • Status follows TaskType workflow                          │
│ • DueDate must be in future on creation                     │
│ • Assignee must be valid User                               │
└─────────────────────────────────────────────────────────────┘
```

---

## VALUE OBJECTS

```typescript
// ═══════════════════════════════════════════════════════════════
// IDENTITY VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════
Email           // Validated email format
Password        // Hashed, meets policy
Slug            // URL-safe identifier

// ═══════════════════════════════════════════════════════════════
// TEMPORAL VALUE OBJECTS  
// ═══════════════════════════════════════════════════════════════
ISODateTime     // ISO 8601 timestamp
Duration        // Milliseconds
DateRange       // Start + End
TimeWindow      // Value + Unit

// ═══════════════════════════════════════════════════════════════
// PROCESS MINING VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════
ActivitySequence    // Ordered list of activities (Variant)
Marking             // Token distribution in Petri Net
Place               // Petri Net place
Transition          // Petri Net transition (can be silent)
Arc                 // Connection with weight
DFGEdge             // From→To with frequency
EdgePerformance     // Duration statistics

// ═══════════════════════════════════════════════════════════════
// ANALYTICS VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════
KPIExpression       // Computation definition
KPIFormat           // Display formatting
FilterConfig        // Filter parameters
AttributeMapping    // Column to attribute
MetricValue         // Statistical summary (avg, min, max, etc.)

// ═══════════════════════════════════════════════════════════════
// STUDIO VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════
ComponentPosition   // x, y, width, height
DataBinding         // What data to show
StyleConfig         // Visual styling
ChartConfig         // Chart-specific settings

// ═══════════════════════════════════════════════════════════════
// CONFORMANCE VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════
Alignment           // Log-Model alignment
AlignmentMove       // Single move (sync/log/model)
Deviation           // Non-conformant behavior
CostFunction        // Move costs
```

---

## DOMAIN EVENTS

```typescript
// ═══════════════════════════════════════════════════════════════
// IDENTITY CONTEXT EVENTS
// ═══════════════════════════════════════════════════════════════
TenantCreated           { tenantId, slug, tier }
TenantSuspended         { tenantId, reason }
TenantTierChanged       { tenantId, from, to }

UserCreated             { userId, email, authMethod }
UserAuthenticated       { userId, sessionId, method }
UserPasswordChanged     { userId }
SessionRevoked          { sessionId, reason }
RoleAssigned            { userId, roleId }
MfaEnabled              { userId, deviceType }

// ═══════════════════════════════════════════════════════════════
// DATA INTEGRATION CONTEXT EVENTS
// ═══════════════════════════════════════════════════════════════
DataPoolCreated         { poolId, name }
DataPoolDeleted         { poolId }

TableCreated            { tableId, poolId, name }
TableDataImported       { tableId, rowCount, duration }
TableDeleted            { tableId }

// ═══════════════════════════════════════════════════════════════
// PROCESS MINING CONTEXT EVENTS (Core Domain)
// ═══════════════════════════════════════════════════════════════
DataModelCreated        { modelId, poolId, type }
DataModelConfigured     { modelId, configurationType }
DataModelLoadStarted    { modelId, loadType }
DataModelLoadCompleted  { modelId, eventCount, duration }
DataModelLoadFailed     { modelId, error }

ProcessDiscovered       { processModelId, dataModelId, algorithm }
ProcessModelImported    { processModelId, format }
ProcessModelDeleted     { processModelId }

// ═══════════════════════════════════════════════════════════════
// CONFORMANCE CONTEXT EVENTS
// ═══════════════════════════════════════════════════════════════
ConformanceChecked      { dataModelId, processModelId, method, fitness }
DeviationsDetected      { dataModelId, processModelId, count }
QualityMetricsComputed  { processModelId, metrics }

// ═══════════════════════════════════════════════════════════════
// ANALYTICS CONTEXT EVENTS
// ═══════════════════════════════════════════════════════════════
KnowledgeModelCreated   { kmId, packageId, dataModelId }
KnowledgeModelPublished { kmId }
KPICreated              { kpiId, kmId, name }
KPIEvaluated            { kpiId, value }

// ═══════════════════════════════════════════════════════════════
// STUDIO CONTEXT EVENTS
// ═══════════════════════════════════════════════════════════════
PackageCreated          { packageId, spaceId }
PackagePublished        { packageId, version }

ViewCreated             { viewId, packageId }
ViewPublished           { viewId }
ComponentAdded          { componentId, viewId, type }

// ═══════════════════════════════════════════════════════════════
// AUTOMATION CONTEXT EVENTS
// ═══════════════════════════════════════════════════════════════
ActionFlowCreated       { flowId, packageId }
ActionFlowActivated     { flowId }
ActionFlowDeactivated   { flowId, reason }
ActionFlowExecutionStarted   { flowId, executionId }
ActionFlowExecutionCompleted { flowId, executionId, status }

SkillActivated          { skillId }
SensorEvaluated         { sensorId, signalsCreated }
SignalCreated           { signalId, skillId, severity }
SignalResolved          { signalId, resolvedBy }

TaskCreated             { taskId, taskTypeId }
TaskAssigned            { taskId, assigneeId }
TaskCompleted           { taskId }

// ═══════════════════════════════════════════════════════════════
// COMMERCIAL CONTEXT EVENTS
// ═══════════════════════════════════════════════════════════════
SubscriptionCreated     { subscriptionId, planId }
SubscriptionUpgraded    { subscriptionId, fromPlan, toPlan }
SubscriptionCancelled   { subscriptionId, reason }
PaymentSucceeded        { invoiceId, amount }
PaymentFailed           { invoiceId, reason }
UsageThresholdReached   { tenantId, metric, threshold }
```

---

## DOMAIN SERVICES

```typescript
// Services that don't belong to a single aggregate

// ═══════════════════════════════════════════════════════════════
// PROCESS MINING CONTEXT
// ═══════════════════════════════════════════════════════════════
interface IProcessDiscoveryDomainService {
  // Orchestrates PM4Py adapter + model persistence
  discoverProcess(dataModel: DataModel, algorithm: DiscoveryAlgorithm): ProcessModel;
}

interface IConformanceDomainService {
  // Orchestrates conformance across models
  checkConformance(dataModel: DataModel, processModel: ProcessModel, method: ConformanceMethod): ConformanceResult;
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS CONTEXT
// ═══════════════════════════════════════════════════════════════
interface IKPIEvaluationDomainService {
  // Evaluates KPIs against data model
  evaluate(kpi: KPI, dataModel: DataModel, filters: Filter[]): KPIValue;
}

// ═══════════════════════════════════════════════════════════════
// AUTOMATION CONTEXT
// ═══════════════════════════════════════════════════════════════
interface ISensorEvaluationDomainService {
  // Evaluates sensor conditions against data
  evaluate(sensor: Sensor, dataModel: DataModel): Signal[];
}

interface IActionFlowExecutorDomainService {
  // Executes action flow modules
  execute(actionFlow: ActionFlow, inputs: Record<string, unknown>): Execution;
}
```

---

## REPOSITORIES (Per Aggregate)

```typescript
// One repository per aggregate root
// Repositories handle persistence of entire aggregate

interface ITenantRepository {
  findById(id: TenantId): Tenant | null;
  save(tenant: Tenant): void;
  delete(id: TenantId): void;
}

interface IDataPoolRepository {
  findById(id: DataPoolId): DataPool | null;
  findByTenantId(tenantId: TenantId): DataPool[];
  save(pool: DataPool): void;              // Saves entire aggregate including Tables
  delete(id: DataPoolId): void;
}

interface IDataModelRepository {
  findById(id: DataModelId): DataModel | null;
  save(model: DataModel): void;
  delete(id: DataModelId): void;
}

interface IProcessModelRepository {
  findById(id: ProcessModelId): ProcessModel | null;
  findByDataModelId(dataModelId: DataModelId): ProcessModel[];
  save(model: ProcessModel): void;
  delete(id: ProcessModelId): void;
}

interface IKnowledgeModelRepository {
  findById(id: UUID): KnowledgeModel | null;
  findByKey(key: string): KnowledgeModel | null;
  save(km: KnowledgeModel): void;          // Saves KPIs, Records, Filters, etc.
  delete(id: UUID): void;
}

interface IViewRepository {
  findById(id: ViewId): View | null;
  findByKey(key: string): View | null;
  save(view: View): void;                  // Saves Components, Tabs, Variables
  delete(id: ViewId): void;
}

interface IActionFlowRepository {
  findById(id: ActionFlowId): ActionFlow | null;
  save(flow: ActionFlow): void;            // Saves Modules
  delete(id: ActionFlowId): void;
}

interface ISkillRepository {
  findById(id: UUID): Skill | null;
  save(skill: Skill): void;                // Saves Sensor, Actions
  delete(id: UUID): void;
}

// ... etc for each aggregate root
```

---

## ANTI-CORRUPTION LAYERS

```typescript
// ═══════════════════════════════════════════════════════════════
// PM4PY ACL - Translates between our domain and PM4Py
// ═══════════════════════════════════════════════════════════════
interface IPM4PyAntiCorruptionLayer {
  // Translate our DataModel to PM4Py event log format
  toEventLog(dataModel: DataModel): PM4PyEventLog;
  toOCEL(dataModel: DataModel): PM4PyOCEL;
  
  // Translate PM4Py results to our domain models
  fromPetriNet(result: PM4PyPetriNetResult): PetriNet;
  fromProcessTree(result: PM4PyProcessTreeResult): ProcessTree;
  fromDFG(result: PM4PyDFGResult): DirectlyFollowsGraph;
  fromAlignments(result: PM4PyAlignmentsResult): Alignment[];
}

// ═══════════════════════════════════════════════════════════════
// PAYMENT PROVIDER ACL - Stripe, etc.
// ═══════════════════════════════════════════════════════════════
interface IPaymentProviderACL {
  createCustomer(tenant: Tenant): ExternalCustomerId;
  createSubscription(subscription: Subscription): ExternalSubscriptionId;
  processPayment(invoice: Invoice): PaymentResult;
  syncUsage(usage: UsageRecord[]): void;
}
```

---

## SUMMARY: WHAT MAKES THIS DDD

| DDD Concept | Implementation |
|-------------|----------------|
| **Ubiquitous Language** | Contracts use domain terms: DataPool, DataModel, KnowledgeModel, Variant, Signal |
| **Bounded Contexts** | 10 distinct contexts with clear boundaries |
| **Aggregates** | Each context has 1-4 aggregates with invariants |
| **Aggregate Roots** | DataPool, DataModel, ProcessModel, KnowledgeModel, View, ActionFlow, Skill |
| **Entities** | Table, Column, KPI, Record, Component, Module, Sensor |
| **Value Objects** | PetriNet, Marking, KPIExpression, ComponentPosition, etc. |
| **Domain Events** | 40+ events for cross-context communication |
| **Repositories** | One per aggregate root, handles whole aggregate |
| **Domain Services** | ProcessDiscovery, Conformance, KPIEvaluation |
| **Anti-Corruption Layers** | PM4Py ACL, Payment ACL |
| **Context Map** | Customer/Supplier, Partnership, Conformist relationships |
