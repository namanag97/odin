# Process Mining & Business Automation Platform
## Database Schema Design v2.0

---

## 1. EXECUTIVE SUMMARY

### Platform Vision
A SaaS process mining and business automation platform built on open standards and open-source algorithms. The platform enables organizations to:

- Extract and transform event data from any source system
- Discover process models using industry-standard algorithms (Alpha, Heuristics, Inductive Miner)
- Analyze processes through both case-centric and object-centric (OCEL 2.0) paradigms
- Perform conformance checking against normative models
- Automate business actions based on detected patterns
- Leverage semantic/ontological reasoning for intelligent process understanding

### Technology Stack Integration

| Technology | Purpose | Schema Integration |
|------------|---------|-------------------|
| **PostgreSQL 15+** | Primary relational store | All transactional data, metadata |
| **pm4py** | Process mining algorithms | Event logs structured for direct pm4py consumption |
| **OCEL 2.0** | Object-centric event logs | Native OCEL schema implementation |
| **Neo4j** | Graph analytics & visualization | Graph projection tables, sync mechanisms |
| **OWL/RDF** | Semantic layer & reasoning | Ontology storage, concept annotations |
| **TimescaleDB** | Time-series optimization | Hypertables for events and metrics |

### Architectural Principles

1. **OCEL 2.0 Native**: Full compliance with IEEE Object-Centric Event Log standard
2. **Graph-Ready**: Schema designed for efficient Neo4j projection
3. **Ontology-Aware**: First-class support for semantic annotations and reasoning
4. **Algorithm-Friendly**: Data structures optimized for pm4py and standard mining algorithms
5. **Multi-Tenant by Design**: `tenant_id` scoping without complex auth (for now)
6. **Event Sourcing Ready**: Immutable event storage with derived state
7. **Polyglot Persistence**: Clear boundaries for what goes in PostgreSQL vs Neo4j vs RDF store

### Data Volume Expectations (Year 1 Targets)

| Entity | Expected Volume | Storage Strategy |
|--------|-----------------|------------------|
| Tenants | 100-500 | Standard table |
| Event Logs | 1,000s | Partitioned by tenant |
| Events (Case-Centric) | 10s of millions | TimescaleDB hypertable |
| Events (OCEL) | 100s of millions | TimescaleDB + partitioning |
| Objects | 10s of millions | Partitioned by type |
| Discovered Models | 10,000s | JSONB + file storage |
| Graph Projections | On-demand | Neo4j native |

---

## 2. CONCEPTUAL DATA MODEL

### 2.1 Domain Ontology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROCESS MINING UNIVERSE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                 │
│  │   TENANT    │──────│  DATA POOL  │──────│  EVENT LOG  │                 │
│  └─────────────┘      └─────────────┘      └──────┬──────┘                 │
│                                                   │                         │
│                    ┌──────────────────────────────┼──────────────────┐      │
│                    │                              │                  │      │
│              ┌─────▼─────┐                 ┌──────▼──────┐    ┌──────▼────┐ │
│              │   CASE    │                 │    OCEL     │    │  ONTOLOGY │ │
│              │  CENTRIC  │                 │   NATIVE    │    │   LAYER   │ │
│              └─────┬─────┘                 └──────┬──────┘    └───────────┘ │
│                    │                              │                         │
│         ┌─────────┬┴─────────┐         ┌─────────┼─────────┐               │
│         │         │          │         │         │         │               │
│    ┌────▼───┐ ┌───▼────┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐          │
│    │ CASES  │ │ EVENTS │ │VARIANT│ │OBJECTS│ │O-EVENTS│ │ E2O   │          │
│    └────────┘ └────────┘ └───────┘ └───────┘ └────────┘ └───────┘          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      PROCESS INTELLIGENCE                            │   │
│  ├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┤   │
│  │  DISCOVERY  │ CONFORMANCE │ PERFORMANCE │  PREDICTION │  SIMULATION │   │
│  │   MODELS    │   RESULTS   │   METRICS   │   MODELS    │  SCENARIOS  │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         AUTOMATION LAYER                             │   │
│  ├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┤   │
│  │   ACTIONS   │   TRIGGERS  │    RULES    │    TASKS    │  WORKFLOWS  │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 OCEL 2.0 Conceptual Model

The Object-Centric Event Log (OCEL) 2.0 standard defines a fundamentally different approach from case-centric process mining:

```
┌─────────────────────────────────────────────────────────────────┐
│                     OCEL 2.0 META-MODEL                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    ┌──────────────┐           ┌──────────────┐                 │
│    │  EVENT TYPE  │           │ OBJECT TYPE  │                 │
│    │  (Activity   │           │  (Entity     │                 │
│    │   Schema)    │           │   Schema)    │                 │
│    └──────┬───────┘           └──────┬───────┘                 │
│           │ defines                   │ defines                │
│           │                           │                        │
│    ┌──────▼───────┐           ┌──────▼───────┐                 │
│    │    EVENT     │◄─────────►│    OBJECT    │                 │
│    │  (instance)  │   E2O     │  (instance)  │                 │
│    └──────────────┘  relation └──────┬───────┘                 │
│                                      │                         │
│                               ┌──────▼───────┐                 │
│                               │     O2O      │                 │
│                               │  (Object to  │                 │
│                               │   Object)    │                 │
│                               └──────────────┘                 │
│                                                                 │
│  Key Principles:                                                │
│  • Events can relate to MULTIPLE objects (N:M)                  │
│  • Objects have types with defined attributes                   │
│  • Objects can relate to other objects (O2O)                    │
│  • No single "case" - perspective defined at query time         │
│  • Qualifiers on E2O relationships (e.g., quantity)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Graph Model (Neo4j Projection)

The relational schema is designed to efficiently project into Neo4j for graph analytics:

```
Neo4j Node Types:
├── (:Event {id, timestamp, activity})
├── (:Object {id, type, attributes})
├── (:Activity {name, category})
├── (:ObjectType {name, schema})
├── (:Case {id, variant})
└── (:ProcessModel {id, type, algorithm})

Neo4j Relationship Types:
├── (Event)-[:DIRECTLY_FOLLOWS]->(Event)
├── (Event)-[:INVOLVES {qualifier}]->(Object)
├── (Object)-[:RELATES_TO {type}]->(Object)
├── (Event)-[:OF_TYPE]->(Activity)
├── (Object)-[:INSTANCE_OF]->(ObjectType)
├── (Case)-[:CONTAINS]->(Event)
└── (ProcessModel)-[:DERIVED_FROM]->(EventLog)
```

---

## 3. ENTITY GROUPS OVERVIEW

### Group A: Core Infrastructure (5 tables)
| Table | Purpose | pm4py Relevance |
|-------|---------|-----------------|
| `tenants` | Multi-tenant isolation | Scoping all queries |
| `data_pools` | Data source containers | Event log grouping |
| `data_connections` | External system configs | Data extraction |
| `import_jobs` | ETL orchestration | Data loading |
| `import_job_runs` | Execution history | Lineage tracking |

### Group B: Case-Centric Process Mining (6 tables)
| Table | Purpose | pm4py Relevance |
|-------|---------|-----------------|
| `event_logs` | Event log definitions | `pm4py.read_xes()` equivalent |
| `cases` | Process instances | Case notion |
| `events` | Activity occurrences | Core event data |
| `activities` | Activity catalog | Activity mapping |
| `variants` | Execution patterns | `pm4py.get_variants()` |
| `resources` | Performer catalog | Organizational mining |

### Group C: OCEL 2.0 Native (7 tables)
| Table | Purpose | OCEL Standard Element |
|-------|---------|----------------------|
| `ocel_event_types` | Activity schemas | `ocel:eventTypes` |
| `ocel_object_types` | Entity schemas | `ocel:objectTypes` |
| `ocel_events` | Event instances | `ocel:events` |
| `ocel_objects` | Object instances | `ocel:objects` |
| `ocel_e2o` | Event-to-Object relations | `ocel:e2o` |
| `ocel_o2o` | Object-to-Object relations | `ocel:o2o` |
| `ocel_object_changes` | Attribute value changes | `ocel:objectChanges` |

### Group D: Ontology & Semantics (5 tables)
| Table | Purpose | OWL Integration |
|-------|---------|-----------------|
| `ontologies` | OWL ontology storage | Full OWL/RDF |
| `concepts` | Domain concepts | `owl:Class` |
| `concept_relations` | Semantic relationships | `owl:ObjectProperty` |
| `annotations` | Entity-to-concept mappings | `rdf:type` assertions |
| `reasoning_rules` | Inference rules | SWRL rules |

### Group E: Process Discovery (6 tables)
| Table | Purpose | Algorithm Support |
|-------|---------|-------------------|
| `discovered_models` | Process models | All discovery algorithms |
| `petri_nets` | Petri net storage | Alpha, Heuristics miner |
| `petri_net_places` | Places | Petri net structure |
| `petri_net_transitions` | Transitions | Petri net structure |
| `petri_net_arcs` | Arcs | Petri net structure |
| `bpmn_models` | BPMN storage | Inductive miner |

### Group F: Conformance & Quality (5 tables)
| Table | Purpose | Algorithm Support |
|-------|---------|-------------------|
| `conformance_jobs` | Checking configurations | Token replay, alignments |
| `conformance_results` | Aggregate results | Fitness, precision |
| `deviations` | Individual violations | Trace-level deviations |
| `alignments` | Optimal alignments | Alignment-based |
| `quality_metrics` | Model quality scores | F-score, generalization |

### Group G: Performance & Analytics (5 tables)
| Table | Purpose | Metric Types |
|-------|---------|--------------|
| `performance_metrics` | KPI definitions | Throughput, waiting time |
| `metric_values` | Time-series values | Historical tracking |
| `bottleneck_analyses` | Bottleneck detection | Sojourn time analysis |
| `sna_results` | Social network analysis | Handover, working together |
| `dashboards` | Visualization configs | User-defined views |

### Group H: Prediction & ML (4 tables)
| Table | Purpose | Model Types |
|-------|---------|-------------|
| `prediction_models` | ML model storage | Next activity, remaining time |
| `prediction_features` | Feature definitions | Feature engineering |
| `predictions` | Prediction outputs | Real-time predictions |
| `model_evaluations` | Model performance | Accuracy, AUC |

### Group I: Simulation (4 tables)
| Table | Purpose | Simulation Type |
|-------|---------|-----------------|
| `simulation_models` | Simulation configs | DES, Monte Carlo |
| `simulation_parameters` | Parameter distributions | Stochastic modeling |
| `simulation_runs` | Execution history | Scenario analysis |
| `simulation_results` | Output metrics | What-if analysis |

### Group J: Automation & Actions (6 tables)
| Table | Purpose | Automation Type |
|-------|---------|-----------------|
| `action_rules` | Trigger conditions | Pattern-based |
| `actions` | Executable actions | Webhooks, notifications |
| `action_executions` | Execution log | Audit trail |
| `workflows` | Multi-step automations | Complex orchestration |
| `workflow_steps` | Workflow components | Step definitions |
| `scheduled_jobs` | Time-based triggers | Cron-style scheduling |

### Group K: Graph Sync (3 tables)
| Table | Purpose | Neo4j Integration |
|-------|---------|-------------------|
| `graph_projections` | Projection definitions | CDC sync configs |
| `graph_sync_log` | Sync status tracking | Change detection |
| `graph_queries` | Saved Cypher queries | Reusable analytics |

**Total Tables: 56**

---

## 4. DETAILED SCHEMA DESIGN

### 4.1 Core Infrastructure

#### Table: `tenants`
**Purpose**: Top-level tenant organization for multi-tenancy.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Tenant identifier |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE | Organization name |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL-safe identifier |
| `settings` | JSONB | DEFAULT '{}' | Tenant-level configurations |
| `subscription_tier` | VARCHAR(50) | DEFAULT 'free' | free, starter, professional, enterprise |
| `storage_quota_gb` | INTEGER | DEFAULT 10 | Storage limit |
| `event_quota_monthly` | BIGINT | DEFAULT 1000000 | Monthly event limit |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes**:
- `idx_tenants_slug` UNIQUE ON (slug)

**Settings JSONB Schema**:
```json
{
  "timezone": "UTC",
  "date_format": "YYYY-MM-DD",
  "default_currency": "USD",
  "retention_days": 365,
  "features": {
    "ocel_enabled": true,
    "neo4j_sync": false,
    "ml_predictions": true
  }
}
```

---

#### Table: `data_pools`
**Purpose**: Container for related data sources and event logs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Pool name |
| `description` | TEXT | | |
| `type` | VARCHAR(50) | NOT NULL | 'case_centric', 'ocel', 'hybrid' |
| `status` | VARCHAR(50) | DEFAULT 'active' | active, archived, error |
| `schema_version` | INTEGER | DEFAULT 1 | For migrations |
| `statistics` | JSONB | DEFAULT '{}' | Aggregate stats cache |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes**:
- `idx_data_pools_tenant` ON (tenant_id, status)
- `idx_data_pools_name` UNIQUE ON (tenant_id, name)

**Statistics JSONB Schema**:
```json
{
  "total_events": 1500000,
  "total_cases": 50000,
  "total_objects": 120000,
  "total_variants": 342,
  "date_range": {
    "min": "2024-01-01T00:00:00Z",
    "max": "2024-12-31T23:59:59Z"
  },
  "last_computed_at": "2024-12-20T10:00:00Z"
}
```

---

#### Table: `data_connections`
**Purpose**: External system integration configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `data_pool_id` | UUID | FK → data_pools | Optional pool assignment |
| `name` | VARCHAR(255) | NOT NULL | Connection name |
| `connector_type` | VARCHAR(100) | NOT NULL | Type of connector |
| `connection_config` | JSONB | NOT NULL | Connection parameters (encrypted) |
| `extraction_config` | JSONB | DEFAULT '{}' | What data to extract |
| `status` | VARCHAR(50) | DEFAULT 'disconnected' | connected, disconnected, error |
| `last_tested_at` | TIMESTAMPTZ | | |
| `last_sync_at` | TIMESTAMPTZ | | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Connector Types**:
- `postgresql`, `mysql`, `oracle`, `sqlserver` - Databases
- `sap_hana`, `sap_erp` - SAP systems
- `salesforce`, `servicenow`, `dynamics365` - CRMs
- `csv_upload`, `xes_upload`, `ocel_json_upload` - File imports
- `kafka`, `rabbitmq` - Streaming
- `rest_api`, `graphql` - APIs

**Indexes**:
- `idx_data_connections_tenant` ON (tenant_id, connector_type)
- `idx_data_connections_pool` ON (data_pool_id) WHERE data_pool_id IS NOT NULL

---

#### Table: `import_jobs`
**Purpose**: ETL job definitions for data extraction and transformation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `data_pool_id` | UUID | FK → data_pools, NOT NULL | Target pool |
| `connection_id` | UUID | FK → data_connections | Source connection |
| `name` | VARCHAR(255) | NOT NULL | Job name |
| `job_type` | VARCHAR(50) | NOT NULL | 'extraction', 'transformation', 'full_load', 'incremental' |
| `source_query` | TEXT | | SQL or extraction specification |
| `mapping_config` | JSONB | NOT NULL | Column mappings to event log schema |
| `schedule_cron` | VARCHAR(100) | | Cron expression for scheduling |
| `is_active` | BOOLEAN | DEFAULT FALSE | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Mapping Config Schema** (Case-Centric):
```json
{
  "case_id_column": "order_id",
  "activity_column": "activity_name",
  "timestamp_column": "event_timestamp",
  "resource_column": "user_name",
  "cost_column": "activity_cost",
  "additional_attributes": {
    "customer_type": "customer_segment",
    "amount": "order_value"
  }
}
```

**Mapping Config Schema** (OCEL):
```json
{
  "event_id_column": "event_id",
  "event_type_column": "activity",
  "timestamp_column": "timestamp",
  "object_mappings": [
    {
      "object_type": "Order",
      "id_column": "order_id",
      "qualifier": null
    },
    {
      "object_type": "Item",
      "id_column": "item_id",
      "qualifier_column": "quantity"
    }
  ],
  "event_attributes": ["resource", "location"],
  "object_attributes": {
    "Order": ["customer_id", "total_amount"],
    "Item": ["product_name", "unit_price"]
  }
}
```

**Indexes**:
- `idx_import_jobs_pool` ON (data_pool_id, is_active)

---

#### Table: `import_job_runs`
**Purpose**: Execution history for import jobs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `job_id` | UUID | FK → import_jobs, NOT NULL | |
| `tenant_id` | UUID | NOT NULL | For partitioning |
| `status` | VARCHAR(50) | NOT NULL | 'running', 'success', 'failed', 'cancelled' |
| `started_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `completed_at` | TIMESTAMPTZ | | |
| `rows_read` | BIGINT | DEFAULT 0 | |
| `rows_written` | BIGINT | DEFAULT 0 | |
| `events_created` | BIGINT | DEFAULT 0 | |
| `objects_created` | BIGINT | DEFAULT 0 | |
| `error_message` | TEXT | | |
| `error_details` | JSONB | | Stack trace, context |
| `metrics` | JSONB | DEFAULT '{}' | Execution metrics |

**Partitioning**: RANGE by `started_at` (monthly)

**Indexes**:
- `idx_import_job_runs_job` ON (job_id, started_at DESC)
- `idx_import_job_runs_status` ON (tenant_id, status) WHERE status IN ('running', 'failed')

---

### 4.2 Case-Centric Process Mining

#### Table: `event_logs`
**Purpose**: Event log definitions for case-centric mining. Direct mapping to pm4py EventLog concept.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `data_pool_id` | UUID | FK → data_pools, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Event log name |
| `description` | TEXT | | |
| `case_notion` | VARCHAR(255) | NOT NULL | What constitutes a case |
| `activity_key` | VARCHAR(255) | DEFAULT 'concept:name' | Activity attribute name |
| `timestamp_key` | VARCHAR(255) | DEFAULT 'time:timestamp' | Timestamp attribute name |
| `resource_key` | VARCHAR(255) | DEFAULT 'org:resource' | Resource attribute name |
| `case_attributes` | JSONB | DEFAULT '[]' | Case-level attribute definitions |
| `event_attributes` | JSONB | DEFAULT '[]' | Event-level attribute definitions |
| `classifiers` | JSONB | DEFAULT '{}' | XES classifiers |
| `extensions` | JSONB | DEFAULT '{}' | XES extensions used |
| `global_attributes` | JSONB | DEFAULT '{}' | Global trace/event attributes |
| `statistics` | JSONB | DEFAULT '{}' | Cached statistics |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**pm4py Compatibility Notes**:
- `case_attributes` maps to trace-level attributes
- `classifiers` enables `pm4py.objects.log.obj.Classifiers`
- `extensions` maps to XES extension declarations
- Export function generates valid XES via `pm4py.write_xes()`

**Indexes**:
- `idx_event_logs_pool` ON (data_pool_id)
- `idx_event_logs_tenant_name` UNIQUE ON (tenant_id, name)

---

#### Table: `cases`
**Purpose**: Process instances (traces) in case-centric model.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Internal identifier |
| `tenant_id` | UUID | NOT NULL | |
| `event_log_id` | UUID | FK → event_logs, NOT NULL | |
| `case_id` | VARCHAR(500) | NOT NULL | Business case identifier |
| `variant_id` | UUID | FK → variants | Activity pattern |
| `start_time` | TIMESTAMPTZ | NOT NULL | First event timestamp |
| `end_time` | TIMESTAMPTZ | | Last event timestamp |
| `duration_seconds` | BIGINT | GENERATED | Computed throughput time |
| `event_count` | INTEGER | DEFAULT 0 | Number of events |
| `status` | VARCHAR(50) | | 'open', 'completed', 'cancelled' |
| `attributes` | JSONB | DEFAULT '{}' | Case-level attributes |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Partitioning**: RANGE by `start_time` (quarterly)

**Indexes**:
- `idx_cases_event_log_case_id` UNIQUE ON (event_log_id, case_id)
- `idx_cases_variant` ON (event_log_id, variant_id)
- `idx_cases_duration` ON (event_log_id, duration_seconds DESC)
- `idx_cases_status` ON (event_log_id, status, start_time DESC)
- `idx_cases_attributes` USING GIN (attributes)

**pm4py Export**:
```python
# This table maps to pm4py trace concept:
# trace = Trace(attributes={'concept:name': case_id, **attributes})
```

---

#### Table: `events`
**Purpose**: Individual activity occurrences. Core event data for process mining.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | NOT NULL | |
| `event_log_id` | UUID | FK → event_logs, NOT NULL | |
| `case_id` | UUID | FK → cases, NOT NULL | Parent case |
| `activity_id` | UUID | FK → activities | Activity type reference |
| `activity_name` | VARCHAR(500) | NOT NULL | Denormalized for query speed |
| `timestamp` | TIMESTAMPTZ | NOT NULL | Event occurrence time |
| `sort_key` | INTEGER | DEFAULT 0 | Tiebreaker for same timestamps |
| `resource_id` | UUID | FK → resources | Performer |
| `resource_name` | VARCHAR(255) | | Denormalized |
| `lifecycle` | VARCHAR(50) | DEFAULT 'complete' | 'start', 'complete', 'suspend', etc. |
| `cost` | DECIMAL(20, 4) | | Activity cost |
| `attributes` | JSONB | DEFAULT '{}' | Event-level attributes |

**Partitioning**: TimescaleDB hypertable on `timestamp`
- Chunk interval: 1 week
- Retention: Configurable per tenant

**Indexes**:
- `idx_events_case_time` ON (case_id, timestamp, sort_key)
- `idx_events_log_time` ON (event_log_id, timestamp DESC)
- `idx_events_activity` ON (event_log_id, activity_name, timestamp DESC)
- `idx_events_resource` ON (event_log_id, resource_id, timestamp DESC) WHERE resource_id IS NOT NULL
- `idx_events_attributes` USING GIN (attributes)
- `idx_events_lifecycle` ON (event_log_id, lifecycle, timestamp DESC) WHERE lifecycle != 'complete'

**pm4py Export**:
```python
# Maps to pm4py Event:
# event = Event({
#     'concept:name': activity_name,
#     'time:timestamp': timestamp,
#     'org:resource': resource_name,
#     'lifecycle:transition': lifecycle,
#     **attributes
# })
```

---

#### Table: `activities`
**Purpose**: Activity type catalog and metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `event_log_id` | UUID | FK → event_logs, NOT NULL | |
| `name` | VARCHAR(500) | NOT NULL | Activity name |
| `display_name` | VARCHAR(500) | | User-friendly name |
| `category` | VARCHAR(255) | | Grouping category |
| `is_automated` | BOOLEAN | DEFAULT FALSE | System vs. manual |
| `avg_duration_seconds` | INTEGER | | Historical average |
| `avg_cost` | DECIMAL(20, 4) | | Historical average cost |
| `occurrence_count` | BIGINT | DEFAULT 0 | Total occurrences |
| `icon` | VARCHAR(100) | | Icon identifier |
| `color` | VARCHAR(7) | | Hex color |
| `metadata` | JSONB | DEFAULT '{}' | Additional properties |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes**:
- `idx_activities_log_name` UNIQUE ON (event_log_id, name)
- `idx_activities_category` ON (event_log_id, category)

---

#### Table: `variants`
**Purpose**: Unique process execution patterns (activity sequences).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | NOT NULL | |
| `event_log_id` | UUID | FK → event_logs, NOT NULL | |
| `sequence` | TEXT[] | NOT NULL | Ordered activity names |
| `sequence_hash` | VARCHAR(64) | NOT NULL | SHA256 of sequence |
| `case_count` | BIGINT | DEFAULT 0 | Number of cases |
| `percentage` | DECIMAL(5, 2) | | Percentage of total cases |
| `avg_duration_seconds` | BIGINT | | Average throughput time |
| `min_duration_seconds` | BIGINT | | Minimum throughput time |
| `max_duration_seconds` | BIGINT | | Maximum throughput time |
| `is_happy_path` | BOOLEAN | DEFAULT FALSE | Most frequent variant |
| `first_seen_at` | TIMESTAMPTZ | | |
| `last_seen_at` | TIMESTAMPTZ | | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes**:
- `idx_variants_log_hash` UNIQUE ON (event_log_id, sequence_hash)
- `idx_variants_frequency` ON (event_log_id, case_count DESC)
- `idx_variants_happy_path` ON (event_log_id) WHERE is_happy_path = TRUE

**Sequence Hash Computation**:
```
sequence_hash = SHA256(array_to_string(sequence, ' → '))
Example: SHA256("Create Order → Approve → Ship → Invoice → Close")
```

**pm4py Integration**:
```python
# Maps directly to pm4py variant analysis:
# variants = pm4py.get_variants(log)
# variant_id maps to tuple(activity_sequence)
```

---

#### Table: `resources`
**Purpose**: Performers and organizational entities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `event_log_id` | UUID | FK → event_logs, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Resource identifier |
| `display_name` | VARCHAR(255) | | |
| `type` | VARCHAR(50) | DEFAULT 'human' | 'human', 'system', 'bot' |
| `department` | VARCHAR(255) | | Organizational unit |
| `role` | VARCHAR(255) | | Job role |
| `email` | VARCHAR(255) | | Contact email |
| `event_count` | BIGINT | DEFAULT 0 | Activities performed |
| `distinct_activities` | INTEGER | DEFAULT 0 | Number of different activities |
| `metadata` | JSONB | DEFAULT '{}' | Additional properties |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes**:
- `idx_resources_log_name` UNIQUE ON (event_log_id, name)
- `idx_resources_department` ON (event_log_id, department)
- `idx_resources_role` ON (event_log_id, role)

**pm4py SNA Integration**:
```python
# Enables organizational mining:
# handover = pm4py.discover_handover_of_work(log)
# together = pm4py.discover_working_together(log)
```

---

### 4.3 OCEL 2.0 Native Schema

The following tables implement the IEEE OCEL 2.0 standard for object-centric event logs.

#### Table: `ocel_event_types`
**Purpose**: Event type definitions with attribute schemas.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `data_pool_id` | UUID | FK → data_pools, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Event type name (activity) |
| `display_name` | VARCHAR(255) | | |
| `attribute_schema` | JSONB | NOT NULL | Attribute definitions |
| `description` | TEXT | | |
| `category` | VARCHAR(255) | | |
| `color` | VARCHAR(7) | | |
| `occurrence_count` | BIGINT | DEFAULT 0 | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Attribute Schema Format** (OCEL 2.0 compliant):
```json
{
  "attributes": [
    {
      "name": "resource",
      "type": "string",
      "required": false
    },
    {
      "name": "cost",
      "type": "float",
      "required": false
    },
    {
      "name": "location",
      "type": "string",
      "required": false
    }
  ]
}
```

**Indexes**:
- `idx_ocel_event_types_pool_name` UNIQUE ON (data_pool_id, name)

---

#### Table: `ocel_object_types`
**Purpose**: Object type definitions with attribute schemas.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `data_pool_id` | UUID | FK → data_pools, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Object type name |
| `display_name` | VARCHAR(255) | | |
| `attribute_schema` | JSONB | NOT NULL | Attribute definitions |
| `description` | TEXT | | |
| `icon` | VARCHAR(100) | | |
| `color` | VARCHAR(7) | | |
| `object_count` | BIGINT | DEFAULT 0 | |
| `is_process_object` | BOOLEAN | DEFAULT TRUE | Participates in process flow |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Attribute Schema Format**:
```json
{
  "attributes": [
    {
      "name": "customer_id",
      "type": "string",
      "required": true,
      "is_identifier": true
    },
    {
      "name": "total_amount",
      "type": "float",
      "required": false
    },
    {
      "name": "priority",
      "type": "string",
      "required": false,
      "enum": ["low", "medium", "high"]
    }
  ]
}
```

**Indexes**:
- `idx_ocel_object_types_pool_name` UNIQUE ON (data_pool_id, name)

---

#### Table: `ocel_events`
**Purpose**: Event instances in OCEL format.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Internal identifier |
| `tenant_id` | UUID | NOT NULL | |
| `data_pool_id` | UUID | FK → data_pools, NOT NULL | |
| `ocel_id` | VARCHAR(500) | NOT NULL | OCEL event identifier |
| `event_type_id` | UUID | FK → ocel_event_types, NOT NULL | |
| `event_type_name` | VARCHAR(255) | NOT NULL | Denormalized |
| `timestamp` | TIMESTAMPTZ | NOT NULL | |
| `attributes` | JSONB | DEFAULT '{}' | Event attributes |

**Partitioning**: TimescaleDB hypertable on `timestamp`

**Indexes**:
- `idx_ocel_events_pool_ocel_id` UNIQUE ON (data_pool_id, ocel_id)
- `idx_ocel_events_type_time` ON (data_pool_id, event_type_id, timestamp DESC)
- `idx_ocel_events_time` ON (data_pool_id, timestamp DESC)
- `idx_ocel_events_attributes` USING GIN (attributes)

**OCEL 2.0 JSON Export Format**:
```json
{
  "ocel:id": "e1",
  "ocel:type": "Create Order",
  "ocel:timestamp": "2024-01-15T10:30:00Z",
  "ocel:attributes": {
    "resource": "John",
    "location": "New York"
  }
}
```

---

#### Table: `ocel_objects`
**Purpose**: Object instances in OCEL format.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Internal identifier |
| `tenant_id` | UUID | NOT NULL | |
| `data_pool_id` | UUID | FK → data_pools, NOT NULL | |
| `ocel_id` | VARCHAR(500) | NOT NULL | OCEL object identifier |
| `object_type_id` | UUID | FK → ocel_object_types, NOT NULL | |
| `object_type_name` | VARCHAR(255) | NOT NULL | Denormalized |
| `attributes` | JSONB | DEFAULT '{}' | Current attribute values |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | First appearance |

**Partitioning**: LIST by `object_type_id` or HASH by `tenant_id`

**Indexes**:
- `idx_ocel_objects_pool_ocel_id` UNIQUE ON (data_pool_id, ocel_id)
- `idx_ocel_objects_type` ON (data_pool_id, object_type_id)
- `idx_ocel_objects_attributes` USING GIN (attributes)

---

#### Table: `ocel_e2o`
**Purpose**: Event-to-Object relationships (the core of OCEL).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | NOT NULL | |
| `data_pool_id` | UUID | NOT NULL | |
| `event_id` | UUID | FK → ocel_events, NOT NULL | |
| `object_id` | UUID | FK → ocel_objects, NOT NULL | |
| `qualifier` | VARCHAR(255) | | Relationship qualifier (e.g., "item", "sender") |
| `qualifier_value` | JSONB | | Quantitative qualifier (e.g., {"quantity": 5}) |

**Indexes**:
- `idx_ocel_e2o_event` ON (event_id)
- `idx_ocel_e2o_object` ON (object_id)
- `idx_ocel_e2o_unique` UNIQUE ON (event_id, object_id, qualifier)
- `idx_ocel_e2o_pool` ON (data_pool_id, event_id)

**Qualifier Examples**:
- Order processing: event "Pick Items" → object "Item" with qualifier "quantity: 3"
- Logistics: event "Ship Package" → object "Package" with qualifier "origin"
- Healthcare: event "Administer Medication" → object "Patient" with qualifier "dosage"

---

#### Table: `ocel_o2o`
**Purpose**: Object-to-Object relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | NOT NULL | |
| `data_pool_id` | UUID | NOT NULL | |
| `source_object_id` | UUID | FK → ocel_objects, NOT NULL | |
| `target_object_id` | UUID | FK → ocel_objects, NOT NULL | |
| `relationship_type` | VARCHAR(255) | NOT NULL | Type of relationship |
| `attributes` | JSONB | DEFAULT '{}' | Relationship attributes |
| `valid_from` | TIMESTAMPTZ | | Temporal validity start |
| `valid_to` | TIMESTAMPTZ | | Temporal validity end |

**Indexes**:
- `idx_ocel_o2o_source` ON (source_object_id, relationship_type)
- `idx_ocel_o2o_target` ON (target_object_id, relationship_type)
- `idx_ocel_o2o_type` ON (data_pool_id, relationship_type)

**Relationship Type Examples**:
- `contains` - Order contains Items
- `assigned_to` - Task assigned to Employee
- `part_of` - Component part of Assembly
- `follows` - Delivery follows Order
- `derived_from` - Invoice derived from Order

---

#### Table: `ocel_object_changes`
**Purpose**: Tracks attribute value changes over time (OCEL 2.0 feature).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | NOT NULL | |
| `object_id` | UUID | FK → ocel_objects, NOT NULL | |
| `event_id` | UUID | FK → ocel_events | Triggering event |
| `attribute_name` | VARCHAR(255) | NOT NULL | Changed attribute |
| `old_value` | JSONB | | Previous value |
| `new_value` | JSONB | NOT NULL | New value |
| `changed_at` | TIMESTAMPTZ | NOT NULL | |

**Indexes**:
- `idx_ocel_object_changes_object` ON (object_id, changed_at DESC)
- `idx_ocel_object_changes_event` ON (event_id) WHERE event_id IS NOT NULL
- `idx_ocel_object_changes_attr` ON (object_id, attribute_name, changed_at DESC)

**Use Case**: Enables analysis of how object states evolve through process execution.

---

### 4.4 Ontology & Semantics Layer

#### Table: `ontologies`
**Purpose**: Storage for OWL/RDF ontologies.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Ontology name |
| `version` | VARCHAR(50) | NOT NULL | Semantic version |
| `iri` | VARCHAR(500) | NOT NULL | Ontology IRI (namespace) |
| `description` | TEXT | | |
| `format` | VARCHAR(50) | DEFAULT 'owl/xml' | 'owl/xml', 'turtle', 'rdf/xml', 'jsonld' |
| `content` | TEXT | NOT NULL | Serialized ontology |
| `imported_iris` | JSONB | DEFAULT '[]' | Referenced ontologies |
| `statistics` | JSONB | DEFAULT '{}' | Class/property counts |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes**:
- `idx_ontologies_tenant_name` UNIQUE ON (tenant_id, name, version)
- `idx_ontologies_iri` ON (iri)

**Pre-loaded Ontologies**:
- Process Mining Ontology (PMO) - Standard process concepts
- BPMN Ontology - Business process modeling concepts
- Organization Ontology - Organizational structures
- Time Ontology - Temporal concepts

---

#### Table: `concepts`
**Purpose**: Domain concepts extracted from ontologies or user-defined.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `ontology_id` | UUID | FK → ontologies | Source ontology |
| `iri` | VARCHAR(500) | NOT NULL | Concept IRI |
| `local_name` | VARCHAR(255) | NOT NULL | Short name |
| `label` | VARCHAR(500) | | Human-readable label |
| `definition` | TEXT | | Concept definition |
| `concept_type` | VARCHAR(50) | NOT NULL | 'class', 'property', 'individual' |
| `parent_concept_id` | UUID | FK → concepts | Superclass |
| `domain_concept_id` | UUID | FK → concepts | For properties: domain |
| `range_concept_id` | UUID | FK → concepts | For properties: range |
| `metadata` | JSONB | DEFAULT '{}' | Additional OWL axioms |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes**:
- `idx_concepts_tenant_iri` UNIQUE ON (tenant_id, iri)
- `idx_concepts_ontology` ON (ontology_id)
- `idx_concepts_parent` ON (parent_concept_id) WHERE parent_concept_id IS NOT NULL
- `idx_concepts_type` ON (tenant_id, concept_type)
- `idx_concepts_label` ON (tenant_id, label)

**Example Concept Hierarchy**:
```
Thing
├── ProcessElement
│   ├── Activity
│   │   ├── AutomatedActivity
│   │   └── ManualActivity
│   ├── Event
│   └── Gateway
├── Resource
│   ├── HumanResource
│   └── SystemResource
└── BusinessObject
    ├── Order
    ├── Invoice
    └── Customer
```

---

#### Table: `concept_relations`
**Purpose**: Semantic relationships between concepts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | NOT NULL | |
| `source_concept_id` | UUID | FK → concepts, NOT NULL | |
| `target_concept_id` | UUID | FK → concepts, NOT NULL | |
| `relation_type` | VARCHAR(100) | NOT NULL | OWL relation type |
| `relation_iri` | VARCHAR(500) | | Custom property IRI |
| `cardinality` | VARCHAR(50) | | 'one-to-one', 'one-to-many', etc. |
| `metadata` | JSONB | DEFAULT '{}' | |

**Relation Types**:
- `subClassOf` - Inheritance
- `equivalentClass` - Equivalence
- `disjointWith` - Mutual exclusion
- `partOf` - Mereological
- `precedes` - Temporal ordering
- `triggers` - Causal relationship
- Custom object properties

**Indexes**:
- `idx_concept_relations_source` ON (source_concept_id, relation_type)
- `idx_concept_relations_target` ON (target_concept_id, relation_type)

---

#### Table: `annotations`
**Purpose**: Link data entities to ontological concepts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | NOT NULL | |
| `concept_id` | UUID | FK → concepts, NOT NULL | Ontology concept |
| `entity_type` | VARCHAR(100) | NOT NULL | Table name being annotated |
| `entity_id` | UUID | NOT NULL | ID of annotated entity |
| `confidence` | DECIMAL(5, 4) | DEFAULT 1.0 | Annotation confidence (0-1) |
| `annotation_type` | VARCHAR(50) | DEFAULT 'manual' | 'manual', 'automatic', 'inferred' |
| `reasoning_chain` | JSONB | | For inferred annotations |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Entity Types**:
- `activities` - Activity to concept mapping
- `ocel_event_types` - OCEL event type annotation
- `ocel_object_types` - OCEL object type annotation
- `resources` - Resource classification

**Indexes**:
- `idx_annotations_entity` ON (entity_type, entity_id)
- `idx_annotations_concept` ON (concept_id)
- `idx_annotations_type` ON (tenant_id, annotation_type)

**Use Cases**:
1. **Activity Classification**: Map "Create Purchase Order" to concept `ProcurementActivity`
2. **Object Typing**: Map object type "Invoice" to concept `FinancialDocument`
3. **Resource Classification**: Map resource "John" to concept `Approver`
4. **Semantic Search**: Find all activities of type `ApprovalActivity`

---

#### Table: `reasoning_rules`
**Purpose**: SWRL-style rules for inference.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Rule name |
| `description` | TEXT | | |
| `rule_body` | TEXT | NOT NULL | Antecedent (conditions) |
| `rule_head` | TEXT | NOT NULL | Consequent (conclusions) |
| `rule_format` | VARCHAR(50) | DEFAULT 'swrl' | 'swrl', 'sparql_construct', 'custom' |
| `priority` | INTEGER | DEFAULT 0 | Execution order |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `last_executed_at` | TIMESTAMPTZ | | |
| `inferences_count` | BIGINT | DEFAULT 0 | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Example SWRL Rules**:
```
# Rule: High-value orders get priority handling
Order(?o) ∧ hasAmount(?o, ?a) ∧ greaterThan(?a, 10000) → HighPriorityOrder(?o)

# Rule: Late deliveries indicate process issues
Delivery(?d) ∧ expectedDate(?d, ?exp) ∧ actualDate(?d, ?act) ∧ after(?act, ?exp) → LateDelivery(?d)

# Rule: Segregation of duties violation
Activity(?a1) ∧ Activity(?a2) ∧ performedBy(?a1, ?r) ∧ performedBy(?a2, ?r) ∧ 
requiresSOD(?a1, ?a2) → SODViolation(?a1, ?a2, ?r)
```

**Indexes**:
- `idx_reasoning_rules_tenant` ON (tenant_id, is_active, priority)

---

### 4.5 Process Discovery

#### Table: `discovered_models`
**Purpose**: Store process models discovered by mining algorithms.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `event_log_id` | UUID | FK → event_logs | For case-centric |
| `data_pool_id` | UUID | FK → data_pools | For OCEL |
| `name` | VARCHAR(255) | NOT NULL | Model name |
| `description` | TEXT | | |
| `algorithm` | VARCHAR(100) | NOT NULL | Discovery algorithm used |
| `algorithm_params` | JSONB | DEFAULT '{}' | Algorithm parameters |
| `model_type` | VARCHAR(50) | NOT NULL | 'petri_net', 'bpmn', 'dfg', 'process_tree', 'ocel_ocdfg' |
| `model_data` | JSONB | NOT NULL | Serialized model |
| `model_file_path` | VARCHAR(500) | | External file reference (PNML, BPMN XML) |
| `quality_metrics` | JSONB | DEFAULT '{}' | Fitness, precision, generalization, simplicity |
| `statistics` | JSONB | DEFAULT '{}' | Discovery statistics |
| `perspective` | VARCHAR(100) | | For OCEL: object type used as lead |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Algorithm Options**:
| Algorithm | Model Type | pm4py Function |
|-----------|------------|----------------|
| `alpha_miner` | petri_net | `pm4py.discover_petri_net_alpha()` |
| `alpha_plus` | petri_net | `pm4py.discover_petri_net_alpha_plus()` |
| `heuristics_miner` | petri_net | `pm4py.discover_petri_net_heuristics()` |
| `inductive_miner` | process_tree/petri_net | `pm4py.discover_petri_net_inductive()` |
| `inductive_miner_im` | process_tree | `pm4py.discover_process_tree_inductive()` |
| `dfg_discovery` | dfg | `pm4py.discover_dfg()` |
| `bpmn_inductive` | bpmn | `pm4py.discover_bpmn_inductive()` |
| `ocel_ocdfg` | ocel_ocdfg | `pm4py.discover_oc_petri_net()` |

**Model Data Format** (DFG example):
```json
{
  "nodes": ["Create Order", "Approve", "Ship", "Invoice"],
  "edges": [
    {"source": "Create Order", "target": "Approve", "frequency": 1000},
    {"source": "Approve", "target": "Ship", "frequency": 950},
    {"source": "Ship", "target": "Invoice", "frequency": 950}
  ],
  "start_activities": {"Create Order": 1000},
  "end_activities": {"Invoice": 950, "Cancel": 50}
}
```

**Quality Metrics Schema**:
```json
{
  "fitness": {
    "value": 0.95,
    "method": "token_replay"
  },
  "precision": {
    "value": 0.82,
    "method": "etconformance"
  },
  "generalization": {
    "value": 0.88,
    "method": "k-fold"
  },
  "simplicity": {
    "value": 0.75,
    "places": 12,
    "transitions": 15,
    "arcs": 28
  }
}
```

**Indexes**:
- `idx_discovered_models_event_log` ON (event_log_id) WHERE event_log_id IS NOT NULL
- `idx_discovered_models_pool` ON (data_pool_id) WHERE data_pool_id IS NOT NULL
- `idx_discovered_models_algorithm` ON (tenant_id, algorithm)
- `idx_discovered_models_type` ON (tenant_id, model_type)

---

#### Table: `petri_nets`
**Purpose**: Structured storage for Petri net models.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `discovered_model_id` | UUID | FK → discovered_models, NOT NULL, UNIQUE | |
| `tenant_id` | UUID | NOT NULL | |
| `name` | VARCHAR(255) | | |
| `initial_marking` | JSONB | NOT NULL | Place → token count |
| `final_marking` | JSONB | NOT NULL | Place → token count |
| `properties` | JSONB | DEFAULT '{}' | Soundness, liveness, etc. |

**Indexes**:
- `idx_petri_nets_model` ON (discovered_model_id)

---

#### Table: `petri_net_places`
**Purpose**: Places in Petri net models.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `petri_net_id` | UUID | FK → petri_nets, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Place identifier |
| `label` | VARCHAR(500) | | Display label |
| `is_initial` | BOOLEAN | DEFAULT FALSE | Part of initial marking |
| `is_final` | BOOLEAN | DEFAULT FALSE | Part of final marking |
| `position_x` | REAL | | Layout X coordinate |
| `position_y` | REAL | | Layout Y coordinate |

**Indexes**:
- `idx_petri_net_places_net` ON (petri_net_id)
- `idx_petri_net_places_name` UNIQUE ON (petri_net_id, name)

---

#### Table: `petri_net_transitions`
**Purpose**: Transitions in Petri net models.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `petri_net_id` | UUID | FK → petri_nets, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Transition identifier |
| `label` | VARCHAR(500) | | Activity name (NULL for silent) |
| `is_silent` | BOOLEAN | DEFAULT FALSE | Invisible transition (tau) |
| `activity_id` | UUID | FK → activities | Link to activity catalog |
| `position_x` | REAL | | Layout X coordinate |
| `position_y` | REAL | | Layout Y coordinate |
| `frequency` | BIGINT | | Observed frequency |

**Indexes**:
- `idx_petri_net_transitions_net` ON (petri_net_id)
- `idx_petri_net_transitions_name` UNIQUE ON (petri_net_id, name)
- `idx_petri_net_transitions_activity` ON (activity_id) WHERE activity_id IS NOT NULL

---

#### Table: `petri_net_arcs`
**Purpose**: Arcs connecting places and transitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `petri_net_id` | UUID | FK → petri_nets, NOT NULL | |
| `source_place_id` | UUID | FK → petri_net_places | |
| `source_transition_id` | UUID | FK → petri_net_transitions | |
| `target_place_id` | UUID | FK → petri_net_places | |
| `target_transition_id` | UUID | FK → petri_net_transitions | |
| `weight` | INTEGER | DEFAULT 1 | Arc weight |

**Constraints**:
- CHECK (source_place_id IS NOT NULL XOR source_transition_id IS NOT NULL)
- CHECK (target_place_id IS NOT NULL XOR target_transition_id IS NOT NULL)
- CHECK (source_place_id IS NULL OR target_transition_id IS NOT NULL) -- Place → Transition
- CHECK (source_transition_id IS NULL OR target_place_id IS NOT NULL) -- Transition → Place

**Indexes**:
- `idx_petri_net_arcs_net` ON (petri_net_id)
- `idx_petri_net_arcs_source_place` ON (source_place_id) WHERE source_place_id IS NOT NULL
- `idx_petri_net_arcs_source_trans` ON (source_transition_id) WHERE source_transition_id IS NOT NULL

---

#### Table: `bpmn_models`
**Purpose**: BPMN 2.0 model storage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `discovered_model_id` | UUID | FK → discovered_models, UNIQUE | |
| `tenant_id` | UUID | NOT NULL | |
| `bpmn_xml` | TEXT | NOT NULL | BPMN 2.0 XML serialization |
| `bpmn_json` | JSONB | NOT NULL | JSON representation for rendering |
| `process_id` | VARCHAR(255) | | BPMN process identifier |
| `pools` | JSONB | DEFAULT '[]' | Pool/lane definitions |
| `element_count` | INTEGER | | Total BPMN elements |

**BPMN JSON Schema**:
```json
{
  "nodes": [
    {
      "id": "start_1",
      "type": "startEvent",
      "name": "Start",
      "position": {"x": 100, "y": 200}
    },
    {
      "id": "task_1",
      "type": "task",
      "name": "Create Order",
      "position": {"x": 200, "y": 200}
    },
    {
      "id": "gateway_1",
      "type": "exclusiveGateway",
      "name": "Check Amount",
      "position": {"x": 300, "y": 200}
    }
  ],
  "edges": [
    {
      "id": "flow_1",
      "source": "start_1",
      "target": "task_1"
    },
    {
      "id": "flow_2",
      "source": "task_1",
      "target": "gateway_1",
      "condition": "amount > 1000"
    }
  ]
}
```

**Indexes**:
- `idx_bpmn_models_discovered` ON (discovered_model_id)

---

### 4.6 Conformance & Quality

#### Table: `conformance_jobs`
**Purpose**: Conformance checking job definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `event_log_id` | UUID | FK → event_logs | For case-centric |
| `data_pool_id` | UUID | FK → data_pools | For OCEL |
| `model_id` | UUID | FK → discovered_models, NOT NULL | Reference model |
| `name` | VARCHAR(255) | NOT NULL | Job name |
| `method` | VARCHAR(50) | NOT NULL | 'token_replay', 'alignment', 'footprints' |
| `configuration` | JSONB | DEFAULT '{}' | Method-specific settings |
| `schedule_cron` | VARCHAR(100) | | Scheduled execution |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Configuration Schema** (Alignment):
```json
{
  "cost_model": {
    "sync_cost": 0,
    "model_move_cost": 1,
    "log_move_cost": 1
  },
  "max_trace_length": 100,
  "timeout_seconds": 300
}
```

**Indexes**:
- `idx_conformance_jobs_model` ON (model_id)
- `idx_conformance_jobs_tenant` ON (tenant_id, is_active)

---

#### Table: `conformance_results`
**Purpose**: Aggregate conformance checking results.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `conformance_job_id` | UUID | FK → conformance_jobs, NOT NULL | |
| `tenant_id` | UUID | NOT NULL | |
| `computed_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `cases_checked` | BIGINT | NOT NULL | Number of cases analyzed |
| `conforming_cases` | BIGINT | NOT NULL | Cases without deviations |
| `non_conforming_cases` | BIGINT | NOT NULL | Cases with deviations |
| `fitness` | DECIMAL(5, 4) | | Overall fitness score (0-1) |
| `precision` | DECIMAL(5, 4) | | Precision score (0-1) |
| `generalization` | DECIMAL(5, 4) | | Generalization score (0-1) |
| `computation_time_ms` | BIGINT | | Execution duration |
| `detailed_metrics` | JSONB | DEFAULT '{}' | Algorithm-specific metrics |

**Detailed Metrics Schema**:
```json
{
  "token_replay": {
    "produced_tokens": 15000,
    "consumed_tokens": 14500,
    "remaining_tokens": 500,
    "missing_tokens": 200
  },
  "alignment": {
    "total_cost": 2500,
    "avg_cost_per_case": 0.05,
    "model_moves": 1200,
    "log_moves": 800,
    "sync_moves": 48000
  },
  "deviation_breakdown": {
    "by_activity": {
      "Approve": {"missing": 150, "unexpected": 20},
      "Ship": {"missing": 30, "unexpected": 0}
    }
  }
}
```

**Indexes**:
- `idx_conformance_results_job` ON (conformance_job_id, computed_at DESC)
- `idx_conformance_results_time` ON (tenant_id, computed_at DESC)

---

#### Table: `deviations`
**Purpose**: Individual conformance violations at trace level.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `conformance_result_id` | UUID | FK → conformance_results, NOT NULL | |
| `tenant_id` | UUID | NOT NULL | |
| `case_id` | UUID | FK → cases | Violating case |
| `event_id` | UUID | FK → events | Specific event |
| `deviation_type` | VARCHAR(50) | NOT NULL | 'missing', 'unexpected', 'wrong_order' |
| `expected_activity` | VARCHAR(500) | | What model expected |
| `actual_activity` | VARCHAR(500) | | What log contained |
| `position_in_trace` | INTEGER | | Where deviation occurred |
| `severity` | VARCHAR(20) | DEFAULT 'medium' | 'low', 'medium', 'high', 'critical' |
| `cost` | DECIMAL(10, 4) | | Alignment cost for this deviation |
| `details` | JSONB | DEFAULT '{}' | Additional context |
| `detected_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes**:
- `idx_deviations_result` ON (conformance_result_id)
- `idx_deviations_case` ON (case_id) WHERE case_id IS NOT NULL
- `idx_deviations_type` ON (tenant_id, deviation_type, detected_at DESC)
- `idx_deviations_severity` ON (tenant_id, severity) WHERE severity IN ('high', 'critical')

---

#### Table: `alignments`
**Purpose**: Store computed optimal alignments for cases.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `conformance_result_id` | UUID | FK → conformance_results, NOT NULL | |
| `case_id` | UUID | FK → cases, NOT NULL | |
| `tenant_id` | UUID | NOT NULL | |
| `alignment_cost` | DECIMAL(10, 4) | NOT NULL | Total alignment cost |
| `fitness_value` | DECIMAL(5, 4) | NOT NULL | Case-level fitness |
| `alignment_sequence` | JSONB | NOT NULL | Detailed alignment |
| `trace_length` | INTEGER | | Original trace length |
| `model_length` | INTEGER | | Model path length |
| `computation_time_ms` | INTEGER | | |

**Alignment Sequence Schema**:
```json
[
  {"type": "sync", "log": "Create Order", "model": "Create Order"},
  {"type": "sync", "log": "Approve", "model": "Approve"},
  {"type": "log_move", "log": "Extra Check", "model": null},
  {"type": "sync", "log": "Ship", "model": "Ship"},
  {"type": "model_move", "log": null, "model": "Invoice"}
]
```

**Indexes**:
- `idx_alignments_result` ON (conformance_result_id)
- `idx_alignments_case` ON (case_id)
- `idx_alignments_fitness` ON (tenant_id, fitness_value)

---

#### Table: `quality_metrics`
**Purpose**: Store model quality assessments over time.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `model_id` | UUID | FK → discovered_models, NOT NULL | |
| `tenant_id` | UUID | NOT NULL | |
| `computed_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `metric_type` | VARCHAR(50) | NOT NULL | 'fitness', 'precision', 'generalization', 'simplicity', 'f_score' |
| `value` | DECIMAL(5, 4) | NOT NULL | Metric value (0-1) |
| `method` | VARCHAR(100) | | Computation method |
| `sample_size` | BIGINT | | Cases/events used |
| `confidence_interval` | JSONB | | Statistical confidence |

**Indexes**:
- `idx_quality_metrics_model` ON (model_id, metric_type, computed_at DESC)
- `idx_quality_metrics_time` ON (tenant_id, computed_at DESC)

---

### 4.7 Performance & Analytics

#### Table: `performance_metrics`
**Purpose**: KPI definitions for process performance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `event_log_id` | UUID | FK → event_logs | |
| `data_pool_id` | UUID | FK → data_pools | |
| `name` | VARCHAR(255) | NOT NULL | Metric name |
| `description` | TEXT | | |
| `metric_type` | VARCHAR(50) | NOT NULL | 'throughput_time', 'waiting_time', 'service_time', 'count', 'cost', 'custom' |
| `aggregation` | VARCHAR(50) | DEFAULT 'avg' | 'avg', 'sum', 'min', 'max', 'median', 'p95' |
| `unit` | VARCHAR(50) | | 'seconds', 'hours', 'days', 'currency', 'count' |
| `formula` | TEXT | | For custom metrics |
| `filter_conditions` | JSONB | DEFAULT '{}' | Metric scope filters |
| `thresholds` | JSONB | DEFAULT '{}' | Warning/critical thresholds |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Metric Type Definitions**:
| Type | Description | pm4py Support |
|------|-------------|---------------|
| `throughput_time` | Case duration (end - start) | `pm4py.get_case_duration()` |
| `waiting_time` | Time between activities | Time between events |
| `service_time` | Activity execution time | Event duration |
| `count` | Occurrence frequency | Aggregation |
| `cost` | Financial metric | Attribute aggregation |
| `custom` | User-defined formula | Custom calculation |

**Thresholds Schema**:
```json
{
  "target": 48,
  "warning": 72,
  "critical": 120,
  "unit": "hours"
}
```

**Indexes**:
- `idx_performance_metrics_tenant` ON (tenant_id, metric_type)
- `idx_performance_metrics_log` ON (event_log_id) WHERE event_log_id IS NOT NULL

---

#### Table: `metric_values`
**Purpose**: Time-series storage for metric measurements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `metric_id` | UUID | FK → performance_metrics, NOT NULL | |
| `tenant_id` | UUID | NOT NULL | |
| `measured_at` | TIMESTAMPTZ | NOT NULL | Measurement timestamp |
| `period_start` | TIMESTAMPTZ | NOT NULL | Aggregation period start |
| `period_end` | TIMESTAMPTZ | NOT NULL | Aggregation period end |
| `value` | DECIMAL(20, 4) | NOT NULL | Metric value |
| `sample_count` | BIGINT | | Number of observations |
| `dimensions` | JSONB | DEFAULT '{}' | Dimensional breakdown |

**Partitioning**: TimescaleDB hypertable on `measured_at`

**Dimensions Schema**:
```json
{
  "activity": "Approve",
  "resource": "John",
  "variant": "Happy Path",
  "customer_segment": "Enterprise"
}
```

**Indexes**:
- `idx_metric_values_metric_time` ON (metric_id, measured_at DESC)
- `idx_metric_values_dimensions` USING GIN (dimensions)

---

#### Table: `bottleneck_analyses`
**Purpose**: Store bottleneck detection results.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `event_log_id` | UUID | FK → event_logs | |
| `data_pool_id` | UUID | FK → data_pools | |
| `name` | VARCHAR(255) | NOT NULL | Analysis name |
| `analyzed_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `method` | VARCHAR(50) | NOT NULL | 'sojourn_time', 'waiting_time', 'queue_length' |
| `results` | JSONB | NOT NULL | Analysis results |
| `recommendations` | JSONB | DEFAULT '[]' | Improvement suggestions |

**Results Schema**:
```json
{
  "bottlenecks": [
    {
      "activity": "Manager Approval",
      "rank": 1,
      "avg_waiting_time_hours": 24.5,
      "cases_affected": 4500,
      "contribution_to_total": 0.35,
      "following_activities": ["Ship", "Cancel"],
      "preceding_activities": ["Create Order", "Auto Approve"]
    },
    {
      "activity": "Quality Check",
      "rank": 2,
      "avg_waiting_time_hours": 8.2,
      "cases_affected": 2200,
      "contribution_to_total": 0.18
    }
  ],
  "summary": {
    "total_waiting_time_hours": 42.3,
    "total_service_time_hours": 12.1,
    "waiting_percentage": 0.78
  }
}
```

**Indexes**:
- `idx_bottleneck_analyses_tenant` ON (tenant_id, analyzed_at DESC)

---

#### Table: `sna_results`
**Purpose**: Social Network Analysis results.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `event_log_id` | UUID | FK → event_logs, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Analysis name |
| `analyzed_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `analysis_type` | VARCHAR(50) | NOT NULL | 'handover', 'working_together', 'subcontracting', 'similar_activities' |
| `network_data` | JSONB | NOT NULL | Node and edge data |
| `metrics` | JSONB | DEFAULT '{}' | Network metrics |

**Analysis Types** (pm4py organizational mining):
| Type | pm4py Function | Description |
|------|---------------|-------------|
| `handover` | `discover_handover_of_work()` | Work handoffs between resources |
| `working_together` | `discover_working_together()` | Collaboration patterns |
| `subcontracting` | `discover_subcontracting()` | Delegation patterns |
| `similar_activities` | `discover_activity_based()` | Resources doing similar work |

**Network Data Schema**:
```json
{
  "nodes": [
    {"id": "John", "type": "human", "department": "Sales", "event_count": 1500},
    {"id": "Jane", "type": "human", "department": "Operations", "event_count": 2200}
  ],
  "edges": [
    {"source": "John", "target": "Jane", "weight": 450, "type": "handover"}
  ]
}
```

**Metrics Schema**:
```json
{
  "density": 0.65,
  "avg_clustering": 0.42,
  "centrality": {
    "John": 0.85,
    "Jane": 0.72
  },
  "communities": [
    ["John", "Alice", "Bob"],
    ["Jane", "Charlie"]
  ]
}
```

**Indexes**:
- `idx_sna_results_tenant` ON (tenant_id, analysis_type, analyzed_at DESC)
- `idx_sna_results_log` ON (event_log_id)

---

#### Table: `dashboards`
**Purpose**: User-defined dashboard configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Dashboard name |
| `description` | TEXT | | |
| `layout` | JSONB | NOT NULL | Grid layout configuration |
| `widgets` | JSONB | NOT NULL | Widget definitions |
| `filters` | JSONB | DEFAULT '[]' | Dashboard-level filters |
| `refresh_interval_seconds` | INTEGER | DEFAULT 300 | Auto-refresh |
| `is_public` | BOOLEAN | DEFAULT FALSE | Shareable without auth |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Widgets Schema**:
```json
[
  {
    "id": "widget_1",
    "type": "kpi_card",
    "position": {"x": 0, "y": 0, "w": 3, "h": 2},
    "config": {
      "metric_id": "uuid",
      "title": "Avg Throughput Time",
      "format": "duration"
    }
  },
  {
    "id": "widget_2",
    "type": "process_map",
    "position": {"x": 3, "y": 0, "w": 9, "h": 6},
    "config": {
      "model_id": "uuid",
      "color_by": "frequency",
      "show_statistics": true
    }
  },
  {
    "id": "widget_3",
    "type": "time_series",
    "position": {"x": 0, "y": 2, "w": 6, "h": 4},
    "config": {
      "metric_ids": ["uuid1", "uuid2"],
      "time_range": "last_30_days"
    }
  }
]
```

**Indexes**:
- `idx_dashboards_tenant` ON (tenant_id, name)
- `idx_dashboards_public` ON (tenant_id) WHERE is_public = TRUE

---

### 4.8 Prediction & Machine Learning

#### Table: `prediction_models`
**Purpose**: Store trained ML models for process prediction.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `event_log_id` | UUID | FK → event_logs | |
| `data_pool_id` | UUID | FK → data_pools | |
| `name` | VARCHAR(255) | NOT NULL | Model name |
| `description` | TEXT | | |
| `prediction_type` | VARCHAR(50) | NOT NULL | 'next_activity', 'remaining_time', 'outcome', 'next_timestamp' |
| `algorithm` | VARCHAR(100) | NOT NULL | ML algorithm used |
| `hyperparameters` | JSONB | DEFAULT '{}' | Model hyperparameters |
| `feature_ids` | JSONB | NOT NULL | List of feature IDs used |
| `model_binary` | BYTEA | | Serialized model (pickle) |
| `model_file_path` | VARCHAR(500) | | External model storage |
| `training_date` | TIMESTAMPTZ | NOT NULL | When model was trained |
| `training_samples` | BIGINT | | Training set size |
| `status` | VARCHAR(50) | DEFAULT 'trained' | 'training', 'trained', 'deployed', 'retired' |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Prediction Types**:
| Type | Description | Output |
|------|-------------|--------|
| `next_activity` | Predict next activity in sequence | Activity name |
| `remaining_time` | Predict time to completion | Duration |
| `outcome` | Predict case outcome | Classification |
| `next_timestamp` | Predict when next event occurs | Timestamp |

**Algorithm Options**:
- `lstm` - Long Short-Term Memory networks
- `transformer` - Transformer-based models
- `random_forest` - Random Forest classifier/regressor
- `xgboost` - Gradient boosted trees
- `neural_network` - Generic neural network

**Indexes**:
- `idx_prediction_models_tenant` ON (tenant_id, prediction_type, status)
- `idx_prediction_models_log` ON (event_log_id) WHERE event_log_id IS NOT NULL

---

#### Table: `prediction_features`
**Purpose**: Feature definitions for ML models.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Feature name |
| `description` | TEXT | | |
| `feature_type` | VARCHAR(50) | NOT NULL | 'case_attribute', 'event_attribute', 'derived', 'temporal', 'sequence' |
| `data_type` | VARCHAR(50) | NOT NULL | 'numeric', 'categorical', 'boolean', 'embedding' |
| `source_column` | VARCHAR(255) | | For direct mappings |
| `derivation_formula` | TEXT | | For computed features |
| `encoding_method` | VARCHAR(50) | | 'one_hot', 'label', 'embedding', 'none' |
| `normalization` | VARCHAR(50) | | 'standard', 'minmax', 'none' |
| `missing_strategy` | VARCHAR(50) | DEFAULT 'mean' | 'mean', 'median', 'mode', 'zero', 'drop' |
| `statistics` | JSONB | DEFAULT '{}' | Feature statistics |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Feature Types**:
| Type | Description | Example |
|------|-------------|---------|
| `case_attribute` | Case-level attribute | Customer segment |
| `event_attribute` | Event-level attribute | Resource |
| `derived` | Computed feature | Days since start |
| `temporal` | Time-based feature | Day of week |
| `sequence` | Sequence encoding | Activity embedding |

**Indexes**:
- `idx_prediction_features_tenant` ON (tenant_id, feature_type)

---

#### Table: `predictions`
**Purpose**: Store prediction outputs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `prediction_model_id` | UUID | FK → prediction_models, NOT NULL | |
| `tenant_id` | UUID | NOT NULL | |
| `case_id` | UUID | FK → cases | Predicted case |
| `predicted_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `input_features` | JSONB | NOT NULL | Feature values used |
| `prediction_value` | TEXT | NOT NULL | Predicted value |
| `confidence` | DECIMAL(5, 4) | | Prediction confidence |
| `probabilities` | JSONB | | Class probabilities (classification) |
| `actual_value` | TEXT | | Ground truth (if known) |
| `is_correct` | BOOLEAN | | Prediction accuracy |

**Partitioning**: TimescaleDB hypertable on `predicted_at`

**Indexes**:
- `idx_predictions_model` ON (prediction_model_id, predicted_at DESC)
- `idx_predictions_case` ON (case_id) WHERE case_id IS NOT NULL
- `idx_predictions_accuracy` ON (prediction_model_id, is_correct) WHERE actual_value IS NOT NULL

---

#### Table: `model_evaluations`
**Purpose**: Track model performance over time.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `prediction_model_id` | UUID | FK → prediction_models, NOT NULL | |
| `tenant_id` | UUID | NOT NULL | |
| `evaluated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `evaluation_type` | VARCHAR(50) | NOT NULL | 'training', 'validation', 'test', 'production' |
| `sample_size` | BIGINT | NOT NULL | |
| `metrics` | JSONB | NOT NULL | Evaluation metrics |

**Metrics Schema** (Classification):
```json
{
  "accuracy": 0.85,
  "precision": 0.82,
  "recall": 0.88,
  "f1_score": 0.85,
  "auc_roc": 0.91,
  "confusion_matrix": [[100, 15], [12, 73]],
  "class_report": {
    "Approve": {"precision": 0.85, "recall": 0.90},
    "Reject": {"precision": 0.80, "recall": 0.75}
  }
}
```

**Metrics Schema** (Regression):
```json
{
  "mae": 2.5,
  "rmse": 3.2,
  "mape": 0.08,
  "r2_score": 0.87
}
```

**Indexes**:
- `idx_model_evaluations_model` ON (prediction_model_id, evaluated_at DESC)

---

### 4.9 Simulation

#### Table: `simulation_models`
**Purpose**: Simulation configuration and parameters.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `discovered_model_id` | UUID | FK → discovered_models | Base process model |
| `event_log_id` | UUID | FK → event_logs | Source data |
| `name` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | | |
| `simulation_type` | VARCHAR(50) | NOT NULL | 'discrete_event', 'monte_carlo', 'agent_based' |
| `base_configuration` | JSONB | NOT NULL | Base simulation setup |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Base Configuration Schema**:
```json
{
  "time_unit": "hours",
  "warm_up_period": 100,
  "simulation_duration": 10000,
  "arrival_rate": {
    "distribution": "exponential",
    "parameters": {"lambda": 2.5}
  },
  "resources": {
    "Clerk": {"capacity": 5, "cost_per_hour": 25},
    "Manager": {"capacity": 2, "cost_per_hour": 75}
  },
  "working_hours": {
    "start": "09:00",
    "end": "17:00",
    "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  }
}
```

**Indexes**:
- `idx_simulation_models_tenant` ON (tenant_id)
- `idx_simulation_models_discovered` ON (discovered_model_id) WHERE discovered_model_id IS NOT NULL

---

#### Table: `simulation_parameters`
**Purpose**: Detailed parameter distributions for simulation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `simulation_model_id` | UUID | FK → simulation_models, NOT NULL | |
| `element_type` | VARCHAR(50) | NOT NULL | 'activity', 'gateway', 'resource' |
| `element_name` | VARCHAR(255) | NOT NULL | Activity/gateway/resource name |
| `parameter_name` | VARCHAR(100) | NOT NULL | 'duration', 'probability', 'availability' |
| `distribution` | VARCHAR(50) | NOT NULL | Statistical distribution |
| `distribution_params` | JSONB | NOT NULL | Distribution parameters |
| `source` | VARCHAR(50) | DEFAULT 'mined' | 'mined', 'manual', 'estimated' |

**Distribution Types**:
| Distribution | Parameters | Use Case |
|--------------|------------|----------|
| `constant` | `{"value": 5}` | Fixed duration |
| `normal` | `{"mean": 10, "std": 2}` | Service time |
| `exponential` | `{"lambda": 0.5}` | Inter-arrival |
| `triangular` | `{"min": 1, "mode": 5, "max": 10}` | Estimated |
| `lognormal` | `{"mu": 2, "sigma": 0.5}` | Skewed duration |
| `uniform` | `{"min": 1, "max": 10}` | Random |
| `empirical` | `{"values": [...]}` | From data |

**Indexes**:
- `idx_simulation_parameters_model` ON (simulation_model_id, element_type)

---

#### Table: `simulation_runs`
**Purpose**: Simulation execution records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `simulation_model_id` | UUID | FK → simulation_models, NOT NULL | |
| `tenant_id` | UUID | NOT NULL | |
| `name` | VARCHAR(255) | | Scenario name |
| `scenario_config` | JSONB | DEFAULT '{}' | Scenario-specific overrides |
| `random_seed` | BIGINT | | For reproducibility |
| `started_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `completed_at` | TIMESTAMPTZ | | |
| `status` | VARCHAR(50) | NOT NULL | 'running', 'completed', 'failed', 'cancelled' |
| `replications` | INTEGER | DEFAULT 1 | Number of runs |
| `error_message` | TEXT | | |

**Scenario Config Schema** (What-if):
```json
{
  "modifications": [
    {
      "type": "add_resource",
      "resource": "Clerk",
      "capacity_delta": 2
    },
    {
      "type": "change_duration",
      "activity": "Review",
      "new_distribution": {
        "type": "normal",
        "mean": 5,
        "std": 1
      }
    },
    {
      "type": "change_routing",
      "gateway": "Check Amount",
      "probabilities": {
        "High Value": 0.3,
        "Standard": 0.7
      }
    }
  ]
}
```

**Indexes**:
- `idx_simulation_runs_model` ON (simulation_model_id, started_at DESC)
- `idx_simulation_runs_status` ON (tenant_id, status)

---

#### Table: `simulation_results`
**Purpose**: Simulation output and statistics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `simulation_run_id` | UUID | FK → simulation_runs, NOT NULL | |
| `tenant_id` | UUID | NOT NULL | |
| `replication_number` | INTEGER | DEFAULT 1 | Which run |
| `summary_statistics` | JSONB | NOT NULL | Aggregate metrics |
| `activity_statistics` | JSONB | NOT NULL | Per-activity metrics |
| `resource_statistics` | JSONB | NOT NULL | Per-resource metrics |
| `queue_statistics` | JSONB | DEFAULT '{}' | Queue analysis |
| `cost_analysis` | JSONB | DEFAULT '{}' | Cost breakdown |
| `raw_output_path` | VARCHAR(500) | | Detailed output file |

**Summary Statistics Schema**:
```json
{
  "cases_completed": 5000,
  "avg_cycle_time": 48.5,
  "avg_waiting_time": 32.1,
  "avg_service_time": 16.4,
  "throughput_rate": 10.5,
  "total_cost": 125000,
  "resource_utilization": 0.72
}
```

**Activity Statistics Schema**:
```json
{
  "Create Order": {
    "executions": 5000,
    "avg_duration": 5.2,
    "avg_waiting": 2.1,
    "avg_queue_length": 3.5
  },
  "Approve": {
    "executions": 4800,
    "avg_duration": 15.3,
    "avg_waiting": 18.5,
    "avg_queue_length": 12.2
  }
}
```

**Indexes**:
- `idx_simulation_results_run` ON (simulation_run_id, replication_number)

---

### 4.10 Automation & Actions

#### Table: `action_rules`
**Purpose**: Define conditions that trigger automated actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Rule name |
| `description` | TEXT | | |
| `event_log_id` | UUID | FK → event_logs | Scope to event log |
| `data_pool_id` | UUID | FK → data_pools | Scope to data pool |
| `rule_type` | VARCHAR(50) | NOT NULL | 'pattern', 'threshold', 'anomaly', 'schedule' |
| `condition` | JSONB | NOT NULL | Rule condition definition |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `cooldown_seconds` | INTEGER | DEFAULT 300 | Min time between triggers |
| `last_triggered_at` | TIMESTAMPTZ | | |
| `trigger_count` | BIGINT | DEFAULT 0 | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Rule Types**:

**Pattern Rule** (Detect activity patterns):
```json
{
  "type": "pattern",
  "pattern": {
    "sequence": ["Approve", "Reject", "Approve"],
    "within_hours": 24
  },
  "scope": "case"
}
```

**Threshold Rule** (KPI breach):
```json
{
  "type": "threshold",
  "metric_id": "uuid",
  "operator": "greater_than",
  "threshold": 72,
  "time_window_hours": 1
}
```

**Anomaly Rule** (Statistical deviation):
```json
{
  "type": "anomaly",
  "metric": "throughput_time",
  "method": "z_score",
  "threshold": 3.0
}
```

**Indexes**:
- `idx_action_rules_tenant` ON (tenant_id, is_active, rule_type)
- `idx_action_rules_log` ON (event_log_id) WHERE event_log_id IS NOT NULL

---

#### Table: `actions`
**Purpose**: Define executable actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `rule_id` | UUID | FK → action_rules, NOT NULL | Triggering rule |
| `action_type` | VARCHAR(50) | NOT NULL | 'webhook', 'email', 'slack', 'create_task', 'update_attribute' |
| `action_order` | INTEGER | DEFAULT 0 | Execution order |
| `configuration` | JSONB | NOT NULL | Action-specific config |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Action Configurations**:

**Webhook**:
```json
{
  "url": "https://api.example.com/webhook",
  "method": "POST",
  "headers": {"Authorization": "Bearer ${SECRET}"},
  "body_template": {
    "case_id": "{{case.id}}",
    "alert_type": "threshold_breach",
    "value": "{{trigger.value}}"
  },
  "timeout_seconds": 30,
  "retry_count": 3
}
```

**Email**:
```json
{
  "to": ["process-owner@company.com"],
  "cc": [],
  "subject": "Process Alert: {{rule.name}}",
  "body_template": "Case {{case.id}} has exceeded the threshold...",
  "include_details": true
}
```

**Slack**:
```json
{
  "webhook_url": "https://hooks.slack.com/...",
  "channel": "#process-alerts",
  "message_template": ":warning: *Alert:* {{rule.name}}\nCase: {{case.id}}"
}
```

**Indexes**:
- `idx_actions_rule` ON (rule_id, action_order)

---

#### Table: `action_executions`
**Purpose**: Log of action executions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `action_id` | UUID | FK → actions, NOT NULL | |
| `rule_id` | UUID | FK → action_rules, NOT NULL | |
| `tenant_id` | UUID | NOT NULL | |
| `triggered_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `trigger_context` | JSONB | NOT NULL | What triggered the action |
| `status` | VARCHAR(50) | NOT NULL | 'success', 'failed', 'pending', 'skipped' |
| `response` | JSONB | | Action response/result |
| `error_message` | TEXT | | |
| `execution_time_ms` | INTEGER | | |

**Partitioning**: TimescaleDB hypertable on `triggered_at`

**Indexes**:
- `idx_action_executions_action` ON (action_id, triggered_at DESC)
- `idx_action_executions_status` ON (tenant_id, status, triggered_at DESC)

---

#### Table: `workflows`
**Purpose**: Multi-step automation workflows.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | | |
| `trigger_type` | VARCHAR(50) | NOT NULL | 'rule', 'schedule', 'manual', 'api' |
| `trigger_config` | JSONB | DEFAULT '{}' | Trigger configuration |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `timeout_seconds` | INTEGER | DEFAULT 3600 | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes**:
- `idx_workflows_tenant` ON (tenant_id, is_active)

---

#### Table: `workflow_steps`
**Purpose**: Individual steps in workflows.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `workflow_id` | UUID | FK → workflows, NOT NULL | |
| `step_order` | INTEGER | NOT NULL | Execution sequence |
| `step_type` | VARCHAR(50) | NOT NULL | 'action', 'condition', 'wait', 'parallel', 'loop' |
| `configuration` | JSONB | NOT NULL | Step configuration |
| `on_success_step_id` | UUID | FK → workflow_steps | Next step on success |
| `on_failure_step_id` | UUID | FK → workflow_steps | Next step on failure |
| `timeout_seconds` | INTEGER | | Step-level timeout |

**Step Types**:
- `action` - Execute an action
- `condition` - Branching logic
- `wait` - Delay execution
- `parallel` - Execute multiple steps concurrently
- `loop` - Iterate over collection

**Indexes**:
- `idx_workflow_steps_workflow` ON (workflow_id, step_order)

---

#### Table: `scheduled_jobs`
**Purpose**: Cron-style scheduled job definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | |
| `job_type` | VARCHAR(50) | NOT NULL | 'import', 'discovery', 'conformance', 'prediction', 'workflow' |
| `target_id` | UUID | | ID of target entity |
| `cron_expression` | VARCHAR(100) | NOT NULL | Cron schedule |
| `timezone` | VARCHAR(50) | DEFAULT 'UTC' | |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `next_run_at` | TIMESTAMPTZ | | Calculated next execution |
| `last_run_at` | TIMESTAMPTZ | | |
| `last_status` | VARCHAR(50) | | |
| `configuration` | JSONB | DEFAULT '{}' | Job-specific config |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes**:
- `idx_scheduled_jobs_next_run` ON (next_run_at) WHERE is_active = TRUE
- `idx_scheduled_jobs_tenant` ON (tenant_id, job_type)

---

### 4.11 Graph Database Integration (Neo4j)

#### Table: `graph_projections`
**Purpose**: Define what data to project to Neo4j.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Projection name |
| `description` | TEXT | | |
| `source_type` | VARCHAR(50) | NOT NULL | 'event_log', 'data_pool', 'discovered_model' |
| `source_id` | UUID | NOT NULL | Source entity ID |
| `projection_config` | JSONB | NOT NULL | What to project |
| `neo4j_database` | VARCHAR(100) | DEFAULT 'neo4j' | Target database |
| `sync_mode` | VARCHAR(50) | DEFAULT 'full' | 'full', 'incremental', 'cdc' |
| `sync_interval_seconds` | INTEGER | DEFAULT 3600 | For scheduled sync |
| `last_sync_at` | TIMESTAMPTZ | | |
| `last_sync_status` | VARCHAR(50) | | |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Projection Config Schema**:
```json
{
  "node_types": [
    {
      "label": "Event",
      "source_table": "events",
      "properties": ["id", "activity_name", "timestamp", "resource_name"],
      "id_property": "id"
    },
    {
      "label": "Case",
      "source_table": "cases",
      "properties": ["id", "case_id", "status", "duration_seconds"],
      "id_property": "id"
    },
    {
      "label": "Activity",
      "source_table": "activities",
      "properties": ["id", "name", "category"],
      "id_property": "id"
    }
  ],
  "relationship_types": [
    {
      "type": "DIRECTLY_FOLLOWS",
      "source_label": "Event",
      "target_label": "Event",
      "derivation": "sequential_in_case"
    },
    {
      "type": "IN_CASE",
      "source_label": "Event",
      "target_label": "Case",
      "source_fk": "case_id"
    },
    {
      "type": "OF_TYPE",
      "source_label": "Event",
      "target_label": "Activity",
      "source_fk": "activity_id"
    }
  ],
  "indexes": [
    {"label": "Event", "property": "timestamp"},
    {"label": "Case", "property": "case_id"}
  ]
}
```

**Indexes**:
- `idx_graph_projections_tenant` ON (tenant_id, source_type)
- `idx_graph_projections_source` ON (source_type, source_id)

---

#### Table: `graph_sync_log`
**Purpose**: Track synchronization between PostgreSQL and Neo4j.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `projection_id` | UUID | FK → graph_projections, NOT NULL | |
| `tenant_id` | UUID | NOT NULL | |
| `started_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `completed_at` | TIMESTAMPTZ | | |
| `status` | VARCHAR(50) | NOT NULL | 'running', 'success', 'failed', 'partial' |
| `nodes_created` | BIGINT | DEFAULT 0 | |
| `nodes_updated` | BIGINT | DEFAULT 0 | |
| `nodes_deleted` | BIGINT | DEFAULT 0 | |
| `relationships_created` | BIGINT | DEFAULT 0 | |
| `relationships_deleted` | BIGINT | DEFAULT 0 | |
| `error_message` | TEXT | | |
| `sync_checkpoint` | JSONB | | For incremental sync |

**Partitioning**: RANGE by `started_at` (monthly)

**Indexes**:
- `idx_graph_sync_log_projection` ON (projection_id, started_at DESC)

---

#### Table: `graph_queries`
**Purpose**: Store reusable Cypher queries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `tenant_id` | UUID | FK → tenants, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | Query name |
| `description` | TEXT | | |
| `category` | VARCHAR(100) | | 'process_discovery', 'sna', 'pattern', 'custom' |
| `cypher_query` | TEXT | NOT NULL | Cypher query template |
| `parameters` | JSONB | DEFAULT '[]' | Expected parameters |
| `return_type` | VARCHAR(50) | | 'nodes', 'relationships', 'paths', 'scalar', 'table' |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Example Queries**:

**Directly-Follows Graph**:
```cypher
MATCH (e1:Event)-[:DIRECTLY_FOLLOWS]->(e2:Event)
WHERE e1.timestamp >= $start_date AND e1.timestamp <= $end_date
RETURN e1.activity_name AS source, e2.activity_name AS target, count(*) AS frequency
ORDER BY frequency DESC
```

**Process Variant Detection**:
```cypher
MATCH path = (c:Case)-[:CONTAINS]->(e:Event)
WITH c, collect(e.activity_name) AS activities
RETURN activities, count(c) AS case_count
ORDER BY case_count DESC
LIMIT 10
```

**Social Network (Handover)**:
```cypher
MATCH (e1:Event)-[:DIRECTLY_FOLLOWS]->(e2:Event)
WHERE e1.resource_name IS NOT NULL AND e2.resource_name IS NOT NULL
  AND e1.resource_name <> e2.resource_name
RETURN e1.resource_name AS source, e2.resource_name AS target, count(*) AS handovers
```

**Indexes**:
- `idx_graph_queries_tenant` ON (tenant_id, category)

---

## 5. RELATIONSHIP MAP

### 5.1 Core Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ENTITY RELATIONSHIP DIAGRAM                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TENANTS (1)                                                                │
│    │                                                                        │
│    ├──► DATA_POOLS (N)                                                      │
│    │       │                                                                │
│    │       ├──► DATA_CONNECTIONS (N)                                        │
│    │       │                                                                │
│    │       ├──► EVENT_LOGS (N) ─────────────────────────┐                   │
│    │       │       │                                    │                   │
│    │       │       ├──► CASES (N)                       │                   │
│    │       │       │       │                            │                   │
│    │       │       │       └──► EVENTS (N)              │                   │
│    │       │       │                                    │                   │
│    │       │       ├──► ACTIVITIES (N)                  │                   │
│    │       │       │                                    │                   │
│    │       │       ├──► VARIANTS (N)                    │                   │
│    │       │       │                                    │                   │
│    │       │       └──► RESOURCES (N)                   │                   │
│    │       │                                            │                   │
│    │       ├──► OCEL_EVENT_TYPES (N)                    │                   │
│    │       │       │                                    │                   │
│    │       │       └──► OCEL_EVENTS (N) ◄───────────────┤                   │
│    │       │               │                            │                   │
│    │       │               └──► OCEL_E2O (N)            │                   │
│    │       │                       │                    │                   │
│    │       ├──► OCEL_OBJECT_TYPES (N)                   │                   │
│    │       │       │                            ┌───────┘                   │
│    │       │       └──► OCEL_OBJECTS (N) ◄──────┤                           │
│    │       │               │                    │                           │
│    │       │               └──► OCEL_O2O (N)    │                           │
│    │       │                                    │                           │
│    │       └──► DISCOVERED_MODELS (N) ◄─────────┘                           │
│    │               │                                                        │
│    │               ├──► PETRI_NETS (1)                                      │
│    │               │       ├──► PLACES (N)                                  │
│    │               │       ├──► TRANSITIONS (N)                             │
│    │               │       └──► ARCS (N)                                    │
│    │               │                                                        │
│    │               ├──► BPMN_MODELS (1)                                     │
│    │               │                                                        │
│    │               └──► CONFORMANCE_JOBS (N)                                │
│    │                       │                                                │
│    │                       └──► CONFORMANCE_RESULTS (N)                     │
│    │                               │                                        │
│    │                               ├──► DEVIATIONS (N)                      │
│    │                               └──► ALIGNMENTS (N)                      │
│    │                                                                        │
│    ├──► ONTOLOGIES (N)                                                      │
│    │       │                                                                │
│    │       └──► CONCEPTS (N)                                                │
│    │               │                                                        │
│    │               ├──► CONCEPT_RELATIONS (N)                               │
│    │               └──► ANNOTATIONS (N)                                     │
│    │                                                                        │
│    ├──► ACTION_RULES (N)                                                    │
│    │       │                                                                │
│    │       └──► ACTIONS (N)                                                 │
│    │               │                                                        │
│    │               └──► ACTION_EXECUTIONS (N)                               │
│    │                                                                        │
│    └──► GRAPH_PROJECTIONS (N)                                               │
│            │                                                                │
│            └──► GRAPH_SYNC_LOG (N)                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Foreign Key Relationships

| Parent Table | Child Table | FK Column | Cardinality | ON DELETE |
|--------------|-------------|-----------|-------------|-----------|
| `tenants` | `data_pools` | `tenant_id` | 1:N | CASCADE |
| `data_pools` | `event_logs` | `data_pool_id` | 1:N | CASCADE |
| `data_pools` | `ocel_event_types` | `data_pool_id` | 1:N | CASCADE |
| `data_pools` | `ocel_object_types` | `data_pool_id` | 1:N | CASCADE |
| `event_logs` | `cases` | `event_log_id` | 1:N | CASCADE |
| `event_logs` | `activities` | `event_log_id` | 1:N | CASCADE |
| `event_logs` | `variants` | `event_log_id` | 1:N | CASCADE |
| `event_logs` | `resources` | `event_log_id` | 1:N | CASCADE |
| `cases` | `events` | `case_id` | 1:N | CASCADE |
| `cases` | `variants` | `variant_id` | N:1 | SET NULL |
| `activities` | `events` | `activity_id` | 1:N | SET NULL |
| `resources` | `events` | `resource_id` | 1:N | SET NULL |
| `ocel_event_types` | `ocel_events` | `event_type_id` | 1:N | CASCADE |
| `ocel_object_types` | `ocel_objects` | `object_type_id` | 1:N | CASCADE |
| `ocel_events` | `ocel_e2o` | `event_id` | 1:N | CASCADE |
| `ocel_objects` | `ocel_e2o` | `object_id` | 1:N | CASCADE |
| `ocel_objects` | `ocel_o2o` | `source_object_id` | 1:N | CASCADE |
| `ocel_objects` | `ocel_o2o` | `target_object_id` | 1:N | CASCADE |
| `discovered_models` | `petri_nets` | `discovered_model_id` | 1:1 | CASCADE |
| `discovered_models` | `bpmn_models` | `discovered_model_id` | 1:1 | CASCADE |
| `discovered_models` | `conformance_jobs` | `model_id` | 1:N | RESTRICT |
| `conformance_jobs` | `conformance_results` | `conformance_job_id` | 1:N | CASCADE |
| `conformance_results` | `deviations` | `conformance_result_id` | 1:N | CASCADE |
| `conformance_results` | `alignments` | `conformance_result_id` | 1:N | CASCADE |
| `tenants` | `ontologies` | `tenant_id` | 1:N | CASCADE |
| `ontologies` | `concepts` | `ontology_id` | 1:N | CASCADE |
| `concepts` | `annotations` | `concept_id` | 1:N | CASCADE |
| `action_rules` | `actions` | `rule_id` | 1:N | CASCADE |
| `actions` | `action_executions` | `action_id` | 1:N | RESTRICT |

---

## 6. INDEXING STRATEGY

### 6.1 Index Types by Use Case

| Index Type | Tables | Columns | Purpose |
|------------|--------|---------|---------|
| **B-Tree (Primary)** | All | `id` | Primary key lookups |
| **B-Tree (Foreign)** | All with FK | FK columns | Join performance |
| **B-Tree (Unique)** | tenant-scoped | `(tenant_id, name)` | Business key uniqueness |
| **B-Tree (Composite)** | events, ocel_events | `(case_id, timestamp)` | Time-ordered case retrieval |
| **GIN (JSONB)** | All with JSONB | `attributes`, `configuration` | JSON property queries |
| **BRIN (Time-series)** | events, ocel_events, metrics | `timestamp` | Time-range scans |
| **GiST (Temporal)** | ocel_o2o | `(valid_from, valid_to)` | Temporal validity queries |

### 6.2 Critical Indexes for pm4py Operations

**Event Log Loading** (`pm4py.read_xes()` equivalent):
```sql
-- Fast case-ordered event retrieval
CREATE INDEX idx_events_case_timestamp ON events (case_id, timestamp, sort_key);

-- Activity filtering
CREATE INDEX idx_events_activity_time ON events (event_log_id, activity_name, timestamp DESC);
```

**Variant Analysis** (`pm4py.get_variants()`):
```sql
-- Fast variant lookup
CREATE INDEX idx_variants_hash ON variants (event_log_id, sequence_hash);

-- Variant frequency ordering
CREATE INDEX idx_variants_freq ON variants (event_log_id, case_count DESC);
```

**OCEL Queries**:
```sql
-- Event-Object relationship traversal
CREATE INDEX idx_ocel_e2o_event ON ocel_e2o (event_id);
CREATE INDEX idx_ocel_e2o_object ON ocel_e2o (object_id);
CREATE INDEX idx_ocel_e2o_composite ON ocel_e2o (event_id, object_id, qualifier);

-- Object-Object relationship traversal
CREATE INDEX idx_ocel_o2o_source ON ocel_o2o (source_object_id, relationship_type);
CREATE INDEX idx_ocel_o2o_target ON ocel_o2o (target_object_id, relationship_type);
```

**Process Discovery**:
```sql
-- DFG computation (directly-follows pairs)
CREATE INDEX idx_events_dfg ON events (event_log_id, case_id, timestamp);

-- Activity sequence retrieval
CREATE INDEX idx_events_sequence ON events (case_id, timestamp, activity_name);
```

---

## 7. PARTITIONING & SCALABILITY

### 7.1 TimescaleDB Hypertables

**Events Table**:
```sql
-- Convert to hypertable
SELECT create_hypertable('events', 'timestamp', 
    chunk_time_interval => INTERVAL '1 week',
    if_not_exists => TRUE
);

-- Add space partitioning by tenant
SELECT add_dimension('events', 'tenant_id', number_partitions => 16);

-- Compression policy (after 7 days)
SELECT add_compression_policy('events', INTERVAL '7 days');

-- Retention policy
SELECT add_retention_policy('events', INTERVAL '365 days');
```

**OCEL Events Table**:
```sql
SELECT create_hypertable('ocel_events', 'timestamp',
    chunk_time_interval => INTERVAL '1 week'
);

SELECT add_dimension('ocel_events', 'tenant_id', number_partitions => 16);
```

### 7.2 PostgreSQL Native Partitioning

**Import Job Runs** (Monthly):
```sql
CREATE TABLE import_job_runs (
    ...
) PARTITION BY RANGE (started_at);

CREATE TABLE import_job_runs_y2025m01 
    PARTITION OF import_job_runs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

**Action Executions** (Monthly):
```sql
CREATE TABLE action_executions (
    ...
) PARTITION BY RANGE (triggered_at);
```

### 7.3 Scaling Recommendations

| Scale Level | Events/Month | Strategy |
|-------------|--------------|----------|
| **Starter** (<1M) | <1M | Single PostgreSQL + TimescaleDB |
| **Growth** (1-50M) | 1-50M | PostgreSQL HA + Read replicas |
| **Scale** (50-500M) | 50-500M | Citus for horizontal sharding |
| **Enterprise** (>500M) | >500M | Hybrid: Citus + ClickHouse for analytics |

---

## 8. DATA INTEGRATION PATTERNS

### 8.1 pm4py Integration

**Event Log Export Function** (PostgreSQL → pm4py):
```python
# Pseudocode - implementation in application layer
def export_to_pm4py(event_log_id: UUID) -> pm4py.EventLog:
    """
    Query PostgreSQL and create pm4py EventLog object
    """
    # 1. Get event log metadata
    log_meta = query("SELECT * FROM event_logs WHERE id = ?", event_log_id)
    
    # 2. Get all cases with events
    cases_data = query("""
        SELECT c.case_id, c.attributes as case_attrs,
               e.activity_name, e.timestamp, e.resource_name, e.attributes as event_attrs
        FROM cases c
        JOIN events e ON e.case_id = c.id
        WHERE c.event_log_id = ?
        ORDER BY c.id, e.timestamp, e.sort_key
    """, event_log_id)
    
    # 3. Build pm4py EventLog
    log = EventLog()
    log.attributes['concept:name'] = log_meta.name
    
    for case_id, case_events in group_by(cases_data, 'case_id'):
        trace = Trace()
        trace.attributes['concept:name'] = case_id
        # ... add events to trace
        log.append(trace)
    
    return log
```

### 8.2 OCEL 2.0 Export

**OCEL JSON Export Structure**:
```json
{
  "ocel:global-event": {
    "ocel:activity": "__INVALID__"
  },
  "ocel:global-object": {
    "ocel:type": "__INVALID__"
  },
  "ocel:global-log": {
    "ocel:attribute-names": ["resource", "cost"],
    "ocel:object-types": ["Order", "Item", "Customer"],
    "ocel:version": "2.0"
  },
  "ocel:events": {
    "e1": {
      "ocel:activity": "Create Order",
      "ocel:timestamp": "2024-01-15T10:30:00Z",
      "ocel:omap": ["o1", "i1", "i2"],
      "ocel:vmap": {"resource": "John"}
    }
  },
  "ocel:objects": {
    "o1": {
      "ocel:type": "Order",
      "ocel:ovmap": {
        "total": 150.00
      }
    }
  }
}
```

### 8.3 Neo4j Sync Pattern

**Change Data Capture (CDC) Flow**:
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  PostgreSQL  │────►│   Debezium   │────►│    Kafka     │
│   (Source)   │     │    (CDC)     │     │   (Queue)    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │  Neo4j Sink  │
                                          │  Connector   │
                                          └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │    Neo4j     │
                                          │   (Graph)    │
                                          └──────────────┘
```

### 8.4 OWL Integration Pattern

**Ontology Import/Export**:
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   OWL File   │────►│   OWLReady2  │────►│  PostgreSQL  │
│   (.owl)     │     │   (Parser)   │     │  (ontologies │
└──────────────┘     └──────────────┘     │   concepts)  │
                                          └──────────────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │   HermiT /   │
                                          │   Pellet     │
                                          │  (Reasoner)  │
                                          └──────────────┘
```

---

## 9. pm4py ALGORITHM MAPPING

### 9.1 Discovery Algorithms

| Algorithm | pm4py Function | Input Table | Output Table |
|-----------|---------------|-------------|--------------|
| Alpha Miner | `discover_petri_net_alpha()` | `events` | `petri_nets`, `petri_net_*` |
| Alpha+ Miner | `discover_petri_net_alpha_plus()` | `events` | `petri_nets`, `petri_net_*` |
| Heuristics Miner | `discover_petri_net_heuristics()` | `events` | `petri_nets`, `petri_net_*` |
| Inductive Miner | `discover_petri_net_inductive()` | `events` | `petri_nets`, `petri_net_*` |
| Inductive (Tree) | `discover_process_tree_inductive()` | `events` | `discovered_models` (JSONB) |
| DFG Discovery | `discover_dfg()` | `events` | `discovered_models` (JSONB) |
| BPMN Discovery | `discover_bpmn_inductive()` | `events` | `bpmn_models` |
| OCEL OC-DFG | `discover_oc_petri_net()` | `ocel_*` | `discovered_models` (JSONB) |

### 9.2 Conformance Checking

| Method | pm4py Function | Input | Output Table |
|--------|---------------|-------|--------------|
| Token Replay | `conformance_diagnostics_token_based_replay()` | events + model | `conformance_results`, `deviations` |
| Alignments | `conformance_diagnostics_alignments()` | events + model | `conformance_results`, `alignments` |
| Footprints | `conformance_diagnostics_footprints()` | events + model | `conformance_results` |

### 9.3 Performance Analysis

| Analysis | pm4py Function | Output Table |
|----------|---------------|--------------|
| Case Duration | `get_case_duration()` | `cases.duration_seconds` |
| Sojourn Time | `get_stochastic_language()` | `bottleneck_analyses` |
| Waiting Time | Custom (between events) | `metric_values` |
| Throughput | `get_event_attribute_values()` | `metric_values` |

### 9.4 Social Network Analysis

| Analysis | pm4py Function | Output Table |
|----------|---------------|--------------|
| Handover of Work | `discover_handover_of_work()` | `sna_results` |
| Working Together | `discover_working_together()` | `sna_results` |
| Subcontracting | `discover_subcontracting()` | `sna_results` |
| Similar Activities | `discover_activity_based()` | `sna_results` |

---

## 10. MIGRATION ORDER

Execute schema creation in this order to respect foreign key dependencies:

### Phase 1: Foundation
1. `tenants`
2. `data_pools`
3. `data_connections`
4. `import_jobs`
5. `import_job_runs`

### Phase 2: Case-Centric
6. `event_logs`
7. `activities`
8. `resources`
9. `variants`
10. `cases`
11. `events`

### Phase 3: OCEL
12. `ocel_event_types`
13. `ocel_object_types`
14. `ocel_events`
15. `ocel_objects`
16. `ocel_e2o`
17. `ocel_o2o`
18. `ocel_object_changes`

### Phase 4: Ontology
19. `ontologies`
20. `concepts`
21. `concept_relations`
22. `annotations`
23. `reasoning_rules`

### Phase 5: Discovery
24. `discovered_models`
25. `petri_nets`
26. `petri_net_places`
27. `petri_net_transitions`
28. `petri_net_arcs`
29. `bpmn_models`

### Phase 6: Conformance
30. `conformance_jobs`
31. `conformance_results`
32. `deviations`
33. `alignments`
34. `quality_metrics`

### Phase 7: Analytics
35. `performance_metrics`
36. `metric_values`
37. `bottleneck_analyses`
38. `sna_results`
39. `dashboards`

### Phase 8: Prediction
40. `prediction_features`
41. `prediction_models`
42. `predictions`
43. `model_evaluations`

### Phase 9: Simulation
44. `simulation_models`
45. `simulation_parameters`
46. `simulation_runs`
47. `simulation_results`

### Phase 10: Automation
48. `action_rules`
49. `actions`
50. `action_executions`
51. `workflows`
52. `workflow_steps`
53. `scheduled_jobs`

### Phase 11: Graph
54. `graph_projections`
55. `graph_sync_log`
56. `graph_queries`

---

## 11. DESIGN RATIONALE

### 11.1 Why Separate Case-Centric and OCEL Tables?

**Rationale**: While OCEL is more general, many users have case-centric data and case-centric algorithms are more mature. Supporting both allows:

1. **Gradual Migration**: Users can start with case-centric and evolve to OCEL
2. **Algorithm Compatibility**: Most pm4py algorithms expect case-centric logs
3. **Performance Optimization**: Case-centric queries are simpler and faster
4. **Interoperability**: XES import/export remains straightforward

**Conversion Path**: Case-centric → OCEL is always possible (one object type = Case)

### 11.2 Why Store Petri Nets in Relational Tables?

**Rationale**: While PNML files could be stored as blobs, relational storage enables:

1. **Query Capabilities**: Find all models with specific activities
2. **Diff/Compare**: Compare model versions structurally
3. **Visualization**: Direct querying for rendering
4. **Analytics**: Structural metrics (places, transitions, arcs)

**Alternative**: For very large models, store PNML in file storage with metadata in database.

### 11.3 Why JSONB for Model Data?

**Rationale**: Process models have varying structures (DFG vs. Petri Net vs. BPMN). JSONB provides:

1. **Flexibility**: Each model type has its own schema
2. **Performance**: GIN indexes for JSON queries
3. **Evolution**: Easy to add new model types
4. **Compatibility**: Direct serialization from pm4py objects

### 11.4 Why Separate Ontology Tables?

**Rationale**: Full OWL support requires a triple store (e.g., GraphDB). However, for practical process mining:

1. **Simple Hierarchy**: Most use cases need class hierarchies only
2. **Annotation Focus**: Primary need is entity-to-concept mapping
3. **Performance**: Relational queries faster than SPARQL for simple lookups
4. **Optional Enhancement**: Can sync to full triple store if needed

### 11.5 Why Neo4j Integration?

**Rationale**: Process mining is inherently graph-based. Neo4j excels at:

1. **Path Queries**: Find all paths between activities
2. **Graph Algorithms**: Centrality, community detection
3. **Visualization**: Native graph rendering
4. **Social Network Analysis**: Natural graph representation

**Trade-off**: Adds operational complexity. Start with PostgreSQL-only and add Neo4j when graph queries become bottleneck.

---

## 12. FUTURE EXTENSIONS

### 12.1 Planned Enhancements

| Feature | Tables to Add | Priority |
|---------|--------------|----------|
| Multi-Language Support | `translations` | Medium |
| Custom Fields | `custom_field_definitions`, `custom_field_values` | High |
| Audit Trail | `entity_history` | Medium |
| API Rate Limiting | `api_usage`, `rate_limits` | Low |
| Collaboration | `comments`, `shares` | Medium |
| Versioning | `model_versions`, `config_versions` | High |

### 12.2 Authentication (Future)

When ready to add authentication:

```
PLANNED TABLES:
- users
- user_sessions  
- user_tenant_memberships
- api_keys
- oauth_clients
- roles
- permissions
- user_roles
```

---

## APPENDIX A: OCEL 2.0 COMPLIANCE CHECKLIST

| Requirement | Schema Support | Implementation |
|-------------|---------------|----------------|
| Event Types with Attributes | ✅ | `ocel_event_types.attribute_schema` |
| Object Types with Attributes | ✅ | `ocel_object_types.attribute_schema` |
| Events with Timestamps | ✅ | `ocel_events.timestamp` |
| Objects with IDs | ✅ | `ocel_objects.ocel_id` |
| E2O Relationships | ✅ | `ocel_e2o` table |
| O2O Relationships | ✅ | `ocel_o2o` table |
| Qualifiers on E2O | ✅ | `ocel_e2o.qualifier`, `qualifier_value` |
| Object Attribute Changes | ✅ | `ocel_object_changes` |
| Temporal O2O Validity | ✅ | `ocel_o2o.valid_from`, `valid_to` |
| JSON Export Format | ✅ | Application layer export |
| XML Export Format | ⚠️ | Planned |

---

## APPENDIX B: pm4py COMPATIBILITY MATRIX

| pm4py Feature | Schema Support | Notes |
|---------------|----------------|-------|
| Event Log Loading | ✅ | `events` table with proper indexes |
| XES Import/Export | ✅ | `event_logs` stores XES metadata |
| OCEL Import/Export | ✅ | Native OCEL 2.0 tables |
| Alpha Miner | ✅ | Output to `petri_nets` |
| Heuristics Miner | ✅ | Output to `petri_nets` |
| Inductive Miner | ✅ | Output to `petri_nets` or `discovered_models` |
| DFG Discovery | ✅ | Output to `discovered_models` (JSONB) |
| Token Replay | ✅ | Results in `conformance_results` |
| Alignments | ✅ | Results in `alignments` |
| SNA (Handover) | ✅ | Results in `sna_results` |
| Variant Analysis | ✅ | Precomputed in `variants` |
| Case Duration | ✅ | `cases.duration_seconds` |
| OCEL Discovery | ✅ | `ocel_*` tables support |
| Simulation | ⚠️ | Parameters stored, simulation external |

---

## CONCLUSION

This schema provides a **comprehensive foundation** for a process mining SaaS platform with:

✅ **Full pm4py Compatibility**: Direct mapping to pm4py data structures and algorithms  
✅ **OCEL 2.0 Native Support**: Complete implementation of IEEE standard  
✅ **Neo4j Integration Ready**: Graph projection infrastructure for advanced analytics  
✅ **Ontology/OWL Support**: Semantic layer for intelligent process understanding  
✅ **Scalable Architecture**: TimescaleDB + partitioning for billions of events  
✅ **Automation Built-in**: Rule-based triggers and workflow automation  
✅ **No Auth Overhead**: Clean separation for future authentication addition  

**Total Tables**: 56 (reduced from 110 in original, focused on core functionality)

**Recommended Starting Point**:
1. Deploy PostgreSQL 15+ with TimescaleDB extension
2. Implement Phase 1-3 (Foundation + Case-Centric + OCEL)
3. Build pm4py integration layer
4. Add Discovery and Conformance (Phase 4-5)
5. Expand based on customer needs

This schema balances **academic rigor** (OCEL 2.0, proper ontology modeling) with **practical startup needs** (simplicity, performance, extensibility).
