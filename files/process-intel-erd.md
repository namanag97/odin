# Process Intelligence Platform - Complete ERD Specification

## Executive Summary

This document extracts the complete Entity-Relationship Diagram for a Process Mining platform based on Celonis architecture, aligned with:
- **PM4Py** library capabilities (Object-Centric Petri Nets, OCEL 2.0)
- **OCEL 2.0** standard for Object-Centric Event Logs
- **SaaS Foundation** layers (Existence, Identity, Commercial, etc.)

---

## Table of Contents

1. [Domain Classification](#1-domain-classification)
2. [Core Entities - Process Mining](#2-core-entities---process-mining)
3. [OCPM Entities](#3-ocpm-entities)
4. [Data Integration Entities](#4-data-integration-entities)
5. [Semantic Layer Entities](#5-semantic-layer-entities)
6. [Studio/UI Entities](#6-studioui-entities)
7. [Automation Entities](#7-automation-entities)
8. [Complete Relationship Diagram](#8-complete-relationship-diagram)
9. [SQL Schema Definitions](#9-sql-schema-definitions)
10. [Layer Integration Map](#10-layer-integration-map)

---

## 1. Domain Classification

### Entity Type Classification

| Category | Entities | Description |
|----------|----------|-------------|
| **Core (OCPM)** | ObjectType, EventType, Object, Event, Relationship, Perspective | Primary OCPM constructs |
| **Core (Case-Centric)** | Case, Activity, Trace, Variant | Traditional process mining |
| **Data Layer** | DataPool, DataModel, Table, Column, ForeignKey | Data infrastructure |
| **Semantic Layer** | KnowledgeModel, KPI, Record, Filter, Variable, EventLog | Business meaning |
| **Studio Layer** | Space, Package, View, Component, Analysis | UI/Dashboard |
| **Automation Layer** | ActionFlow, Module, Skill, Sensor, Signal, Task | Workflow automation |
| **Integration Layer** | DataConnection, DataJob, Schedule, Webhook, Execution | ETL & external systems |
| **Supporting** | Tag, Label, Threshold, AugmentedAttribute | Auxiliary entities |
| **Transactional** | AuditLog, ExecutionLog, ActivityLog | Event records |
| **Reference** | ActivityType, Status, Priority, ObjectTypeTemplate | Lookup data |

---

## 2. Core Entities - Process Mining

### 2.1 Activity (Reference Entity)

```yaml
Activity:
  description: "Named action/step that can occur within a process"
  type: Reference
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    name: { type: VARCHAR(255), required: true }
    display_name: { type: VARCHAR(255), required: false }
    description: { type: TEXT, required: false }
    category: { type: VARCHAR(100), required: false }
    icon: { type: VARCHAR(50), required: false }
    color: { type: VARCHAR(7), required: false, pattern: "^#[0-9A-Fa-f]{6}$" }
    is_milestone: { type: BOOLEAN, default: false }
    is_automated: { type: BOOLEAN, default: false }
    avg_duration_seconds: { type: INTEGER, computed: true }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, name], unique: true }
    - { columns: [tenant_id, category] }
  constraints:
    - "CHECK (name ~ '^[A-Za-z][A-Za-z0-9_ ]*$')"
```

### 2.2 Case (Core Entity - Case-Centric)

```yaml
Case:
  description: "Single execution instance of a process (case-centric view)"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    data_model_id: { type: UUID, required: true, fk: data_model }
    case_key: { type: VARCHAR(255), required: true }
    source_system_id: { type: VARCHAR(100), required: false }
    started_at: { type: TIMESTAMPTZ, computed: true }
    ended_at: { type: TIMESTAMPTZ, computed: true }
    throughput_time_seconds: { type: BIGINT, computed: true }
    event_count: { type: INTEGER, computed: true }
    variant_id: { type: UUID, fk: variant }
    is_complete: { type: BOOLEAN, computed: true }
    attributes: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, data_model_id, case_key], unique: true }
    - { columns: [tenant_id, started_at] }
    - { columns: [tenant_id, variant_id] }
    - { columns: [tenant_id, throughput_time_seconds] }
  computed_columns:
    started_at: "SELECT MIN(timestamp) FROM event WHERE case_id = id"
    ended_at: "SELECT MAX(timestamp) FROM event WHERE case_id = id"
    throughput_time_seconds: "EXTRACT(EPOCH FROM (ended_at - started_at))"
    event_count: "SELECT COUNT(*) FROM event WHERE case_id = id"
```

### 2.3 Event (Core Entity)

```yaml
Event:
  description: "Single occurrence of an activity with timestamp"
  type: Core (Transactional)
  immutable: true
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    case_id: { type: UUID, required: false, fk: case, notes: "NULL for OCPM" }
    activity_id: { type: UUID, required: true, fk: activity }
    activity_name: { type: VARCHAR(255), required: true, denormalized: true }
    timestamp: { type: TIMESTAMPTZ, required: true }
    sorting_key: { type: INTEGER, required: false, notes: "Tiebreaker for same timestamp" }
    resource_id: { type: UUID, required: false, fk: user }
    resource_name: { type: VARCHAR(255), required: false, denormalized: true }
    lifecycle_state: { type: VARCHAR(50), default: "complete", enum: [schedule, start, complete, suspend, resume, abort] }
    source_system: { type: VARCHAR(100), required: false }
    source_table: { type: VARCHAR(255), required: false }
    source_id: { type: VARCHAR(255), required: false }
    cost: { type: DECIMAL(18,4), required: false }
    duration_seconds: { type: INTEGER, required: false }
    attributes: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, case_id, timestamp, sorting_key] }
    - { columns: [tenant_id, activity_id] }
    - { columns: [tenant_id, timestamp] }
    - { columns: [tenant_id, resource_id] }
  partitioning:
    strategy: RANGE
    column: timestamp
    interval: MONTHLY
```

### 2.4 Variant (Computed Entity)

```yaml
Variant:
  description: "Unique sequence of activities representing a process path"
  type: Computed
  materialized: true
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    data_model_id: { type: UUID, required: true, fk: data_model }
    activity_sequence: { type: TEXT[], required: true, notes: "Ordered array of activity names" }
    sequence_hash: { type: VARCHAR(64), required: true, notes: "SHA256 of activity_sequence" }
    case_count: { type: INTEGER, computed: true }
    percentage: { type: DECIMAL(5,2), computed: true }
    avg_throughput_seconds: { type: BIGINT, computed: true }
    is_happy_path: { type: BOOLEAN, default: false }
    rank: { type: INTEGER, computed: true }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, data_model_id, sequence_hash], unique: true }
    - { columns: [tenant_id, data_model_id, case_count DESC] }
  refresh_on: "data_model_load"
```

### 2.5 Trace (Derived View - Not Stored)

```yaml
Trace:
  description: "Ordered sequence of events for a single case"
  type: View
  stored: false
  query: |
    SELECT 
      c.id as case_id,
      c.case_key,
      array_agg(e.activity_name ORDER BY e.timestamp, e.sorting_key) as activities,
      array_agg(e.id ORDER BY e.timestamp, e.sorting_key) as event_ids,
      MIN(e.timestamp) as start_time,
      MAX(e.timestamp) as end_time
    FROM "case" c
    JOIN event e ON e.case_id = c.id
    GROUP BY c.id, c.case_key
```

---

## 3. OCPM Entities (Object-Centric Process Mining)

### 3.1 ObjectType

```yaml
ObjectType:
  description: "Classification of business objects (e.g., SalesOrder, Invoice, Customer)"
  type: Core (OCPM)
  ocel_mapping: "object_type"
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    perspective_id: { type: UUID, required: true, fk: perspective }
    name: { type: VARCHAR(100), required: true, pattern: "^[A-Za-z][A-Za-z0-9_]*$" }
    display_name: { type: VARCHAR(255), required: false }
    description: { type: TEXT, required: false }
    source_table: { type: VARCHAR(255), required: false }
    identifier_columns: { type: TEXT[], required: true, notes: "Columns forming unique key" }
    icon: { type: VARCHAR(50), required: false }
    color: { type: VARCHAR(7), required: false }
    tags: { type: TEXT[], default: "{}" }
    is_lead_object: { type: BOOLEAN, default: false, notes: "Case key for event logs" }
    status: { type: VARCHAR(20), default: "draft", enum: [draft, published, deprecated] }
    attribute_schema: { type: JSONB, default: "{}", notes: "JSON Schema for attributes" }
    metadata: { type: JSONB, default: "{}" }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
    published_at: { type: TIMESTAMPTZ, required: false }
  indexes:
    - { columns: [tenant_id, perspective_id, name], unique: true }
    - { columns: [tenant_id, status] }
  constraints:
    - "CHECK (array_length(identifier_columns, 1) >= 1)"
```

### 3.2 EventType

```yaml
EventType:
  description: "Classification of event occurrences in OCPM"
  type: Core (OCPM)
  ocel_mapping: "event_type"
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    perspective_id: { type: UUID, required: true, fk: perspective }
    name: { type: VARCHAR(100), required: true, pattern: "^[A-Za-z][A-Za-z0-9_]*$" }
    display_name: { type: VARCHAR(255), required: false }
    description: { type: TEXT, required: false }
    source_table: { type: VARCHAR(255), required: false }
    timestamp_column: { type: VARCHAR(255), required: true }
    sorting_column: { type: VARCHAR(255), required: false }
    icon: { type: VARCHAR(50), required: false }
    color: { type: VARCHAR(7), required: false }
    status: { type: VARCHAR(20), default: "draft", enum: [draft, published, deprecated] }
    attribute_schema: { type: JSONB, default: "{}", notes: "JSON Schema for attributes" }
    metadata: { type: JSONB, default: "{}" }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, perspective_id, name], unique: true }
```

### 3.3 Object (OCPM Instance)

```yaml
Object:
  description: "Instance of an ObjectType (e.g., a specific SalesOrder)"
  type: Core (OCPM)
  ocel_mapping: "object"
  high_volume: true
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    object_type_id: { type: UUID, required: true, fk: object_type }
    object_key: { type: VARCHAR(255), required: true, notes: "Business identifier" }
    source_system: { type: VARCHAR(100), required: false }
    source_id: { type: VARCHAR(255), required: false }
    lifecycle_state: { type: VARCHAR(50), default: "active" }
    first_event_at: { type: TIMESTAMPTZ, computed: true }
    last_event_at: { type: TIMESTAMPTZ, computed: true }
    event_count: { type: INTEGER, computed: true }
    attributes: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, object_type_id, object_key], unique: true }
    - { columns: [tenant_id, object_type_id, lifecycle_state] }
    - { columns: [tenant_id, first_event_at] }
  partitioning:
    strategy: HASH
    column: tenant_id
    partitions: 16
```

### 3.4 ObjectRelationship

```yaml
ObjectRelationship:
  description: "Relationship definition between two ObjectTypes"
  type: Core (OCPM)
  table_prefix: "r_o_"
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    perspective_id: { type: UUID, required: true, fk: perspective }
    name: { type: VARCHAR(100), required: true }
    source_object_type_id: { type: UUID, required: true, fk: object_type }
    target_object_type_id: { type: UUID, required: true, fk: object_type }
    cardinality: { type: VARCHAR(10), required: true, enum: [one_to_one, one_to_many, many_to_one, many_to_many] }
    join_columns: { type: JSONB, required: true, notes: "Column mapping for join" }
    is_embedded: { type: BOOLEAN, default: false, notes: "Breaks cycles in perspective" }
    display_name: { type: VARCHAR(255), required: false }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, perspective_id, name], unique: true }
    - { columns: [source_object_type_id] }
    - { columns: [target_object_type_id] }
  constraints:
    - "CHECK (source_object_type_id != target_object_type_id OR is_embedded = true)"
```

### 3.5 ObjectRelationshipInstance (Junction)

```yaml
ObjectRelationshipInstance:
  description: "Instance linking two Objects"
  type: Junction (OCPM)
  high_volume: true
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    relationship_id: { type: UUID, required: true, fk: object_relationship }
    source_object_id: { type: UUID, required: true, fk: object }
    target_object_id: { type: UUID, required: true, fk: object }
    valid_from: { type: TIMESTAMPTZ, required: false }
    valid_to: { type: TIMESTAMPTZ, required: false }
    attributes: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, relationship_id, source_object_id, target_object_id], unique: true }
    - { columns: [source_object_id] }
    - { columns: [target_object_id] }
```

### 3.6 EventObjectRelationship

```yaml
EventObjectRelationship:
  description: "Links Events to Objects (N:M in OCPM)"
  type: Junction (OCPM)
  table_prefix: "r_e_"
  ocel_mapping: "event_object"
  high_volume: true
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    event_id: { type: UUID, required: true, fk: event }
    object_id: { type: UUID, required: true, fk: object }
    qualifier: { type: VARCHAR(100), required: false, notes: "Role of object in event" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, event_id, object_id], unique: true }
    - { columns: [object_id] }
  partitioning:
    strategy: RANGE
    column: created_at
    interval: MONTHLY
```

### 3.7 ObjectChange (Change Tracking)

```yaml
ObjectChange:
  description: "Tracks attribute changes on Objects over time"
  type: Transactional (OCPM)
  table_prefix: "c_"
  immutable: true
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    object_id: { type: UUID, required: true, fk: object }
    attribute_name: { type: VARCHAR(255), required: true }
    old_value: { type: JSONB, required: false }
    new_value: { type: JSONB, required: false }
    changed_at: { type: TIMESTAMPTZ, required: true }
    changed_by: { type: UUID, required: false, fk: user }
    source_event_id: { type: UUID, required: false, fk: event }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, object_id, changed_at] }
    - { columns: [tenant_id, object_id, attribute_name] }
  partitioning:
    strategy: RANGE
    column: changed_at
    interval: MONTHLY
```

### 3.8 Perspective

```yaml
Perspective:
  description: "Filtered view of OCPM data for specific analysis"
  type: Core (OCPM)
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    data_model_id: { type: UUID, required: true, fk: data_model }
    name: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    included_object_types: { type: UUID[], default: "{}" }
    included_event_types: { type: UUID[], default: "{}" }
    included_relationships: { type: UUID[], default: "{}" }
    filter_expression: { type: TEXT, required: false, notes: "PQL filter" }
    is_default: { type: BOOLEAN, default: false }
    status: { type: VARCHAR(20), default: "draft", enum: [draft, published, deprecated] }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
    published_at: { type: TIMESTAMPTZ, required: false }
  indexes:
    - { columns: [tenant_id, data_model_id, name], unique: true }
    - { columns: [tenant_id, status] }
```

### 3.9 CustomEventLog (Generated Event Log from OCPM)

```yaml
CustomEventLog:
  description: "Case-centric event log generated from OCPM perspective"
  type: Core (OCPM)
  table_prefix: "el_"
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    perspective_id: { type: UUID, required: true, fk: perspective }
    name: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    lead_object_type_id: { type: UUID, required: true, fk: object_type, notes: "Case key" }
    included_event_types: { type: UUID[], default: "{}" }
    flattening_strategy: { type: VARCHAR(50), default: "simple", enum: [simple, object_propagation, all_events] }
    filter_expression: { type: TEXT, required: false }
    is_materialized: { type: BOOLEAN, default: false }
    last_materialized_at: { type: TIMESTAMPTZ, required: false }
    row_count: { type: BIGINT, computed: true }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, perspective_id, name], unique: true }
```

---

## 4. Data Integration Entities

### 4.1 DataPool

```yaml
DataPool:
  description: "Container for data connections, tables, and jobs"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    name: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    storage_type: { type: VARCHAR(50), default: "internal", enum: [internal, external] }
    external_connection_id: { type: UUID, required: false, fk: data_connection }
    schema_name: { type: VARCHAR(100), required: false }
    storage_bytes: { type: BIGINT, default: 0 }
    table_count: { type: INTEGER, default: 0 }
    status: { type: VARCHAR(20), default: "active", enum: [active, inactive, archived] }
    metadata: { type: JSONB, default: "{}" }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, name], unique: true }
  limits:
    resource_type: "data_pool"
    tracked_by: "count"
```

### 4.2 DataConnection

```yaml
DataConnection:
  description: "Configuration for connecting to external data sources"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    data_pool_id: { type: UUID, required: true, fk: data_pool }
    name: { type: VARCHAR(255), required: true }
    connector_type: { type: VARCHAR(50), required: true, enum: [jdbc, rest, sap_rfc, sftp, s3, kafka, salesforce, custom] }
    connection_config: { type: JSONB, required: true, encrypted_fields: [password, client_secret, api_key] }
    auth_type: { type: VARCHAR(50), required: true, enum: [basic, oauth2, api_key, sap_user, none] }
    oauth_credentials_id: { type: UUID, required: false, fk: oauth_credential }
    test_query: { type: TEXT, required: false }
    last_tested_at: { type: TIMESTAMPTZ, required: false }
    last_test_status: { type: VARCHAR(20), enum: [success, failed, pending] }
    last_test_error: { type: TEXT, required: false }
    status: { type: VARCHAR(20), default: "active", enum: [active, invalid, expired, disabled] }
    metadata: { type: JSONB, default: "{}" }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, data_pool_id, name], unique: true }
    - { columns: [tenant_id, connector_type] }
```

### 4.3 DataModel

```yaml
DataModel:
  description: "Analytical schema built from data pool tables"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    data_pool_id: { type: UUID, required: true, fk: data_pool }
    name: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    model_type: { type: VARCHAR(20), default: "case_centric", enum: [case_centric, object_centric] }
    activity_table_id: { type: UUID, required: false, fk: table }
    case_table_id: { type: UUID, required: false, fk: table }
    case_column: { type: VARCHAR(255), required: false }
    activity_column: { type: VARCHAR(255), required: false }
    timestamp_column: { type: VARCHAR(255), required: false }
    sorting_column: { type: VARCHAR(255), required: false }
    load_status: { type: VARCHAR(20), default: "pending", enum: [pending, loading, loaded, failed, stale] }
    last_loaded_at: { type: TIMESTAMPTZ, required: false }
    load_type: { type: VARCHAR(10), default: "full", enum: [full, delta] }
    row_counts: { type: JSONB, default: "{}", notes: "Table name -> row count" }
    version: { type: INTEGER, default: 1 }
    metadata: { type: JSONB, default: "{}" }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, data_pool_id, name], unique: true }
    - { columns: [tenant_id, load_status] }
```

### 4.4 Table

```yaml
Table:
  description: "Physical or virtual table in data pool"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    data_pool_id: { type: UUID, required: true, fk: data_pool }
    name: { type: VARCHAR(255), required: true }
    display_name: { type: VARCHAR(255), required: false }
    description: { type: TEXT, required: false }
    table_type: { type: VARCHAR(20), default: "physical", enum: [physical, view, materialized, external] }
    source_connection_id: { type: UUID, required: false, fk: data_connection }
    source_schema: { type: VARCHAR(255), required: false }
    source_table: { type: VARCHAR(255), required: false }
    transformation_sql: { type: TEXT, required: false, notes: "For views" }
    row_count: { type: BIGINT, default: 0 }
    size_bytes: { type: BIGINT, default: 0 }
    last_sync_at: { type: TIMESTAMPTZ, required: false }
    is_activity_table: { type: BOOLEAN, default: false }
    is_case_table: { type: BOOLEAN, default: false }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, data_pool_id, name], unique: true }
```

### 4.5 Column

```yaml
Column:
  description: "Column definition within a table"
  type: Supporting
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    table_id: { type: UUID, required: true, fk: table }
    name: { type: VARCHAR(255), required: true }
    display_name: { type: VARCHAR(255), required: false }
    data_type: { type: VARCHAR(50), required: true, enum: [string, integer, decimal, boolean, date, datetime, json, array] }
    source_data_type: { type: VARCHAR(100), required: false }
    is_nullable: { type: BOOLEAN, default: true }
    is_primary_key: { type: BOOLEAN, default: false }
    is_indexed: { type: BOOLEAN, default: false }
    default_value: { type: TEXT, required: false }
    format_pattern: { type: VARCHAR(100), required: false }
    ordinal_position: { type: INTEGER, required: true }
    description: { type: TEXT, required: false }
    statistics: { type: JSONB, default: "{}", notes: "min, max, distinct_count, null_count" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [table_id, name], unique: true }
    - { columns: [table_id, ordinal_position] }
```

### 4.6 ForeignKey

```yaml
ForeignKey:
  description: "Relationship between tables in data model"
  type: Supporting
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    data_model_id: { type: UUID, required: true, fk: data_model }
    name: { type: VARCHAR(255), required: false }
    source_table_id: { type: UUID, required: true, fk: table }
    source_columns: { type: TEXT[], required: true }
    target_table_id: { type: UUID, required: true, fk: table }
    target_columns: { type: TEXT[], required: true }
    cardinality: { type: VARCHAR(10), default: "N:1", enum: ["1:1", "1:N", "N:1", "N:M"] }
    is_enforced: { type: BOOLEAN, default: false }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [data_model_id, source_table_id, target_table_id] }
  constraints:
    - "CHECK (array_length(source_columns, 1) = array_length(target_columns, 1))"
```

### 4.7 DataJob

```yaml
DataJob:
  description: "Orchestrated extraction/transformation workflow"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    data_pool_id: { type: UUID, required: true, fk: data_pool }
    name: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    job_type: { type: VARCHAR(20), required: true, enum: [extraction, transformation, data_model_load, composite] }
    schedule_id: { type: UUID, required: false, fk: schedule }
    execution_order: { type: INTEGER, default: 0 }
    timeout_seconds: { type: INTEGER, default: 3600 }
    retry_count: { type: INTEGER, default: 3 }
    retry_delay_seconds: { type: INTEGER, default: 60 }
    status: { type: VARCHAR(20), default: "active", enum: [active, disabled, archived] }
    last_run_at: { type: TIMESTAMPTZ, required: false }
    last_run_status: { type: VARCHAR(20), enum: [pending, running, success, failed, cancelled] }
    last_run_duration_ms: { type: INTEGER, required: false }
    next_run_at: { type: TIMESTAMPTZ, required: false }
    metadata: { type: JSONB, default: "{}" }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, data_pool_id, name], unique: true }
    - { columns: [tenant_id, status, next_run_at] }
```

### 4.8 DataJobTask

```yaml
DataJobTask:
  description: "Individual task within a data job"
  type: Supporting
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    data_job_id: { type: UUID, required: true, fk: data_job }
    name: { type: VARCHAR(255), required: true }
    task_type: { type: VARCHAR(20), required: true, enum: [extraction, transformation, load, custom] }
    execution_order: { type: INTEGER, required: true }
    source_connection_id: { type: UUID, required: false, fk: data_connection }
    source_query: { type: TEXT, required: false }
    target_table_id: { type: UUID, required: false, fk: table }
    transformation_sql: { type: TEXT, required: false }
    extraction_mode: { type: VARCHAR(10), default: "full", enum: [full, delta] }
    delta_column: { type: VARCHAR(255), required: false }
    delta_value: { type: TEXT, required: false }
    is_enabled: { type: BOOLEAN, default: true }
    timeout_seconds: { type: INTEGER, default: 1800 }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [data_job_id, execution_order] }
```

### 4.9 Schedule

```yaml
Schedule:
  description: "Time-based trigger configuration"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    name: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    schedule_type: { type: VARCHAR(20), required: true, enum: [cron, interval, once] }
    cron_expression: { type: VARCHAR(100), required: false }
    interval_seconds: { type: INTEGER, required: false }
    run_at: { type: TIMESTAMPTZ, required: false, notes: "For 'once' type" }
    timezone: { type: VARCHAR(50), default: "UTC" }
    is_enabled: { type: BOOLEAN, default: true }
    last_triggered_at: { type: TIMESTAMPTZ, required: false }
    next_trigger_at: { type: TIMESTAMPTZ, required: false }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, is_enabled, next_trigger_at] }
  constraints:
    - "CHECK ((schedule_type = 'cron' AND cron_expression IS NOT NULL) OR (schedule_type = 'interval' AND interval_seconds IS NOT NULL) OR (schedule_type = 'once' AND run_at IS NOT NULL))"
```

### 4.10 JobExecution

```yaml
JobExecution:
  description: "Single run instance of a data job"
  type: Transactional
  immutable: true
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    data_job_id: { type: UUID, required: true, fk: data_job }
    triggered_by: { type: VARCHAR(20), required: true, enum: [schedule, manual, api, dependent] }
    triggered_by_user_id: { type: UUID, required: false, fk: user }
    status: { type: VARCHAR(20), required: true, default: "pending", enum: [pending, running, success, failed, cancelled] }
    started_at: { type: TIMESTAMPTZ, required: false }
    completed_at: { type: TIMESTAMPTZ, required: false }
    duration_ms: { type: INTEGER, required: false }
    rows_processed: { type: BIGINT, default: 0 }
    rows_failed: { type: BIGINT, default: 0 }
    error_message: { type: TEXT, required: false }
    error_details: { type: JSONB, default: "{}" }
    task_results: { type: JSONB, default: "[]", notes: "Per-task status" }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, data_job_id, created_at DESC] }
    - { columns: [tenant_id, status] }
  partitioning:
    strategy: RANGE
    column: created_at
    interval: MONTHLY
```

---

## 5. Semantic Layer Entities

### 5.1 KnowledgeModel

```yaml
KnowledgeModel:
  description: "Semantic layer containing KPIs, Records, Filters, Variables"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    package_id: { type: UUID, required: true, fk: package }
    key: { type: VARCHAR(100), required: true, pattern: "^[a-z][a-z0-9_]*$" }
    name: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    data_model_id: { type: UUID, required: true, fk: data_model }
    km_type: { type: VARCHAR(20), default: "base", enum: [base, extension] }
    extends_km_id: { type: UUID, required: false, fk: knowledge_model }
    status: { type: VARCHAR(20), default: "draft", enum: [draft, published] }
    version: { type: INTEGER, default: 1 }
    yaml_content: { type: TEXT, required: false, notes: "Full YAML source" }
    published_at: { type: TIMESTAMPTZ, required: false }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, package_id, key], unique: true }
    - { columns: [tenant_id, data_model_id] }
```

### 5.2 KPI

```yaml
KPI:
  description: "Calculated metric with PQL formula"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    knowledge_model_id: { type: UUID, required: true, fk: knowledge_model }
    key: { type: VARCHAR(100), required: true }
    display_name: { type: VARCHAR(255), required: false }
    description: { type: TEXT, required: false }
    pql_expression: { type: TEXT, required: true, notes: "PQL/SQL formula" }
    return_type: { type: VARCHAR(20), default: "number", enum: [number, string, date, boolean, array] }
    format_string: { type: VARCHAR(50), required: false, notes: "D3 format" }
    unit: { type: VARCHAR(50), required: false }
    unit_position: { type: VARCHAR(10), default: "suffix", enum: [prefix, suffix] }
    aggregation_type: { type: VARCHAR(20), default: "sum", enum: [sum, avg, min, max, count, count_distinct, custom] }
    is_global: { type: BOOLEAN, default: false }
    category: { type: VARCHAR(100), required: false }
    parameters: { type: JSONB, default: "[]", notes: "Dynamic input params" }
    thresholds: { type: JSONB, default: "[]", notes: "Color thresholds" }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [knowledge_model_id, key], unique: true }
    - { columns: [knowledge_model_id, category] }
```

### 5.3 Record

```yaml
Record:
  description: "Abstraction of Data Model table with attributes"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    knowledge_model_id: { type: UUID, required: true, fk: knowledge_model }
    key: { type: VARCHAR(100), required: true }
    display_name: { type: VARCHAR(255), required: false }
    description: { type: TEXT, required: false }
    base_table: { type: VARCHAR(255), required: true }
    identifier_attribute: { type: VARCHAR(255), required: false }
    default_sort_attribute: { type: VARCHAR(255), required: false }
    default_sort_order: { type: VARCHAR(4), default: "asc", enum: [asc, desc] }
    icon: { type: VARCHAR(50), required: false }
    color: { type: VARCHAR(7), required: false }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [knowledge_model_id, key], unique: true }
```

### 5.4 RecordAttribute

```yaml
RecordAttribute:
  description: "Column mapping within a Record"
  type: Supporting
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    record_id: { type: UUID, required: true, fk: record }
    key: { type: VARCHAR(100), required: true }
    display_name: { type: VARCHAR(255), required: false }
    description: { type: TEXT, required: false }
    attribute_type: { type: VARCHAR(20), default: "column", enum: [column, calculated, augmented] }
    source_column: { type: VARCHAR(255), required: false, notes: "For column type" }
    pql_expression: { type: TEXT, required: false, notes: "For calculated type" }
    data_type: { type: VARCHAR(20), required: true, enum: [string, number, date, boolean, array] }
    format_string: { type: VARCHAR(50), required: false }
    is_identifier: { type: BOOLEAN, default: false }
    is_filterable: { type: BOOLEAN, default: true }
    is_sortable: { type: BOOLEAN, default: true }
    ordinal_position: { type: INTEGER, default: 0 }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [record_id, key], unique: true }
    - { columns: [record_id, ordinal_position] }
```

### 5.5 Filter

```yaml
Filter:
  description: "Reusable PQL-based filter condition"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    knowledge_model_id: { type: UUID, required: true, fk: knowledge_model }
    key: { type: VARCHAR(100), required: true }
    display_name: { type: VARCHAR(255), required: false }
    description: { type: TEXT, required: false }
    pql_expression: { type: TEXT, required: true }
    base_table: { type: VARCHAR(255), required: false }
    filter_type: { type: VARCHAR(20), default: "standard", enum: [standard, process, forced] }
    category: { type: VARCHAR(100), required: false }
    is_default: { type: BOOLEAN, default: false }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [knowledge_model_id, key], unique: true }
```

### 5.6 Variable

```yaml
Variable:
  description: "Stored value referenced across components"
  type: Supporting
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    scope_type: { type: VARCHAR(20), required: true, enum: [knowledge_model, view, package] }
    scope_id: { type: UUID, required: true }
    key: { type: VARCHAR(100), required: true }
    display_name: { type: VARCHAR(255), required: false }
    description: { type: TEXT, required: false }
    data_type: { type: VARCHAR(20), required: true, enum: [string, number, date, boolean, array, object] }
    default_value: { type: JSONB, required: false }
    current_value: { type: JSONB, required: false }
    validation_pql: { type: TEXT, required: false }
    is_required: { type: BOOLEAN, default: false }
    is_user_editable: { type: BOOLEAN, default: true }
    ui_component: { type: VARCHAR(50), default: "input_box", enum: [input_box, dropdown, date_picker, checkbox, slider] }
    options_pql: { type: TEXT, required: false, notes: "For dropdowns" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [scope_type, scope_id, key], unique: true }
```

### 5.7 EventLogConfig

```yaml
EventLogConfig:
  description: "Configuration mapping data to process mining format"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    knowledge_model_id: { type: UUID, required: true, fk: knowledge_model }
    key: { type: VARCHAR(100), required: true }
    display_name: { type: VARCHAR(255), required: false }
    description: { type: TEXT, required: false }
    activity_table: { type: VARCHAR(255), required: true }
    case_id_column: { type: VARCHAR(255), required: true }
    activity_column: { type: VARCHAR(255), required: true }
    timestamp_column: { type: VARCHAR(255), required: true }
    sorting_column: { type: VARCHAR(255), required: false }
    resource_column: { type: VARCHAR(255), required: false }
    cost_column: { type: VARCHAR(255), required: false }
    included_activities: { type: TEXT[], default: "{}" }
    excluded_activities: { type: TEXT[], default: "{}" }
    filter_expression: { type: TEXT, required: false }
    is_default: { type: BOOLEAN, default: false }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [knowledge_model_id, key], unique: true }
```

### 5.8 AugmentedAttribute

```yaml
AugmentedAttribute:
  description: "User-editable field stored alongside process data"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    record_id: { type: UUID, required: true, fk: record }
    key: { type: VARCHAR(100), required: true }
    display_name: { type: VARCHAR(255), required: false }
    description: { type: TEXT, required: false }
    data_type: { type: VARCHAR(20), required: true, enum: [string, number, date, boolean, enum] }
    possible_values: { type: TEXT[], required: false, notes: "For enum type" }
    default_value: { type: JSONB, required: false }
    is_required: { type: BOOLEAN, default: false }
    is_multi_value: { type: BOOLEAN, default: false }
    validation_regex: { type: VARCHAR(255), required: false }
    ordinal_position: { type: INTEGER, default: 0 }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [record_id, key], unique: true }
```

### 5.9 AugmentedAttributeValue

```yaml
AugmentedAttributeValue:
  description: "Stored value for augmented attribute on specific record"
  type: Transactional
  table_prefix: "O_CELONIS_AUG_"
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    augmented_attribute_id: { type: UUID, required: true, fk: augmented_attribute }
    record_key: { type: VARCHAR(255), required: true, notes: "Identifier of the record instance" }
    value: { type: JSONB, required: true }
    updated_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [augmented_attribute_id, record_key], unique: true }
    - { columns: [tenant_id, updated_at] }
```

---

## 6. Studio/UI Entities

### 6.1 Space

```yaml
Space:
  description: "Organizational container for packages"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    name: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    icon: { type: VARCHAR(50), default: "folder" }
    color: { type: VARCHAR(7), default: "#1890ff" }
    is_default: { type: BOOLEAN, default: false }
    status: { type: VARCHAR(20), default: "active", enum: [active, archived] }
    sort_order: { type: INTEGER, default: 0 }
    metadata: { type: JSONB, default: "{}" }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, name], unique: true }
    - { columns: [tenant_id, sort_order] }
```

### 6.2 Package

```yaml
Package:
  description: "Container for Studio assets (Views, KMs, Action Flows)"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    space_id: { type: UUID, required: true, fk: space }
    key: { type: VARCHAR(100), required: true, pattern: "^[a-z][a-z0-9_-]*$" }
    name: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    icon: { type: VARCHAR(50), default: "box" }
    color: { type: VARCHAR(7), default: "#1890ff" }
    status: { type: VARCHAR(20), default: "draft", enum: [draft, published, archived] }
    version: { type: VARCHAR(20), default: "1.0.0" }
    is_template: { type: BOOLEAN, default: false }
    source_package_id: { type: UUID, required: false, fk: package, notes: "If created from template" }
    data_model_variable_id: { type: UUID, required: false, fk: variable }
    published_at: { type: TIMESTAMPTZ, required: false }
    metadata: { type: JSONB, default: "{}" }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, key], unique: true }
    - { columns: [tenant_id, space_id, status] }
```

### 6.3 View

```yaml
View:
  description: "Interactive dashboard/application"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    package_id: { type: UUID, required: true, fk: package }
    key: { type: VARCHAR(100), required: true }
    name: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    knowledge_model_id: { type: UUID, required: true, fk: knowledge_model }
    base_view_id: { type: UUID, required: false, fk: view, notes: "For extension views" }
    view_type: { type: VARCHAR(20), default: "standard", enum: [standard, profile, extension] }
    layout_mode: { type: VARCHAR(20), default: "scale_to_fit", enum: [scale_to_fit, custom_height] }
    layout_config: { type: JSONB, default: "{}", notes: "Grid layout configuration" }
    icon: { type: VARCHAR(50), default: "layout" }
    thumbnail_url: { type: VARCHAR(500), required: false }
    is_home: { type: BOOLEAN, default: false }
    is_published_to_apps: { type: BOOLEAN, default: false }
    sort_order: { type: INTEGER, default: 0 }
    status: { type: VARCHAR(20), default: "draft", enum: [draft, published] }
    version: { type: INTEGER, default: 1 }
    metadata: { type: JSONB, default: "{}" }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [package_id, key], unique: true }
    - { columns: [package_id, sort_order] }
```

### 6.4 Component

```yaml
Component:
  description: "UI component within a View"
  type: Supporting
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    view_id: { type: UUID, required: true, fk: view }
    parent_id: { type: UUID, required: false, fk: component, notes: "For nested components" }
    component_type: { type: VARCHAR(50), required: true, enum: [chart, table, kpi_list, process_explorer, variant_explorer, text, button, input, filter_bar, tab, container, action_button, image, custom] }
    key: { type: VARCHAR(100), required: true }
    title: { type: VARCHAR(255), required: false }
    description: { type: TEXT, required: false }
    layout_position: { type: JSONB, required: true, notes: "x, y, width, height" }
    data_config: { type: JSONB, default: "{}", notes: "PQL queries, record refs" }
    visual_config: { type: JSONB, default: "{}", notes: "Colors, formats, etc." }
    interaction_config: { type: JSONB, default: "{}", notes: "Filters, selections, links" }
    is_visible: { type: BOOLEAN, default: true }
    visibility_expression: { type: TEXT, required: false, notes: "Dynamic visibility" }
    sort_order: { type: INTEGER, default: 0 }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [view_id, key], unique: true }
    - { columns: [view_id, parent_id, sort_order] }
```

### 6.5 ViewTab

```yaml
ViewTab:
  description: "Tab container within a View"
  type: Supporting
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    view_id: { type: UUID, required: true, fk: view }
    key: { type: VARCHAR(100), required: true }
    title: { type: VARCHAR(255), required: true }
    icon: { type: VARCHAR(50), required: false }
    is_default: { type: BOOLEAN, default: false }
    sort_order: { type: INTEGER, required: true }
    visibility_expression: { type: TEXT, required: false }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [view_id, key], unique: true }
    - { columns: [view_id, sort_order] }
```

---

## 7. Automation Entities

### 7.1 ActionFlow

```yaml
ActionFlow:
  description: "Visual automation workflow"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    package_id: { type: UUID, required: true, fk: package }
    key: { type: VARCHAR(100), required: true }
    name: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    trigger_type: { type: VARCHAR(20), required: true, enum: [manual, scheduled, event, webhook, sensor] }
    schedule_id: { type: UUID, required: false, fk: schedule }
    webhook_id: { type: UUID, required: false, fk: webhook }
    sensor_id: { type: UUID, required: false, fk: sensor }
    status: { type: VARCHAR(20), default: "draft", enum: [draft, active, inactive, deactivated] }
    consecutive_error_limit: { type: INTEGER, default: 3 }
    consecutive_error_count: { type: INTEGER, default: 0 }
    is_data_confidential: { type: BOOLEAN, default: false }
    timeout_seconds: { type: INTEGER, default: 3600 }
    max_cycles: { type: INTEGER, default: 1 }
    auto_commit: { type: BOOLEAN, default: true }
    sequential_processing: { type: BOOLEAN, default: false }
    incomplete_executions_enabled: { type: BOOLEAN, default: false }
    blueprint: { type: JSONB, required: true, notes: "Module graph definition" }
    inputs: { type: JSONB, default: "[]" }
    outputs: { type: JSONB, default: "[]" }
    last_executed_at: { type: TIMESTAMPTZ, required: false }
    last_execution_status: { type: VARCHAR(20), enum: [success, warning, error] }
    activated_at: { type: TIMESTAMPTZ, required: false }
    deactivated_at: { type: TIMESTAMPTZ, required: false }
    deactivation_reason: { type: TEXT, required: false }
    metadata: { type: JSONB, default: "{}" }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [package_id, key], unique: true }
    - { columns: [tenant_id, status] }
    - { columns: [tenant_id, trigger_type, status] }
```

### 7.2 ActionFlowModule

```yaml
ActionFlowModule:
  description: "Individual processing step in Action Flow"
  type: Supporting
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    action_flow_id: { type: UUID, required: true, fk: action_flow }
    parent_module_id: { type: UUID, required: false, fk: action_flow_module, notes: "For error handlers" }
    module_type: { type: VARCHAR(50), required: true, enum: [trigger, action, transformer, aggregator, router, error_handler, iterator, repeater] }
    app_name: { type: VARCHAR(100), required: true, notes: "Slack, HTTP, CSV, etc." }
    action_name: { type: VARCHAR(100), required: true, notes: "Send Message, Make Request, etc." }
    connection_id: { type: UUID, required: false, fk: connection }
    position: { type: INTEGER, required: true }
    configuration: { type: JSONB, required: true }
    input_mapping: { type: JSONB, default: "{}" }
    output_mapping: { type: JSONB, default: "{}" }
    error_handler_type: { type: VARCHAR(20), required: false, enum: [break, resume, rollback, ignore, commit] }
    is_acid: { type: BOOLEAN, default: false }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [action_flow_id, position] }
```

### 7.3 Connection

```yaml
Connection:
  description: "Authentication link to external systems for Action Flows"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    package_id: { type: UUID, required: false, fk: package }
    name: { type: VARCHAR(255), required: true }
    app_name: { type: VARCHAR(100), required: true }
    connection_type: { type: VARCHAR(20), required: true, enum: [oauth2, api_key, basic, celonis_user, celonis_app_key, custom] }
    credentials: { type: JSONB, required: true, encrypted: true }
    oauth_credentials_id: { type: UUID, required: false, fk: oauth_credential }
    status: { type: VARCHAR(20), default: "valid", enum: [valid, invalid, expired, revoked] }
    is_dynamic: { type: BOOLEAN, default: false, notes: "Requires user auth at execution" }
    last_used_at: { type: TIMESTAMPTZ, required: false }
    last_tested_at: { type: TIMESTAMPTZ, required: false }
    expires_at: { type: TIMESTAMPTZ, required: false }
    metadata: { type: JSONB, default: "{}" }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, app_name] }
    - { columns: [tenant_id, package_id, name], unique: true, where: "package_id IS NOT NULL" }
```

### 7.4 Webhook

```yaml
Webhook:
  description: "HTTP endpoint for receiving external triggers"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    action_flow_id: { type: UUID, required: true, fk: action_flow }
    udid: { type: VARCHAR(64), required: true, unique: true }
    name: { type: VARCHAR(255), required: true }
    url: { type: VARCHAR(500), required: true, generated: true }
    secret: { type: VARCHAR(255), required: false, encrypted: true }
    connection_id: { type: UUID, required: false, fk: connection }
    data_structure: { type: JSONB, required: false, notes: "Expected payload schema" }
    get_request_headers: { type: BOOLEAN, default: false }
    get_http_method: { type: BOOLEAN, default: false }
    json_passthrough: { type: BOOLEAN, default: false }
    ip_allowlist: { type: TEXT[], default: "{}" }
    status: { type: VARCHAR(20), default: "active", enum: [active, inactive, expired] }
    queue_size: { type: INTEGER, default: 0, computed: true }
    max_queue_size: { type: INTEGER, default: 10000 }
    last_called_at: { type: TIMESTAMPTZ, required: false }
    expires_at: { type: TIMESTAMPTZ, required: false, notes: "5 days after last inactivity" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [udid], unique: true }
    - { columns: [tenant_id, status] }
```

### 7.5 WebhookQueue

```yaml
WebhookQueue:
  description: "Buffered webhook requests awaiting processing"
  type: Transactional
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    webhook_id: { type: UUID, required: true, fk: webhook }
    payload: { type: JSONB, required: true }
    headers: { type: JSONB, default: "{}" }
    http_method: { type: VARCHAR(10), default: "POST" }
    source_ip: { type: VARCHAR(45), required: false }
    status: { type: VARCHAR(20), default: "pending", enum: [pending, processing, processed, failed] }
    processed_at: { type: TIMESTAMPTZ, required: false }
    error_message: { type: TEXT, required: false }
    retry_count: { type: INTEGER, default: 0 }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [webhook_id, status, created_at] }
  partitioning:
    strategy: RANGE
    column: created_at
    interval: DAILY
  retention: "7 days"
```

### 7.6 Skill

```yaml
Skill:
  description: "Reusable automation combining Sensor + Actions"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    package_id: { type: UUID, required: true, fk: package }
    key: { type: VARCHAR(100), required: true }
    name: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    sensor_id: { type: UUID, required: true, fk: sensor }
    action_flow_id: { type: UUID, required: false, fk: action_flow }
    status: { type: VARCHAR(20), default: "draft", enum: [draft, active, inactive] }
    signal_count: { type: INTEGER, default: 0, computed: true }
    last_evaluated_at: { type: TIMESTAMPTZ, required: false }
    metadata: { type: JSONB, default: "{}" }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [package_id, key], unique: true }
    - { columns: [tenant_id, status] }
```

### 7.7 Sensor

```yaml
Sensor:
  description: "Detector that identifies data conditions and creates Signals"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    knowledge_model_id: { type: UUID, required: true, fk: knowledge_model }
    name: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    sensor_type: { type: VARCHAR(20), required: true, enum: [record_based, data_model_based, ml_based] }
    record_id: { type: UUID, required: false, fk: record }
    filter_id: { type: UUID, required: false, fk: filter }
    filter_expression: { type: TEXT, required: false }
    identifier_columns: { type: TEXT[], default: "{}" }
    additional_columns: { type: TEXT[], default: "{}" }
    evaluation_trigger: { type: VARCHAR(20), default: "data_model_reload", enum: [data_model_reload, km_publish, scheduled, manual] }
    max_signals_per_evaluation: { type: INTEGER, default: 10000 }
    status: { type: VARCHAR(20), default: "active", enum: [active, inactive] }
    last_evaluated_at: { type: TIMESTAMPTZ, required: false }
    last_signal_count: { type: INTEGER, default: 0 }
    metadata: { type: JSONB, default: "{}" }
    created_by: { type: UUID, required: true, fk: user }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [knowledge_model_id, name], unique: true }
    - { columns: [tenant_id, status] }
```

### 7.8 Signal

```yaml
Signal:
  description: "Detected data incident from Sensor"
  type: Transactional
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    sensor_id: { type: UUID, required: true, fk: sensor }
    skill_id: { type: UUID, required: false, fk: skill }
    record_key: { type: VARCHAR(255), required: true }
    signal_data: { type: JSONB, required: true, notes: "Record attributes at detection" }
    status: { type: VARCHAR(20), default: "open", enum: [open, in_progress, snoozed, resolved, dismissed] }
    priority: { type: VARCHAR(10), default: "medium", enum: [critical, high, medium, low] }
    assignee_id: { type: UUID, required: false, fk: user }
    assigned_at: { type: TIMESTAMPTZ, required: false }
    snoozed_until: { type: TIMESTAMPTZ, required: false }
    resolved_at: { type: TIMESTAMPTZ, required: false }
    resolved_by: { type: UUID, required: false, fk: user }
    resolution_notes: { type: TEXT, required: false }
    task_id: { type: UUID, required: false, fk: task }
    source_view_id: { type: UUID, required: false, fk: view }
    detected_at: { type: TIMESTAMPTZ, required: true, default: now() }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, status, priority] }
    - { columns: [tenant_id, assignee_id, status] }
    - { columns: [sensor_id, record_key], unique: false, notes: "May have multiple signals per record" }
  partitioning:
    strategy: RANGE
    column: created_at
    interval: MONTHLY
```

### 7.9 Task

```yaml
Task:
  description: "Work item assigned to users"
  type: Core
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    task_type_id: { type: UUID, required: true, fk: task_type }
    title: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    status: { type: VARCHAR(20), default: "open", enum: [open, in_progress, resolved, cancelled] }
    priority: { type: VARCHAR(10), default: "medium", enum: [critical, high, medium, low] }
    assignee_id: { type: UUID, required: false, fk: user }
    reporter_id: { type: UUID, required: true, fk: user }
    due_date: { type: DATE, required: false }
    started_at: { type: TIMESTAMPTZ, required: false }
    completed_at: { type: TIMESTAMPTZ, required: false }
    related_signal_id: { type: UUID, required: false, fk: signal }
    related_record_type: { type: VARCHAR(100), required: false }
    related_record_key: { type: VARCHAR(255), required: false }
    source_view_id: { type: UUID, required: false, fk: view }
    source_action_flow_id: { type: UUID, required: false, fk: action_flow }
    attributes: { type: JSONB, default: "{}" }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, assignee_id, status] }
    - { columns: [tenant_id, status, priority, due_date] }
    - { columns: [tenant_id, task_type_id] }
```

### 7.10 TaskType

```yaml
TaskType:
  description: "Classification of tasks"
  type: Reference
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    key: { type: VARCHAR(100), required: true }
    name: { type: VARCHAR(255), required: true }
    description: { type: TEXT, required: false }
    icon: { type: VARCHAR(50), default: "check-circle" }
    color: { type: VARCHAR(7), default: "#1890ff" }
    default_priority: { type: VARCHAR(10), default: "medium" }
    attribute_schema: { type: JSONB, default: "{}", notes: "Custom fields" }
    workflow_config: { type: JSONB, default: "{}", notes: "State transitions" }
    sla_config: { type: JSONB, default: "{}", notes: "Due date rules" }
    is_system: { type: BOOLEAN, default: false }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, key], unique: true }
```

### 7.11 ActionFlowExecution

```yaml
ActionFlowExecution:
  description: "Single run instance of an Action Flow"
  type: Transactional
  immutable: true
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    action_flow_id: { type: UUID, required: true, fk: action_flow }
    triggered_by: { type: VARCHAR(20), required: true, enum: [schedule, webhook, manual, sensor, api, on_demand] }
    triggered_by_user_id: { type: UUID, required: false, fk: user }
    trigger_data: { type: JSONB, default: "{}" }
    status: { type: VARCHAR(20), required: true, default: "running", enum: [running, success, warning, error, cancelled] }
    started_at: { type: TIMESTAMPTZ, required: true, default: now() }
    completed_at: { type: TIMESTAMPTZ, required: false }
    duration_ms: { type: INTEGER, required: false }
    cycles_completed: { type: INTEGER, default: 0 }
    bundles_processed: { type: INTEGER, default: 0 }
    input_values: { type: JSONB, default: "{}" }
    output_values: { type: JSONB, default: "{}" }
    error_message: { type: TEXT, required: false }
    error_module_id: { type: UUID, required: false }
    execution_log: { type: JSONB, default: "[]", notes: "Per-module results" }
    is_data_confidential: { type: BOOLEAN, default: false }
    metadata: { type: JSONB, default: "{}" }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, action_flow_id, created_at DESC] }
    - { columns: [tenant_id, status] }
    - { columns: [tenant_id, triggered_by, created_at DESC] }
  partitioning:
    strategy: RANGE
    column: created_at
    interval: MONTHLY
  retention: "30 days (enterprise), 3 days (standard)"
```

### 7.12 IncompleteExecution

```yaml
IncompleteExecution:
  description: "Stored failed execution for retry/manual resolution"
  type: Transactional
  attributes:
    id: { type: UUID, required: true, pk: true }
    tenant_id: { type: UUID, required: true, fk: tenant }
    action_flow_id: { type: UUID, required: true, fk: action_flow }
    execution_id: { type: UUID, required: true, fk: action_flow_execution }
    failed_module_id: { type: UUID, required: true, fk: action_flow_module }
    error_message: { type: TEXT, required: true }
    error_type: { type: VARCHAR(50), required: true }
    bundle_data: { type: JSONB, required: true }
    remaining_flow: { type: JSONB, required: true, notes: "Modules not yet executed" }
    retry_count: { type: INTEGER, default: 0 }
    max_retries: { type: INTEGER, default: 3 }
    next_retry_at: { type: TIMESTAMPTZ, required: false }
    retry_delay_seconds: { type: INTEGER, default: 60 }
    status: { type: VARCHAR(20), default: "pending", enum: [pending, retrying, resolved, abandoned] }
    resolved_at: { type: TIMESTAMPTZ, required: false }
    resolved_by: { type: UUID, required: false, fk: user }
    resolution_type: { type: VARCHAR(20), enum: [retry_success, manual_resolve, deleted] }
    created_at: { type: TIMESTAMPTZ, required: true, default: now() }
    updated_at: { type: TIMESTAMPTZ, required: true, default: now() }
  indexes:
    - { columns: [tenant_id, action_flow_id, status] }
    - { columns: [tenant_id, status, next_retry_at] }
```

---

## 8. Complete Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              PROCESS INTELLIGENCE PLATFORM ERD                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────────┐
                                    │     TENANT      │
                                    │   (Existence)   │
                                    └────────┬────────┘
                                             │
          ┌──────────────────────────────────┼──────────────────────────────────┐
          │                                  │                                  │
          ▼                                  ▼                                  ▼
┌─────────────────┐               ┌─────────────────┐               ┌─────────────────┐
│      SPACE      │               │    DATA_POOL    │               │      USER       │
│                 │               │                 │               │   (Identity)    │
└────────┬────────┘               └────────┬────────┘               └─────────────────┘
         │                                 │                                  │
         │ 1:N                             │ 1:N                              │ created_by
         ▼                                 ▼                                  │ assigned_to
┌─────────────────┐               ┌─────────────────┐                         │
│     PACKAGE     │               │ DATA_CONNECTION │                         │
│                 │               │                 │                         │
└────────┬────────┘               └─────────────────┘                         │
         │                                 │                                  │
    ┌────┴────────────┬────────────┐      │ 1:N                              │
    │                 │            │      ▼                                  │
    ▼                 ▼            ▼ ┌─────────────────┐                      │
┌───────────┐  ┌───────────┐  ┌─────│     TABLE       │                      │
│   VIEW    │  │KNOWLEDGE_ │  │     └────────┬────────┘                      │
│           │  │   MODEL   │  │              │ 1:N                           │
└─────┬─────┘  └─────┬─────┘  │              ▼                               │
      │              │        │     ┌─────────────────┐                      │
      │ 1:N          │ 1:N    │     │     COLUMN      │                      │
      ▼              ▼        │     └─────────────────┘                      │
┌───────────┐  ┌───────────┐  │                                              │
│ COMPONENT │  │    KPI    │  │                                              │
└───────────┘  ├───────────┤  │     ┌─────────────────┐                      │
               │  RECORD   │──┼────►│   DATA_MODEL    │                      │
               ├───────────┤  │     └────────┬────────┘                      │
               │  FILTER   │  │              │                               │
               ├───────────┤  │              │ 1:N (OCPM)                    │
               │ VARIABLE  │  │              ▼                               │
               ├───────────┤  │     ┌─────────────────┐                      │
               │ EVENTLOG_ │  │     │  PERSPECTIVE    │                      │
               │  CONFIG   │  │     └────────┬────────┘                      │
               └───────────┘  │              │                               │
                              │         ┌────┴────┬────────────┐             │
                              │         │         │            │             │
                              │         ▼         ▼            ▼             │
                              │  ┌───────────┐ ┌───────────┐ ┌───────────┐   │
                              │  │OBJECT_TYPE│ │EVENT_TYPE │ │OBJECT_    │   │
                              │  │           │ │           │ │RELATIONSHIP│  │
                              │  └─────┬─────┘ └─────┬─────┘ └───────────┘   │
                              │        │             │                       │
                              │        │ 1:N         │ N:M (via E-O-R)       │
                              │        ▼             ▼                       │
┌─────────────────────────────┴────────────────────────────────────────────┐ │
│                           OCPM RUNTIME DATA                              │ │
├──────────────────────────────────────────────────────────────────────────┤ │
│  ┌───────────┐     ┌───────────────────┐     ┌───────────────────┐       │ │
│  │  OBJECT   │────►│ OBJECT_REL_       │◄────│      EVENT        │       │ │
│  │           │     │    INSTANCE       │     │                   │       │ │
│  └─────┬─────┘     └───────────────────┘     └─────────┬─────────┘       │ │
│        │                                               │                 │ │
│        │ N:M                                           │                 │ │
│        ▼                                               │                 │ │
│  ┌───────────────────┐                                 │                 │ │
│  │ EVENT_OBJECT_     │◄────────────────────────────────┘                 │ │
│  │   RELATIONSHIP    │                                                   │ │
│  └───────────────────┘                                                   │ │
│                                                                          │ │
│  ┌───────────────────┐                                                   │ │
│  │  OBJECT_CHANGE    │ (Change Tracking)                                 │ │
│  └───────────────────┘                                                   │ │
└──────────────────────────────────────────────────────────────────────────┘ │
                                                                             │
┌──────────────────────────────────────────────────────────────────────────┐ │
│                        CASE-CENTRIC RUNTIME DATA                         │ │
├──────────────────────────────────────────────────────────────────────────┤ │
│  ┌───────────┐     ┌───────────┐     ┌───────────┐                       │ │
│  │   CASE    │────►│   EVENT   │────►│  ACTIVITY │ (Reference)           │ │
│  └─────┬─────┘     └───────────┘     └───────────┘                       │ │
│        │                                                                 │ │
│        │ computed                                                        │ │
│        ▼                                                                 │ │
│  ┌───────────┐                                                           │ │
│  │  VARIANT  │ (Materialized)                                            │ │
│  └───────────┘                                                           │ │
└──────────────────────────────────────────────────────────────────────────┘ │
                                                                             │
┌──────────────────────────────────────────────────────────────────────────┐ │
│                           AUTOMATION LAYER                               │ │
├──────────────────────────────────────────────────────────────────────────┤ │
│                                                                          │ │
│  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐          │ │
│  │  ACTION_FLOW  │────►│    MODULE     │────►│  CONNECTION   │          │ │
│  └───────┬───────┘     └───────────────┘     └───────────────┘          │ │
│          │                                                               │ │
│          │ triggered_by                                                  │ │
│          ▼                                                               │ │
│  ┌───────────────┐     ┌───────────────┐                                │ │
│  │   SCHEDULE    │     │    WEBHOOK    │────►WebhookQueue               │ │
│  └───────────────┘     └───────────────┘                                │ │
│                                                                          │ │
│  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐          │ │
│  │    SKILL      │────►│    SENSOR     │────►│    SIGNAL     │◄─────────┼─┤
│  └───────────────┘     └───────────────┘     └───────┬───────┘          │ │
│                                                      │                   │ │
│                                               creates│                   │ │
│                                                      ▼                   │ │
│                                              ┌───────────────┐           │ │
│                                              │     TASK      │◄──────────┼─┤
│                                              └───────────────┘           │ │
│                                                                          │ │
│  ┌───────────────────┐     ┌─────────────────────┐                      │ │
│  │ ACTION_FLOW_      │     │ INCOMPLETE_         │                      │ │
│  │    EXECUTION      │     │    EXECUTION        │                      │ │
│  └───────────────────┘     └─────────────────────┘                      │ │
└──────────────────────────────────────────────────────────────────────────┘ │
                                                                             │
                              All entities link back to TENANT ◄─────────────┘
```

---

## 9. SQL Schema Definitions

Now I'll generate the actual SQL for key entities:
