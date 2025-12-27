# PROCESS MINING SAAS — CONTRACTS INDEX
> Complete reference map for all coding contracts

---

## CONTRACT ARTIFACTS SUMMARY

| # | Artifact | Layer | Description | Key Contents |
|---|----------|-------|-------------|--------------|
| 1 | **L0 Core Contracts** | Core | Foundation types | `Result<T>`, Errors, Primitives, Context, Logger, EventBus |
| 2 | **L1 Existence & Identity** | Domain | Multi-tenancy & Auth | Tenant, Organization, User, Role, Permission, Session, MFA |
| 3 | **L1 Commercial & Operational** | Domain | Billing & Config | Plan, Subscription, Invoice, FeatureFlag, Settings |
| 4 | **L1 Temporal, Integration, Communication** | Domain | Audit & External | AuditLog, ApiKey, Webhook, Integration, Notification |
| 5 | **L1 Process Mining Domain** | Domain | Core PM entities | DataPool, Table, DataModel, OCEL, Case, Event, ProcessModel |
| 6 | **L1 Analytics, Studio & Automation** | Domain | Application entities | KnowledgeModel, KPI, View, Component, ActionFlow, Skill, Task |
| 7 | **L2 Core & Data Integration** | Service | Data operations | TenantService, AuthService, DataPoolService, TableService, DataModelService |
| 8 | **L2 Process Mining (PM4Py)** | Service | Mining operations | ProcessDiscoveryService, ConformanceService, OCELAnalyticsService, CaseAnalyticsService |
| 9 | **L2 Studio & Automation** | Service | App operations | KnowledgeModelService, ViewService, ActionFlowService, SkillService, TaskService |
| 10 | **L2 Infrastructure** | Service | Platform services | FileStorageService, CacheService, JobQueueService, NotificationService, WebhookService |
| 11 | **PM4Py Adapter** | Integration | Python bridge | IPM4PyAdapter, Discovery DTOs, Conformance DTOs, Handle management |
| 12 | **L3 API Contracts** | API | REST/OpenAPI | Endpoints, Schemas, Error responses, Webhooks |
| 13 | **Implementation Guide** | Reference | Dev guidance | Patterns, Rules, Testing, Deployment |

---

## ENTITY RELATIONSHIP MAP

```
EXISTENCE LAYER
┌─────────┐
│ Tenant  │──────────────────────────────────────────────────┐
└────┬────┘                                                  │
     │1:N                                                    │
┌────▼────────┐                                              │
│Organization │                                              │
└─────────────┘                                              │
                                                             │
IDENTITY LAYER                                               │
┌─────────┐     ┌──────┐     ┌────────────┐                │
│  User   │◄───►│ Role │◄───►│ Permission │                │
└────┬────┘     └──────┘     └────────────┘                │
     │                                                       │
     │1:N                                                    │
┌────▼────┐     ┌───────────┐                              │
│ Session │     │ ApiKey    │                              │
└─────────┘     └───────────┘                              │
                                                             │
PROCESS MINING DOMAIN                                        │
┌─────────────┐                                              │
│  DataPool   │◄─────────────────────────────────────────────┘
└──────┬──────┘
       │1:N
┌──────▼──────┐    ┌─────────────┐
│    Table    │    │ DataModel   │
└──────┬──────┘    └──────┬──────┘
       │                   │
       │              ┌────┴────┐
       │         Case-Centric  Object-Centric
       │              │              │
       │         ┌────▼────┐   ┌────▼────┐
       │         │  Case   │   │ OCELObj │
       │         └────┬────┘   └────┬────┘
       │              │             │
       │         ┌────▼────┐   ┌────▼────┐
       │         │  Event  │   │OCELEvent│
       │         └─────────┘   └─────────┘
       │
       │              ┌──────────────┐
       └─────────────►│ProcessModel  │
                      └──────────────┘

STUDIO DOMAIN
┌─────────┐
│  Space  │
└────┬────┘
     │1:N
┌────▼────┐
│ Package │
└────┬────┘
     │1:N
     ├──────────────┬──────────────┐
     │              │              │
┌────▼────┐   ┌────▼────┐   ┌────▼──────┐
│   View  │   │Knowledge│   │ActionFlow │
│         │   │  Model  │   │           │
└────┬────┘   └────┬────┘   └────┬──────┘
     │             │              │
     │1:N          │1:N           │1:N
┌────▼─────┐  ┌────▼────┐   ┌────▼────┐
│Component │  │   KPI   │   │ Module  │
└──────────┘  │ Record  │   └─────────┘
              │ Filter  │
              └─────────┘

AUTOMATION DOMAIN
┌─────────┐
│  Skill  │
└────┬────┘
     │1:1
┌────▼────┐
│ Sensor  │
└────┬────┘
     │1:N
┌────▼────┐
│ Signal  │
└────┬────┘
     │0:1
┌────▼────┐
│  Task   │
└─────────┘
```

---

## SERVICE DEPENDENCY GRAPH

```
                    ┌─────────────────┐
                    │   API Layer     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
│ProcessDiscov- │   │  Conformance  │   │    OCEL       │
│   eryService  │   │   Service     │   │ Analytics     │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └─────────┬─────────┴─────────┬─────────┘
                  │                   │
          ┌───────▼───────┐   ┌───────▼───────┐
          │  DataModel    │   │   PM4Py       │
          │   Service     │   │   Adapter     │
          └───────┬───────┘   └───────────────┘
                  │
          ┌───────▼───────┐
          │  DataPool     │
          │   Service     │
          └───────┬───────┘
                  │
          ┌───────▼───────┐
          │    Table      │
          │   Service     │
          └───────┬───────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌─────▼─────┐  ┌───▼────┐
│ File  │   │  Cache    │  │  Job   │
│Storage│   │  Service  │  │ Queue  │
└───────┘   └───────────┘  └────────┘
```

---

## PM4PY ALGORITHM SUPPORT

| Algorithm | PM4Py Function | Input | Output | Use Case |
|-----------|----------------|-------|--------|----------|
| **Alpha Miner** | `pm4py.discover_petri_net_alpha` | EventLog | PetriNet | Simple, structured logs |
| **Alpha+ Miner** | `pm4py.discover_petri_net_alpha_plus` | EventLog | PetriNet | Loops, short loops |
| **Inductive Miner** | `pm4py.discover_petri_net_inductive` | EventLog | PetriNet/ProcessTree | Guaranteed sound model |
| **Inductive Miner Infrequent** | `pm4py.discover_petri_net_inductive` (noise) | EventLog | PetriNet/ProcessTree | Noisy logs |
| **Heuristic Miner** | `pm4py.discover_petri_net_heuristics` | EventLog | PetriNet | Real-world, noisy logs |
| **ILP Miner** | `pm4py.discover_petri_net_ilp` | EventLog | PetriNet | Optimal fitness |
| **DFG** | `pm4py.discover_dfg` | EventLog | DFG | Quick visualization |
| **OC-PN** | `pm4py.discover_oc_petri_net` | OCEL | OC-PetriNet | Object-centric |

| Conformance | PM4Py Function | Description |
|-------------|----------------|-------------|
| **Token Replay** | `pm4py.conformance_diagnostics_token_based_replay` | Fast, approximate |
| **Alignments** | `pm4py.conformance_diagnostics_alignments` | Optimal, expensive |
| **Footprints** | `pm4py.conformance_diagnostics_footprints` | Structural comparison |

---

## QUICK REFERENCE: KEY TYPES

```typescript
// Core Identity Types
type TenantId = Brand<UUID, 'TenantId'>;
type UserId = Brand<UUID, 'UserId'>;
type OrganizationId = Brand<UUID, 'OrganizationId'>;

// Process Mining Types
type DataPoolId = Brand<UUID, 'DataPoolId'>;
type DataModelId = Brand<UUID, 'DataModelId'>;
type ProcessModelId = Brand<UUID, 'ProcessModelId'>;
type EventId = Brand<string, 'EventId'>;
type ObjectId = Brand<string, 'ObjectId'>;
type VariantId = Brand<string, 'VariantId'>;

// Studio Types
type SpaceId = Brand<UUID, 'SpaceId'>;
type PackageId = Brand<UUID, 'PackageId'>;
type ViewId = Brand<UUID, 'ViewId'>;
type ActionFlowId = Brand<UUID, 'ActionFlowId'>;

// PM4Py Handle Types
type EventLogHandle = Brand<string, 'EventLogHandle'>;
type OCELHandle = Brand<string, 'OCELHandle'>;
type PetriNetHandle = Brand<string, 'PetriNetHandle'>;

// Result Type
type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

type AsyncResult<T, E = AppError> = Promise<Result<T, E>>;
```

---

## IMPLEMENTATION PRIORITY

### Phase 1: MVP (Weeks 1-8)
```
□ Core types and error handling
□ Database schema with multi-tenancy
□ Authentication (password + JWT)
□ DataPool CRUD
□ Table import (CSV/XLSX)
□ DataModel configuration
□ PM4Py adapter (subprocess mode)
□ Alpha/Inductive discovery
□ DFG visualization
□ Basic REST API
```

### Phase 2: Process Mining (Weeks 9-12)
```
□ All discovery algorithms
□ Token replay conformance
□ Alignments conformance
□ Quality metrics
□ Variant analysis
□ Case explorer
□ Performance analytics
□ OCEL support
```

### Phase 3: Studio (Weeks 13-16)
```
□ Knowledge Model
□ KPI definitions
□ View builder
□ Component library
□ Dashboard rendering
□ Filters & variables
```

### Phase 4: Automation (Weeks 17-20)
```
□ Action Flows
□ Module library
□ Skills & Sensors
□ Signal management
□ Task management
□ Notifications
```

### Phase 5: Enterprise (Weeks 21-24)
```
□ SSO/SAML
□ Role-based permissions
□ Audit logging
□ Billing integration
□ Usage tracking
□ Advanced security
```

---

## CONTRACT VALIDATION CHECKLIST

Before implementing any service, verify:

- [ ] All input DTOs match contract exactly
- [ ] All output DTOs match contract exactly
- [ ] Method signature matches interface
- [ ] Error codes are from defined enum
- [ ] Events are emitted as specified
- [ ] Context is passed through chain
- [ ] Multi-tenancy is enforced
- [ ] Permissions are checked
- [ ] Audit logging is implemented
- [ ] Cache invalidation is handled
- [ ] Tests cover all error paths
