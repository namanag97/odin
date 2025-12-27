# Process Intelligence Platform - Layer Integration & Validation

## 10. Layer Integration Map

### 10.1 SaaS Foundation Layer Bindings

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              LAYER INTEGRATION MATRIX                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              EXISTENCE LAYER                                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  EVERY domain entity has:                                                                │
│    - tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE                    │
│    - RLS Policy: tenant_id = current_setting('app.tenant_id')::UUID                     │
│                                                                                          │
│  Tenant Isolation Strategy:                                                              │
│    - Schema-per-tenant: ❌ Not recommended (complexity)                                 │
│    - Row-Level Security: ✅ Recommended (scalable)                                      │
│    - Partition by tenant_id: ✅ For high-volume tables (object, event)                 │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              IDENTITY LAYER                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  Ownership Columns (on all domain entities):                                            │
│    - created_by UUID NOT NULL REFERENCES "user"(id)                                    │
│    - updated_by UUID REFERENCES "user"(id)                                             │
│                                                                                          │
│  Assignment Columns (where applicable):                                                  │
│    - Task: assignee_id, reporter_id                                                     │
│    - Signal: assignee_id, resolved_by                                                   │
│    - Event: resource_id (who performed the activity)                                    │
│                                                                                          │
│  Scoping (optional, for multi-org tenants):                                             │
│    - organization_id UUID REFERENCES organization(id)                                  │
│    - team_id UUID REFERENCES team(id)                                                  │
│                                                                                          │
│  Permission Registration (domain resources):                                             │
│    - data_pool: create, read, update, delete, manage_connections, load_model           │
│    - data_model: create, read, update, delete, load, view_data                         │
│    - perspective: create, read, update, delete, publish                                │
│    - knowledge_model: create, read, update, delete, publish                            │
│    - view: create, read, update, delete, publish, export                               │
│    - action_flow: create, read, update, delete, activate, execute                      │
│    - skill: create, read, update, delete, activate                                     │
│    - signal: read, update, assign, resolve                                             │
│    - task: create, read, update, delete, assign, resolve                               │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              COMMERCIAL LAYER                                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  Plan Limits (resource_type → limit_value):                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │ Resource Type          │ Starter │ Professional │ Enterprise │ Limit Type      │   │
│  ├─────────────────────────────────────────────────────────────────────────────────┤   │
│  │ data_pool              │ 2       │ 10           │ unlimited  │ hard            │   │
│  │ data_model             │ 3       │ 20           │ unlimited  │ hard            │   │
│  │ data_connection        │ 5       │ 50           │ unlimited  │ hard            │   │
│  │ perspective            │ 3       │ 20           │ unlimited  │ hard            │   │
│  │ object_type            │ 10      │ 50           │ unlimited  │ hard            │   │
│  │ knowledge_model        │ 3       │ 20           │ unlimited  │ hard            │   │
│  │ view                   │ 10      │ 100          │ unlimited  │ hard            │   │
│  │ action_flow            │ 5       │ 50           │ unlimited  │ hard            │   │
│  │ skill                  │ 5       │ 30           │ unlimited  │ hard            │   │
│  │ event_rows_per_month   │ 1M      │ 50M          │ unlimited  │ soft (metered)  │   │
│  │ storage_gb             │ 10      │ 500          │ unlimited  │ soft (metered)  │   │
│  │ api_calls_per_day      │ 10K     │ 500K         │ unlimited  │ soft (throttle) │   │
│  │ action_flow_executions │ 1K      │ 100K         │ unlimited  │ soft (metered)  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  Plan Features (feature_key → is_enabled):                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │ Feature                     │ Starter │ Professional │ Enterprise │            │   │
│  ├─────────────────────────────────────────────────────────────────────────────────┤   │
│  │ ocpm.enabled                │ ❌      │ ✅           │ ✅         │            │   │
│  │ ocpm.custom_event_logs      │ ❌      │ ✅           │ ✅         │            │   │
│  │ process_explorer.animation  │ ❌      │ ✅           │ ✅         │            │   │
│  │ conformance_checking        │ ❌      │ ✅           │ ✅         │            │   │
│  │ variant_explorer            │ ✅      │ ✅           │ ✅         │            │   │
│  │ action_flows.scheduled      │ ❌      │ ✅           │ ✅         │            │   │
│  │ action_flows.webhooks       │ ❌      │ ✅           │ ✅         │            │   │
│  │ skills.ml_based             │ ❌      │ ❌           │ ✅         │            │   │
│  │ api.intelligence_api        │ ❌      │ ✅           │ ✅         │            │   │
│  │ export.pdf                  │ ❌      │ ✅           │ ✅         │            │   │
│  │ sso.enabled                 │ ❌      │ ✅           │ ✅         │            │   │
│  │ audit_log.enabled           │ ❌      │ ✅           │ ✅         │            │   │
│  │ audit_log.extended_retention│ ❌      │ ❌           │ ✅         │            │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  Usage Tracking (for metered billing):                                                  │
│    - event_rows_ingested: Count on event INSERT                                        │
│    - storage_bytes: Sum of data_pool.storage_bytes                                     │
│    - api_calls: Count per API request                                                  │
│    - action_flow_executions: Count on action_flow_execution INSERT                     │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              TEMPORAL LAYER                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  Audit Triggers (all domain entities with CRUD):                                        │
│    CREATE TRIGGER audit_[entity]                                                        │
│      AFTER INSERT OR UPDATE OR DELETE ON [entity]                                       │
│      FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();                                  │
│                                                                                          │
│  Entities with Audit Triggers:                                                          │
│    ✅ data_pool, data_connection, data_model, table, perspective                       │
│    ✅ object_type, event_type, object_relationship                                      │
│    ✅ knowledge_model, kpi, record, filter, event_log_config                           │
│    ✅ space, package, view, component                                                  │
│    ✅ action_flow, skill, sensor, task, task_type                                      │
│    ✅ schedule, webhook, connection                                                     │
│                                                                                          │
│  Version History (for key entities):                                                    │
│    - knowledge_model: Full YAML snapshots                                               │
│    - view: Layout + component snapshots                                                 │
│    - action_flow: Blueprint snapshots                                                   │
│    - data_model: Schema snapshots                                                       │
│                                                                                          │
│  Time-Series Data (immutable, partitioned):                                             │
│    - event: Partitioned by timestamp (monthly)                                          │
│    - event_object_relationship: Partitioned by created_at (monthly)                     │
│    - object_change: Partitioned by changed_at (monthly)                                 │
│    - action_flow_execution: Partitioned by created_at (monthly)                         │
│    - job_execution: Partitioned by created_at (monthly)                                 │
│    - signal: Partitioned by created_at (monthly)                                        │
│                                                                                          │
│  Scheduled Jobs:                                                                         │
│    - Data extraction/transformation: schedule → data_job                               │
│    - Action Flow execution: schedule → action_flow                                      │
│    - Sensor evaluation: On data_model load or schedule                                  │
│    - Variant computation: On data_model load                                            │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              INTEGRATION LAYER                                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  Webhook Event Types (domain events):                                                   │
│    # Data Integration                                                                   │
│    - data_pool.created, data_pool.updated, data_pool.deleted                           │
│    - data_model.loaded, data_model.load_failed                                         │
│    - data_job.started, data_job.completed, data_job.failed                             │
│                                                                                          │
│    # Process Mining                                                                      │
│    - perspective.published                                                              │
│    - event_log.updated (variant recalculated)                                          │
│                                                                                          │
│    # Automation                                                                          │
│    - action_flow.activated, action_flow.deactivated                                    │
│    - action_flow.execution_completed, action_flow.execution_failed                      │
│    - signal.created, signal.resolved                                                   │
│    - task.created, task.assigned, task.completed                                       │
│                                                                                          │
│    # Studio                                                                              │
│    - package.published                                                                  │
│    - view.published                                                                     │
│                                                                                          │
│  API Scopes (OAuth2):                                                                   │
│    - data_pool:read, data_pool:write                                                   │
│    - data_model:read, data_model:write, data_model:load                               │
│    - event:write (for ingestion)                                                       │
│    - knowledge_model:read, knowledge_model:write                                       │
│    - view:read                                                                          │
│    - action_flow:read, action_flow:write, action_flow:execute                          │
│    - task:read, task:write                                                             │
│    - intelligence:query (PQL execution)                                                │
│                                                                                          │
│  External Connectors:                                                                   │
│    - data_connection: Stores OAuth tokens, API keys (encrypted)                        │
│    - connection (Action Flows): Stores integration credentials                         │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              COMMUNICATION LAYER                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  Notification Templates:                                                                │
│    # Automation                                                                         │
│    - signal_created: "New signal detected: {signal.title}"                             │
│    - signal_assigned: "Signal {signal.id} assigned to you"                             │
│    - task_assigned: "Task {task.title} assigned to you"                                │
│    - task_due_soon: "Task {task.title} due in {days} days"                             │
│    - action_flow_failed: "Action Flow {flow.name} failed: {error}"                     │
│                                                                                          │
│    # Data Integration                                                                   │
│    - data_load_completed: "Data model {model.name} loaded successfully"                │
│    - data_load_failed: "Data model {model.name} load failed: {error}"                  │
│    - extraction_failed: "Data extraction {job.name} failed"                            │
│                                                                                          │
│    # Collaboration                                                                      │
│    - package_published: "Package {package.name} published by {user}"                   │
│    - view_shared: "{user} shared view {view.name} with you"                            │
│                                                                                          │
│  Notification Triggers:                                                                 │
│    - INSERT on signal → signal_created notification                                    │
│    - UPDATE on signal (assignee changed) → signal_assigned notification                │
│    - INSERT on task → task_assigned notification (if assignee set)                     │
│    - action_flow_execution with status='error' → action_flow_failed notification       │
│    - job_execution with status='failed' → extraction_failed notification               │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 PM4Py/OCEL Alignment

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         PM4PY / OCEL 2.0 ALIGNMENT                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ OCEL 2.0 Standard          │ Platform Entity          │ Notes                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ocel:event                  │ event                    │ Core event table                │
│ ocel:object                 │ object                   │ Object instances                │
│ ocel:event-type             │ event_type               │ Event classifications           │
│ ocel:object-type            │ object_type              │ Object classifications          │
│ ocel:e2o (event-to-object)  │ event_object_relationship│ N:M junction table             │
│ ocel:o2o (object-to-object) │ object_relationship_inst │ Object relationships            │
│ ocel:object-change          │ object_change            │ Attribute changes over time     │
│ ocel:qualifier              │ event_object_rel.qualifier│ Role of object in event        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

PM4Py Function Mapping:
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ PM4Py Function              │ Platform Implementation  │ Notes                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ pm4py.read_ocel2()          │ Load from perspective    │ Export OCEL 2.0 JSON/SQLite    │
│ pm4py.discover_oc_petri_net │ Python service call      │ Runs on perspective data       │
│ pm4py.conformance_ocpn      │ Python service call      │ Returns conformance metrics    │
│ pm4py.ocel_flattening       │ custom_event_log entity  │ Generates case-centric view    │
│ pm4py.ocel_get_object_types │ Query object_type table  │ List object types              │
│ pm4py.ocel_get_event_types  │ Query event_type table   │ List event types               │
│ pm4py.discover_dfg          │ Computed from events     │ Direct-follows graph           │
│ pm4py.discover_petri_net    │ Python service call      │ Petri net discovery            │
│ pm4py.conformance_diagnostics│ Python service call     │ Alignment-based conformance    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Validation Checklist

### 11.1 Entity Completeness

```
□ DATA INTEGRATION LAYER
  ✅ data_pool - Container for data
  ✅ data_connection - External source configuration
  ✅ table - Physical/virtual tables
  ✅ column - Column definitions
  ✅ data_model - Analytical schema
  ✅ foreign_key - Table relationships
  ✅ data_job - ETL workflow
  ✅ data_job_task - Individual ETL steps
  ✅ schedule - Time-based triggers
  ✅ job_execution - Execution history

□ OCPM LAYER
  ✅ perspective - Filtered OCPM view
  ✅ object_type - Object classification
  ✅ event_type - Event classification
  ✅ object_relationship - Object-to-object definition
  ✅ object - Object instances
  ✅ object_relationship_instance - Object links
  ✅ event_object_relationship - Event-to-object links
  ✅ object_change - Change tracking
  ✅ custom_event_log - Flattened event logs

□ PROCESS MINING LAYER
  ✅ activity - Named actions
  ✅ case - Process instances
  ✅ event - Activity occurrences
  ✅ variant - Activity sequences

□ SEMANTIC LAYER
  ✅ knowledge_model - Semantic container
  ✅ kpi - Calculated metrics
  ✅ record - Table abstractions
  ✅ record_attribute - Column mappings
  ✅ filter - Reusable filters
  ✅ variable - Stored values
  ✅ event_log_config - Event log definitions
  ✅ augmented_attribute - User-editable fields
  ✅ augmented_attribute_value - Stored values

□ STUDIO LAYER
  ✅ space - Organizational container
  ✅ package - Asset container
  ✅ view - Dashboards
  ✅ component - UI elements
  ✅ view_tab - Tab containers

□ AUTOMATION LAYER
  ✅ action_flow - Workflow definition
  ✅ action_flow_module - Workflow steps
  ✅ connection - External system auth
  ✅ webhook - HTTP endpoints
  ✅ webhook_queue - Buffered requests
  ✅ skill - Sensor + Action combo
  ✅ sensor - Data condition detector
  ✅ signal - Detected incidents
  ✅ task - Work items
  ✅ task_type - Task classification
  ✅ action_flow_execution - Execution history
  ✅ incomplete_execution - Failed execution storage
```

### 11.2 Relationship Validation

```
□ All entities have tenant_id FK ✅
□ All entities have created_at, updated_at ✅
□ All modifiable entities have created_by FK ✅
□ Soft delete (deleted_at) on appropriate entities ✅
□ No circular dependencies between layers ✅
□ Proper cascade delete behavior defined ✅
□ Indexes on all FK columns ✅
□ Composite unique constraints where needed ✅
```

### 11.3 Performance Validation

```
□ High-volume tables partitioned:
  ✅ event - RANGE by timestamp (monthly)
  ✅ event_object_relationship - RANGE by created_at
  ✅ object_change - RANGE by changed_at
  ✅ action_flow_execution - RANGE by created_at
  ✅ job_execution - RANGE by created_at
  ✅ signal - RANGE by created_at
  ✅ object - HASH by tenant_id

□ Indexes on common query patterns:
  ✅ tenant_id on all tables
  ✅ Case/activity lookup: event(case_id, timestamp)
  ✅ Object lookup: object(object_type_id, object_key)
  ✅ Status queries: various(tenant_id, status)

□ Materialized views/computed columns:
  ✅ variant - Computed from events
  ✅ case.throughput_time_seconds - Computed
  ✅ object.event_count - Computed
```

### 11.4 SaaS Layer Integration

```
□ EXISTENCE LAYER
  ✅ All entities reference tenant(id)
  ✅ RLS policies defined for tenant isolation
  
□ IDENTITY LAYER
  ✅ Ownership columns (created_by, updated_by)
  ✅ Assignment columns (assignee_id, resource_id)
  ✅ Permissions registered for all resource × action combinations

□ COMMERCIAL LAYER
  ✅ Plan limits defined for countable resources
  ✅ Plan features defined for gated functionality
  ✅ Usage tracking for metered resources

□ TEMPORAL LAYER
  ✅ Audit triggers on CRUD entities
  ✅ Version history for key entities
  ✅ Scheduled job support

□ INTEGRATION LAYER
  ✅ Webhook events for key domain actions
  ✅ API scopes defined
  ✅ External connector credential storage

□ COMMUNICATION LAYER
  ✅ Notification templates for key events
  ✅ Notification triggers defined
```

---

## 12. Implementation Priority

### Phase 1: Core Data Infrastructure (Week 1-2)
1. data_pool, data_connection, table, column
2. data_model, foreign_key
3. data_job, data_job_task, schedule, job_execution
4. Event ingestion pipeline

### Phase 2: Case-Centric Process Mining (Week 3-4)
1. activity, case, event (partitioned)
2. variant (materialized)
3. Event log configuration
4. Basic process explorer queries

### Phase 3: OCPM Foundation (Week 5-6)
1. perspective, object_type, event_type
2. object, object_relationship
3. event_object_relationship
4. object_change
5. OCEL 2.0 export

### Phase 4: Semantic Layer (Week 7-8)
1. knowledge_model
2. kpi, record, record_attribute
3. filter, variable
4. event_log_config
5. augmented_attribute

### Phase 5: Studio & Visualization (Week 9-10)
1. space, package
2. view, component, view_tab
3. Process Explorer component
4. Variant Explorer component

### Phase 6: Automation (Week 11-12)
1. action_flow, action_flow_module
2. connection, webhook
3. skill, sensor, signal
4. task, task_type
5. Execution engine

---

## 13. File Summary

This ERD extraction produced the following deliverables:

| File | Description | Lines |
|------|-------------|-------|
| process-intel-erd.md | Entity definitions in YAML, relationships, diagrams | ~2000 |
| process-intel-schema.sql | PostgreSQL DDL for all entities | ~800 |
| process-intel-integration.md | Layer integration, validation checklist | ~500 |

Total: ~3300 lines of specification

### Key Statistics

- **Total Entities**: 52
- **Core Entities**: 28
- **Supporting Entities**: 12
- **Transactional Entities**: 8
- **Reference Entities**: 4
- **Partitioned Tables**: 7
- **Unique Constraints**: 40+
- **Foreign Keys**: 80+
- **Indexes**: 100+
