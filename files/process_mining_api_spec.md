# Process Mining Platform - API Specification
## Version 1.0 | Web Application API

---

# PART 1: FOUNDATION

## 1. API Design Principles

### 1.1 Core Standards

| Principle | Implementation |
|-----------|----------------|
| **Architecture** | REST with resource-oriented design |
| **Data Format** | JSON exclusively |
| **Naming** | snake_case for fields, kebab-case for URLs |
| **Versioning** | URL prefix: `/api/v1/` |
| **Pagination** | Cursor-based for lists, offset for small datasets |
| **Filtering** | Query parameters with consistent operators |
| **Sorting** | `sort` parameter with `field:direction` syntax |
| **Errors** | Consistent error envelope with codes |
| **Timestamps** | ISO 8601 format (UTC): `2024-01-15T10:30:00Z` |
| **IDs** | UUID v4 format |

### 1.2 URL Structure

```
/api/v1/{resource}                    # Collection
/api/v1/{resource}/{id}               # Single resource
/api/v1/{resource}/{id}/{sub-resource} # Nested resource
/api/v1/{resource}/{id}/actions/{action} # Resource action
```

### 1.3 HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| `GET` | Retrieve resource(s) | Yes | Yes |
| `POST` | Create resource / Execute action | No | No |
| `PUT` | Full resource replacement | Yes | No |
| `PATCH` | Partial resource update | Yes | No |
| `DELETE` | Remove resource | Yes | No |

### 1.4 Standard Response Envelope

**Success Response:**
```json
{
  "success": true,
  "data": { },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**List Response:**
```json
{
  "success": true,
  "data": [ ],
  "pagination": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": [
      {
        "field": "name",
        "message": "Name is required",
        "code": "REQUIRED"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### 1.5 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `UNPROCESSABLE` | 422 | Valid syntax but cannot process |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Temporary unavailability |
| `JOB_FAILED` | 422 | Background job failed |
| `INVALID_FORMAT` | 400 | File format not supported |
| `FILE_TOO_LARGE` | 413 | Upload exceeds limit |

### 1.6 Query Parameters Convention

**Filtering:**
```
?filter[field]=value              # Exact match
?filter[field][contains]=value    # Contains (string)
?filter[field][gte]=value         # Greater than or equal
?filter[field][lte]=value         # Less than or equal
?filter[field][in]=val1,val2      # In list
?filter[field][is_null]=true      # Null check
```

**Sorting:**
```
?sort=created_at:desc             # Single sort
?sort=status:asc,name:desc        # Multiple sort
```

**Pagination:**
```
?page=1&per_page=20               # Offset pagination
?cursor=abc123&limit=20           # Cursor pagination
```

**Field Selection:**
```
?fields=id,name,status            # Sparse fieldsets
?include=statistics,activities    # Include related data
```

---

## 2. Development Phases Overview

### Phase 1: Core Infrastructure (Foundation)
- Data Pools management
- File uploads (XES, CSV, OCEL)
- Basic import pipeline
- Event log management

### Phase 2: Case-Centric Mining
- Cases and Events API
- Activities and Resources
- Variants analysis
- Basic statistics

### Phase 3: OCEL Support
- Object Types and Event Types
- Objects and Events (OCEL)
- E2O and O2O relationships
- OCEL import/export

### Phase 4: Process Discovery
- Discovery algorithm execution
- Model storage and retrieval
- Petri net operations
- DFG and BPMN support

### Phase 5: Conformance & Quality
- Conformance checking jobs
- Token replay and alignments
- Deviation analysis
- Quality metrics

### Phase 6: Analytics & Performance
- Performance metrics definition
- Time-series metric values
- Bottleneck analysis
- Social network analysis

### Phase 7: Ontology & Semantics
- Ontology management
- Concept hierarchies
- Entity annotations
- Semantic queries

### Phase 8: Automation
- Action rules
- Workflow definitions
- Scheduled jobs
- Execution monitoring

---

# PART 2: API SPECIFICATION BY PHASE

---

## PHASE 1: CORE INFRASTRUCTURE

### Feature 1.1: Data Pools

**Resource:** `/api/v1/data-pools`

Data pools are containers that group related event logs, OCEL data, and analysis artifacts.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/data-pools` | List all data pools |
| `POST` | `/data-pools` | Create new data pool |
| `GET` | `/data-pools/{id}` | Get data pool details |
| `PATCH` | `/data-pools/{id}` | Update data pool |
| `DELETE` | `/data-pools/{id}` | Delete data pool |
| `GET` | `/data-pools/{id}/statistics` | Get aggregated statistics |
| `POST` | `/data-pools/{id}/actions/refresh-stats` | Recalculate statistics |

#### Data Pool Object

```yaml
DataPool:
  id: uuid
  name: string (required, unique)
  description: string
  pool_type: enum [case_centric, ocel, hybrid]
  status: enum [active, archived, error]
  statistics:
    total_events: integer
    total_cases: integer
    total_objects: integer
    total_variants: integer
    date_range:
      min: datetime
      max: datetime
    last_computed_at: datetime
  created_at: datetime
  updated_at: datetime
```

#### Create Data Pool

**Request Body:**
```yaml
name: string (required)
description: string
pool_type: enum [case_centric, ocel, hybrid] (required)
```

#### Query Parameters for List

| Parameter | Type | Description |
|-----------|------|-------------|
| `filter[status]` | string | Filter by status |
| `filter[pool_type]` | string | Filter by type |
| `filter[name][contains]` | string | Search by name |
| `sort` | string | Sort field and direction |
| `include` | string | Include `statistics` |

---

### Feature 1.2: File Uploads

**Resource:** `/api/v1/uploads`

Handles file uploads for XES, CSV, OCEL JSON, and other supported formats.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/uploads` | Upload file |
| `GET` | `/uploads/{id}` | Get upload status |
| `GET` | `/uploads/{id}/preview` | Preview file contents |
| `DELETE` | `/uploads/{id}` | Delete uploaded file |
| `POST` | `/uploads/{id}/actions/validate` | Validate file format |
| `POST` | `/uploads/{id}/actions/detect-schema` | Auto-detect schema |

#### Upload Object

```yaml
Upload:
  id: uuid
  filename: string
  original_filename: string
  file_size: integer (bytes)
  mime_type: string
  format: enum [xes, csv, ocel_json, ocel_xml, parquet]
  status: enum [pending, processing, ready, error]
  file_path: string (local path)
  detected_schema:
    columns: array
    sample_rows: array
    detected_mappings: object
  validation_result:
    is_valid: boolean
    errors: array
    warnings: array
  created_at: datetime
```

#### Upload File

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | file | The file to upload |
| `format` | string | Optional format hint |

**Supported Formats:**

| Format | Extensions | Max Size |
|--------|------------|----------|
| XES | .xes, .xes.gz | 500 MB |
| CSV | .csv | 500 MB |
| OCEL JSON | .jsonocel, .json | 500 MB |
| OCEL XML | .xmlocel, .xml | 500 MB |
| Parquet | .parquet | 1 GB |

#### Preview Response

```yaml
Preview:
  total_rows: integer
  columns:
    - name: string
      type: string (detected)
      sample_values: array
      null_count: integer
      unique_count: integer
  sample_data: array (first 100 rows)
  format_details:
    encoding: string
    delimiter: string (CSV)
    has_header: boolean
```

---

### Feature 1.3: Import Jobs

**Resource:** `/api/v1/import-jobs`

Manages the import pipeline from uploaded files to structured event logs.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/import-jobs` | List import jobs |
| `POST` | `/import-jobs` | Create import job |
| `GET` | `/import-jobs/{id}` | Get job details |
| `PATCH` | `/import-jobs/{id}` | Update job configuration |
| `DELETE` | `/import-jobs/{id}` | Delete job |
| `POST` | `/import-jobs/{id}/actions/run` | Execute import |
| `POST` | `/import-jobs/{id}/actions/cancel` | Cancel running import |
| `GET` | `/import-jobs/{id}/runs` | Get execution history |
| `GET` | `/import-jobs/{id}/runs/{run_id}` | Get specific run details |

#### Import Job Object

```yaml
ImportJob:
  id: uuid
  data_pool_id: uuid (required)
  name: string (required)
  job_type: enum [file_import, database_extract]
  source:
    upload_id: uuid
    file_path: string
  target_type: enum [event_log, ocel]
  mapping_config: MappingConfig
  is_active: boolean
  last_run:
    id: uuid
    status: string
    started_at: datetime
  created_at: datetime
  updated_at: datetime
```

#### Mapping Configuration (Case-Centric)

```yaml
MappingConfig:
  case_id_column: string (required)
  activity_column: string (required)
  timestamp_column: string (required)
  timestamp_format: string (auto-detect if not provided)
  resource_column: string
  cost_column: string
  additional_case_attributes:
    - source_column: string
      target_name: string
      data_type: enum [string, integer, float, datetime, boolean]
  additional_event_attributes:
    - source_column: string
      target_name: string
      data_type: enum [string, integer, float, datetime, boolean]
  filters:
    - column: string
      operator: enum [eq, neq, gt, gte, lt, lte, in, contains]
      value: any
```

#### Mapping Configuration (OCEL)

```yaml
OCELMappingConfig:
  event_id_column: string (required)
  event_type_column: string (required)
  timestamp_column: string (required)
  object_mappings:
    - object_type: string (required)
      id_column: string (required)
      qualifier: string
      qualifier_value_column: string
      attributes:
        - source_column: string
          target_name: string
  event_attributes:
    - source_column: string
      target_name: string
```

#### Import Job Run Object

```yaml
ImportJobRun:
  id: uuid
  job_id: uuid
  status: enum [pending, running, success, failed, cancelled]
  started_at: datetime
  completed_at: datetime
  duration_seconds: integer
  progress:
    current_row: integer
    total_rows: integer
    percentage: float
  results:
    rows_read: integer
    rows_written: integer
    events_created: integer
    cases_created: integer
    objects_created: integer
    errors_count: integer
  error_message: string
  error_details: array
```

---

### Feature 1.4: Event Logs

**Resource:** `/api/v1/event-logs`

Manages case-centric event log definitions and metadata.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/event-logs` | List event logs |
| `POST` | `/event-logs` | Create event log |
| `GET` | `/event-logs/{id}` | Get event log details |
| `PATCH` | `/event-logs/{id}` | Update event log |
| `DELETE` | `/event-logs/{id}` | Delete event log |
| `GET` | `/event-logs/{id}/statistics` | Get detailed statistics |
| `POST` | `/event-logs/{id}/actions/compute-statistics` | Recompute statistics |
| `GET` | `/event-logs/{id}/export` | Export to XES/CSV |
| `GET` | `/event-logs/{id}/schema` | Get attribute schema |

#### Event Log Object

```yaml
EventLog:
  id: uuid
  data_pool_id: uuid (required)
  name: string (required)
  description: string
  
  # Key mappings
  case_id_key: string
  activity_key: string
  timestamp_key: string
  resource_key: string
  
  # Attribute definitions
  case_attributes:
    - name: string
      type: enum [string, integer, float, datetime, boolean]
      description: string
  event_attributes:
    - name: string
      type: enum [string, integer, float, datetime, boolean]
      description: string
  
  # XES metadata
  classifiers: object
  extensions: object
  
  # Statistics (computed)
  statistics:
    case_count: integer
    event_count: integer
    activity_count: integer
    variant_count: integer
    resource_count: integer
    start_date: datetime
    end_date: datetime
    avg_case_duration_seconds: float
    avg_events_per_case: float
  
  source_file_path: string
  source_file_format: string
  
  created_at: datetime
  updated_at: datetime
```

#### Export Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | `xes`, `csv`, `parquet` |
| `filter[case_ids]` | string | Comma-separated case IDs |
| `filter[date_from]` | datetime | Start date filter |
| `filter[date_to]` | datetime | End date filter |
| `filter[activities]` | string | Comma-separated activities |
| `include_attributes` | string | Comma-separated attributes |

---

## PHASE 2: CASE-CENTRIC MINING

### Feature 2.1: Cases

**Resource:** `/api/v1/event-logs/{event_log_id}/cases`

Manages process instances (traces).

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cases` | List cases |
| `GET` | `/cases/{id}` | Get case details |
| `GET` | `/cases/{id}/events` | Get case events (trace) |
| `GET` | `/cases/{id}/timeline` | Get visual timeline data |
| `DELETE` | `/cases/{id}` | Delete case |
| `GET` | `/cases/statistics` | Aggregate case statistics |

#### Case Object

```yaml
Case:
  id: uuid
  event_log_id: uuid
  case_id: string (business identifier)
  variant_id: uuid
  variant_sequence: array (activity names)
  
  start_time: datetime
  end_time: datetime
  duration_seconds: integer
  
  event_count: integer
  status: enum [open, completed, cancelled]
  
  attributes: object (case-level attributes)
  
  created_at: datetime
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `filter[case_id]` | string | Exact case ID match |
| `filter[case_id][contains]` | string | Case ID contains |
| `filter[variant_id]` | uuid | Filter by variant |
| `filter[status]` | string | Filter by status |
| `filter[duration_seconds][gte]` | integer | Min duration |
| `filter[duration_seconds][lte]` | integer | Max duration |
| `filter[start_time][gte]` | datetime | Started after |
| `filter[start_time][lte]` | datetime | Started before |
| `filter[event_count][gte]` | integer | Min events |
| `filter[attributes.{key}]` | any | Filter by attribute |
| `sort` | string | Sort field |
| `include` | string | `variant`, `events`, `statistics` |

#### Case Timeline Response

```yaml
Timeline:
  case_id: string
  total_duration_seconds: integer
  events:
    - id: uuid
      activity_name: string
      timestamp: datetime
      relative_time_seconds: integer (from start)
      duration_to_next_seconds: integer
      resource_name: string
      attributes: object
  milestones:
    - name: string
      timestamp: datetime
      type: enum [start, end, milestone]
```

---

### Feature 2.2: Events

**Resource:** `/api/v1/event-logs/{event_log_id}/events`

Access individual events within an event log.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/events` | List events |
| `GET` | `/events/{id}` | Get event details |
| `GET` | `/events/statistics` | Event statistics |
| `GET` | `/events/dfg` | Get directly-follows graph |

#### Event Object

```yaml
Event:
  id: uuid
  event_log_id: uuid
  case_id: uuid
  case_identifier: string (business case ID)
  
  activity_id: uuid
  activity_name: string
  
  timestamp: datetime
  sort_key: integer
  
  resource_id: uuid
  resource_name: string
  
  lifecycle: enum [start, complete, suspend, resume, abort]
  
  cost: float
  
  attributes: object
  
  # Navigation helpers
  previous_event_id: uuid
  next_event_id: uuid
  position_in_case: integer
  
  created_at: datetime
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `filter[case_id]` | uuid | Filter by case |
| `filter[activity_name]` | string | Filter by activity |
| `filter[activity_name][in]` | string | Multiple activities |
| `filter[resource_name]` | string | Filter by resource |
| `filter[timestamp][gte]` | datetime | After timestamp |
| `filter[timestamp][lte]` | datetime | Before timestamp |
| `filter[lifecycle]` | string | Filter by lifecycle |
| `filter[attributes.{key}]` | any | Filter by attribute |
| `sort` | string | Default: `timestamp:asc` |

#### Directly-Follows Graph Response

```yaml
DFG:
  nodes:
    - id: string (activity name)
      frequency: integer
      is_start: boolean
      is_end: boolean
  edges:
    - source: string
      target: string
      frequency: integer
      performance:
        mean_seconds: float
        median_seconds: float
        min_seconds: float
        max_seconds: float
  start_activities:
    - activity: string
      frequency: integer
  end_activities:
    - activity: string
      frequency: integer
```

---

### Feature 2.3: Activities

**Resource:** `/api/v1/event-logs/{event_log_id}/activities`

Activity catalog and statistics.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/activities` | List activities |
| `GET` | `/activities/{id}` | Get activity details |
| `PATCH` | `/activities/{id}` | Update activity metadata |
| `GET` | `/activities/{id}/statistics` | Detailed activity stats |
| `GET` | `/activities/{id}/transitions` | Get transitions from/to |

#### Activity Object

```yaml
Activity:
  id: uuid
  event_log_id: uuid
  name: string
  display_name: string
  category: string
  is_automated: boolean
  
  # Display
  icon: string
  color: string (hex)
  
  # Statistics
  occurrence_count: integer
  case_coverage: float (percentage of cases)
  avg_duration_seconds: float
  avg_cost: float
  
  # Computed
  is_start_activity: boolean
  is_end_activity: boolean
  
  created_at: datetime
```

#### Activity Transitions Response

```yaml
Transitions:
  activity_id: uuid
  activity_name: string
  incoming:
    - from_activity: string
      frequency: integer
      avg_duration_seconds: float
  outgoing:
    - to_activity: string
      frequency: integer
      avg_duration_seconds: float
  self_loops:
    frequency: integer
    avg_duration_seconds: float
```

---

### Feature 2.4: Variants

**Resource:** `/api/v1/event-logs/{event_log_id}/variants`

Process variants (unique execution paths).

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/variants` | List variants |
| `GET` | `/variants/{id}` | Get variant details |
| `GET` | `/variants/{id}/cases` | Get cases of variant |
| `GET` | `/variants/comparison` | Compare multiple variants |
| `POST` | `/variants/actions/detect` | Re-detect variants |

#### Variant Object

```yaml
Variant:
  id: uuid
  event_log_id: uuid
  
  activity_sequence: array (ordered activities)
  sequence_hash: string
  sequence_length: integer
  
  # Statistics
  case_count: integer
  percentage: float
  avg_duration_seconds: integer
  min_duration_seconds: integer
  max_duration_seconds: integer
  stddev_duration_seconds: float
  
  is_happy_path: boolean
  rank: integer (by frequency)
  
  first_seen_at: datetime
  last_seen_at: datetime
  
  created_at: datetime
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `filter[case_count][gte]` | integer | Min case count |
| `filter[is_happy_path]` | boolean | Happy path only |
| `filter[sequence_length][gte]` | integer | Min length |
| `filter[sequence_length][lte]` | integer | Max length |
| `filter[contains_activity]` | string | Contains activity |
| `sort` | string | Default: `case_count:desc` |
| `top` | integer | Return top N variants |

#### Variant Comparison Response

```yaml
VariantComparison:
  variants:
    - id: uuid
      sequence: array
      case_count: integer
      avg_duration_seconds: integer
  comparison:
    common_activities: array
    divergence_points:
      - position: integer
        variants:
          - variant_id: uuid
            activity: string
    performance_comparison:
      - variant_id: uuid
        avg_duration_seconds: integer
        duration_rank: integer
```

---

### Feature 2.5: Resources

**Resource:** `/api/v1/event-logs/{event_log_id}/resources`

Resource (performer) management and analysis.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/resources` | List resources |
| `GET` | `/resources/{id}` | Get resource details |
| `PATCH` | `/resources/{id}` | Update resource metadata |
| `GET` | `/resources/{id}/activities` | Activities performed |
| `GET` | `/resources/{id}/workload` | Workload over time |
| `GET` | `/resources/handover-matrix` | Handover of work matrix |

#### Resource Object

```yaml
Resource:
  id: uuid
  event_log_id: uuid
  name: string
  display_name: string
  resource_type: enum [human, system, bot]
  department: string
  role: string
  
  # Statistics
  event_count: integer
  case_count: integer
  distinct_activities: integer
  avg_events_per_day: float
  
  # Activity breakdown
  top_activities:
    - activity_name: string
      count: integer
      percentage: float
  
  created_at: datetime
```

#### Handover Matrix Response

```yaml
HandoverMatrix:
  resources: array (resource names)
  matrix:
    - from_resource: string
      to_resource: string
      frequency: integer
      avg_time_between_seconds: float
```

---

## PHASE 3: OCEL SUPPORT

### Feature 3.1: Object Types

**Resource:** `/api/v1/data-pools/{pool_id}/object-types`

OCEL object type definitions.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/object-types` | List object types |
| `POST` | `/object-types` | Create object type |
| `GET` | `/object-types/{id}` | Get object type |
| `PATCH` | `/object-types/{id}` | Update object type |
| `DELETE` | `/object-types/{id}` | Delete object type |
| `GET` | `/object-types/{id}/schema` | Get attribute schema |
| `GET` | `/object-types/{id}/statistics` | Type statistics |

#### Object Type Object

```yaml
ObjectType:
  id: uuid
  data_pool_id: uuid
  name: string (required)
  display_name: string
  description: string
  
  attribute_schema:
    attributes:
      - name: string
        type: enum [string, integer, float, datetime, boolean]
        is_identifier: boolean
        is_required: boolean
        description: string
  
  icon: string
  color: string
  is_process_object: boolean
  
  # Statistics
  object_count: integer
  avg_events_per_object: float
  
  created_at: datetime
```

---

### Feature 3.2: Event Types

**Resource:** `/api/v1/data-pools/{pool_id}/event-types`

OCEL event type (activity) definitions.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/event-types` | List event types |
| `POST` | `/event-types` | Create event type |
| `GET` | `/event-types/{id}` | Get event type |
| `PATCH` | `/event-types/{id}` | Update event type |
| `DELETE` | `/event-types/{id}` | Delete event type |
| `GET` | `/event-types/{id}/object-involvement` | Objects involved |

#### Event Type Object

```yaml
EventType:
  id: uuid
  data_pool_id: uuid
  name: string (required)
  display_name: string
  description: string
  
  attribute_schema:
    attributes:
      - name: string
        type: enum [string, integer, float, datetime, boolean]
        is_required: boolean
  
  category: string
  color: string
  
  # Statistics
  occurrence_count: integer
  avg_objects_per_event: float
  
  # Object type involvement
  involved_object_types:
    - object_type_id: uuid
      object_type_name: string
      avg_count: float
      qualifier: string
  
  created_at: datetime
```

---

### Feature 3.3: OCEL Objects

**Resource:** `/api/v1/data-pools/{pool_id}/objects`

OCEL object instances.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/objects` | List objects |
| `GET` | `/objects/{id}` | Get object |
| `GET` | `/objects/{id}/events` | Events involving object |
| `GET` | `/objects/{id}/related-objects` | Related objects (O2O) |
| `GET` | `/objects/{id}/lifecycle` | Object lifecycle view |
| `GET` | `/objects/{id}/attribute-history` | Attribute changes |

#### Object Instance

```yaml
OCELObject:
  id: uuid
  data_pool_id: uuid
  ocel_id: string
  object_type_id: uuid
  object_type_name: string
  
  attributes: object (current values)
  
  # Statistics
  event_count: integer
  first_event_at: datetime
  last_event_at: datetime
  lifecycle_duration_seconds: integer
  
  # Related objects summary
  related_objects_count: integer
  
  created_at: datetime
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `filter[object_type_id]` | uuid | Filter by type |
| `filter[ocel_id]` | string | Exact object ID |
| `filter[ocel_id][contains]` | string | Object ID contains |
| `filter[attributes.{key}]` | any | Attribute filter |
| `filter[event_count][gte]` | integer | Min events |
| `include` | string | `events`, `related_objects` |

#### Object Lifecycle Response

```yaml
ObjectLifecycle:
  object_id: uuid
  ocel_id: string
  object_type: string
  
  lifecycle_start: datetime
  lifecycle_end: datetime
  duration_seconds: integer
  
  events:
    - event_id: uuid
      event_type: string
      timestamp: datetime
      qualifier: string
      other_objects:
        - ocel_id: string
          object_type: string
  
  attribute_changes:
    - attribute: string
      timestamp: datetime
      old_value: any
      new_value: any
```

---

### Feature 3.4: OCEL Events

**Resource:** `/api/v1/data-pools/{pool_id}/ocel-events`

OCEL event instances.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ocel-events` | List events |
| `GET` | `/ocel-events/{id}` | Get event |
| `GET` | `/ocel-events/{id}/objects` | Objects in event |
| `GET` | `/ocel-events/object-centric-dfg` | OC-DFG |

#### OCEL Event Object

```yaml
OCELEvent:
  id: uuid
  data_pool_id: uuid
  ocel_id: string
  event_type_id: uuid
  event_type_name: string
  
  timestamp: datetime
  
  attributes: object
  
  # Related objects
  objects:
    - object_id: uuid
      ocel_id: string
      object_type: string
      qualifier: string
      qualifier_value: object
  
  created_at: datetime
```

#### Object-Centric DFG Response

```yaml
OCDFG:
  object_type: string (perspective)
  
  nodes:
    - id: string (event type)
      frequency: integer
      object_types_involved: array
  
  edges:
    - source: string
      target: string
      frequency: integer
      object_flow:
        - object_type: string
          count: integer
  
  object_type_interactions:
    - event_type: string
      object_types: array
      cardinality: object
```

---

### Feature 3.5: Object Relationships

**Resource:** `/api/v1/data-pools/{pool_id}/object-relationships`

O2O relationships between objects.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/object-relationships` | List relationships |
| `POST` | `/object-relationships` | Create relationship |
| `DELETE` | `/object-relationships/{id}` | Delete relationship |
| `GET` | `/object-relationships/types` | Get relationship types |
| `GET` | `/object-relationships/graph` | Get object graph |

#### Object Relationship

```yaml
ObjectRelationship:
  id: uuid
  source_object_id: uuid
  target_object_id: uuid
  source_ocel_id: string
  target_ocel_id: string
  source_object_type: string
  target_object_type: string
  
  relationship_type: string
  attributes: object
  
  valid_from: datetime
  valid_to: datetime
```

---

### Feature 3.6: OCEL Import/Export

**Resource:** `/api/v1/data-pools/{pool_id}/ocel`

OCEL format import and export.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ocel/import` | Import OCEL file |
| `GET` | `/ocel/export` | Export as OCEL |
| `GET` | `/ocel/export/json` | Export as OCEL JSON |
| `GET` | `/ocel/export/xml` | Export as OCEL XML |
| `GET` | `/ocel/validate` | Validate OCEL structure |

#### Import Request

```yaml
ImportOCEL:
  upload_id: uuid (required)
  format: enum [json, xml] (auto-detect)
  options:
    merge_existing: boolean (default: false)
    object_type_mapping: object (optional remapping)
    event_type_mapping: object (optional remapping)
```

#### Export Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | `json`, `xml` |
| `filter[event_types]` | string | Comma-separated types |
| `filter[object_types]` | string | Comma-separated types |
| `filter[timestamp_from]` | datetime | Start date |
| `filter[timestamp_to]` | datetime | End date |
| `pretty` | boolean | Pretty print output |

---

## PHASE 4: PROCESS DISCOVERY

### Feature 4.1: Discovery Jobs

**Resource:** `/api/v1/discovery`

Execute process discovery algorithms.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/discovery/run` | Run discovery algorithm |
| `GET` | `/discovery/jobs` | List discovery jobs |
| `GET` | `/discovery/jobs/{id}` | Get job status |
| `POST` | `/discovery/jobs/{id}/cancel` | Cancel job |
| `GET` | `/discovery/algorithms` | List available algorithms |

#### Discovery Request

```yaml
DiscoveryRequest:
  event_log_id: uuid (for case-centric)
  data_pool_id: uuid (for OCEL)
  
  algorithm: enum [alpha, alpha_plus, heuristics, inductive, inductive_imf, dfg]
  
  parameters:
    # Heuristics miner
    dependency_threshold: float (0.0-1.0)
    and_threshold: float
    loop_two_threshold: float
    
    # Inductive miner
    noise_threshold: float (0.0-1.0)
    
    # DFG
    include_performance: boolean
  
  output:
    name: string (required)
    description: string
    model_type: enum [petri_net, bpmn, dfg, process_tree]
  
  # For OCEL
  perspective:
    lead_object_type: string
    included_event_types: array
```

#### Discovery Job Status

```yaml
DiscoveryJob:
  id: uuid
  status: enum [pending, running, completed, failed, cancelled]
  
  algorithm: string
  parameters: object
  
  started_at: datetime
  completed_at: datetime
  duration_seconds: integer
  
  progress:
    stage: string
    percentage: float
  
  result:
    model_id: uuid
    model_type: string
  
  error_message: string
```

#### Available Algorithms Response

```yaml
Algorithms:
  case_centric:
    - id: alpha
      name: Alpha Miner
      description: Discovers Petri nets from logs
      output_types: [petri_net]
      parameters:
        - name: string
          type: string
          default: any
          description: string
    - id: heuristics
      name: Heuristics Miner
      ...
    - id: inductive
      name: Inductive Miner
      ...
  
  ocel:
    - id: oc_petri_net
      name: Object-Centric Petri Net
      ...
```

---

### Feature 4.2: Discovered Models

**Resource:** `/api/v1/models`

Manage discovered process models.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/models` | List all models |
| `GET` | `/models/{id}` | Get model |
| `PATCH` | `/models/{id}` | Update model metadata |
| `DELETE` | `/models/{id}` | Delete model |
| `GET` | `/models/{id}/visualize` | Get visualization data |
| `GET` | `/models/{id}/export` | Export model file |
| `POST` | `/models/import` | Import model file |
| `POST` | `/models/{id}/actions/compute-quality` | Compute quality metrics |

#### Model Object

```yaml
DiscoveredModel:
  id: uuid
  event_log_id: uuid
  data_pool_id: uuid
  
  name: string
  description: string
  
  algorithm: string
  algorithm_params: object
  model_type: enum [petri_net, bpmn, dfg, process_tree, ocel_ocdfg]
  
  # Quality metrics
  quality_metrics:
    fitness: float
    precision: float
    generalization: float
    simplicity: float
    f_score: float
  
  # Model statistics
  statistics:
    places: integer (Petri net)
    transitions: integer (Petri net)
    arcs: integer (Petri net)
    nodes: integer (DFG/BPMN)
    edges: integer (DFG/BPMN)
  
  # Storage
  model_file_path: string
  
  # OCEL perspective
  perspective: string
  
  created_at: datetime
```

#### Visualization Response

```yaml
ModelVisualization:
  model_id: uuid
  model_type: string
  
  # For Petri net
  petri_net:
    places:
      - id: string
        label: string
        x: float
        y: float
        is_initial: boolean
        is_final: boolean
        tokens: integer
    transitions:
      - id: string
        label: string
        x: float
        y: float
        is_silent: boolean
        frequency: integer
    arcs:
      - id: string
        source: string
        target: string
        weight: integer
  
  # For DFG
  dfg:
    nodes: array
    edges: array
  
  # For BPMN
  bpmn:
    elements: array
    flows: array
```

#### Export Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | `pnml`, `bpmn`, `json`, `dot`, `svg`, `png` |

---

### Feature 4.3: Petri Net Operations

**Resource:** `/api/v1/models/{model_id}/petri-net`

Petri net specific operations.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/petri-net` | Get Petri net structure |
| `GET` | `/petri-net/places` | List places |
| `GET` | `/petri-net/transitions` | List transitions |
| `GET` | `/petri-net/arcs` | List arcs |
| `GET` | `/petri-net/reachability` | Reachability analysis |
| `GET` | `/petri-net/properties` | Structural properties |
| `POST` | `/petri-net/simulate` | Token game simulation |

#### Petri Net Structure

```yaml
PetriNet:
  id: uuid
  model_id: uuid
  name: string
  
  initial_marking: object (place -> tokens)
  final_marking: object (place -> tokens)
  
  places: array
  transitions: array
  arcs: array
  
  properties:
    is_sound: boolean
    is_live: boolean
    is_bounded: boolean
    is_free_choice: boolean
```

#### Simulation Request

```yaml
SimulateRequest:
  initial_marking: object (optional, use default)
  steps:
    - transition: string (transition name)
  max_steps: integer (for random simulation)
  mode: enum [step_by_step, random, guided]
```

#### Simulation Response

```yaml
SimulationResult:
  steps:
    - step: integer
      transition: string
      marking_before: object
      marking_after: object
      enabled_transitions: array
  
  final_marking: object
  reached_final: boolean
  deadlock: boolean
```

---

## PHASE 5: CONFORMANCE & QUALITY

### Feature 5.1: Conformance Jobs

**Resource:** `/api/v1/conformance`

Configure and run conformance checking.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/conformance/run` | Run conformance check |
| `GET` | `/conformance/jobs` | List conformance jobs |
| `GET` | `/conformance/jobs/{id}` | Get job details |
| `GET` | `/conformance/jobs/{id}/results` | Get results |
| `POST` | `/conformance/jobs/{id}/rerun` | Re-run job |

#### Conformance Request

```yaml
ConformanceRequest:
  event_log_id: uuid (required)
  model_id: uuid (required)
  name: string
  
  method: enum [token_replay, alignment, footprints]
  
  configuration:
    # Token replay
    consider_remaining_in_fitness: boolean
    
    # Alignment
    model_move_cost: float (default: 1.0)
    log_move_cost: float (default: 1.0)
    sync_cost: float (default: 0.0)
    max_trace_length: integer
    timeout_per_trace_seconds: integer
    
    # Common
    sample_size: integer (null = all)
    sample_method: enum [random, stratified]
```

#### Conformance Job

```yaml
ConformanceJob:
  id: uuid
  event_log_id: uuid
  model_id: uuid
  name: string
  
  method: string
  configuration: object
  
  status: enum [pending, running, completed, failed]
  
  started_at: datetime
  completed_at: datetime
  
  progress:
    cases_processed: integer
    total_cases: integer
    percentage: float
  
  # Summary results
  results_summary:
    fitness: float
    precision: float
    cases_checked: integer
    conforming_cases: integer
    non_conforming_cases: integer
```

---

### Feature 5.2: Conformance Results

**Resource:** `/api/v1/conformance/jobs/{job_id}/results`

Access conformance checking results.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/results` | Get aggregate results |
| `GET` | `/results/cases` | Case-level results |
| `GET` | `/results/cases/{case_id}` | Single case result |
| `GET` | `/results/deviations` | List all deviations |
| `GET` | `/results/deviations/summary` | Deviation summary |
| `GET` | `/results/alignments` | List alignments |
| `GET` | `/results/alignments/{case_id}` | Case alignment |

#### Conformance Result

```yaml
ConformanceResult:
  job_id: uuid
  computed_at: datetime
  
  # Aggregate metrics
  fitness: float
  precision: float
  generalization: float
  
  # Counts
  cases_checked: integer
  conforming_cases: integer
  non_conforming_cases: integer
  conformance_rate: float
  
  computation_time_ms: integer
  
  # Detailed breakdown
  detailed_metrics:
    token_replay:
      produced_tokens: integer
      consumed_tokens: integer
      missing_tokens: integer
      remaining_tokens: integer
    
    alignment:
      total_cost: float
      avg_cost_per_case: float
      sync_moves: integer
      model_moves: integer
      log_moves: integer
```

#### Deviation Summary

```yaml
DeviationSummary:
  total_deviations: integer
  
  by_type:
    missing: integer
    unexpected: integer
    wrong_order: integer
  
  by_activity:
    - activity: string
      missing_count: integer
      unexpected_count: integer
      affected_cases: integer
  
  by_severity:
    critical: integer
    high: integer
    medium: integer
    low: integer
  
  top_deviation_patterns:
    - pattern: string
      count: integer
      affected_cases_percentage: float
```

#### Alignment Object

```yaml
Alignment:
  case_id: uuid
  case_identifier: string
  
  alignment_cost: float
  fitness_value: float
  
  trace_length: integer
  alignment_length: integer
  
  alignment_sequence:
    - type: enum [sync, log_move, model_move]
      log_activity: string (null for model_move)
      model_activity: string (null for log_move)
      cost: float
  
  deviation_count: integer
```

---

### Feature 5.3: Quality Metrics

**Resource:** `/api/v1/models/{model_id}/quality`

Track model quality over time.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/quality` | Get current quality metrics |
| `GET` | `/quality/history` | Quality over time |
| `POST` | `/quality/compute` | Compute quality metrics |

#### Quality Metrics Response

```yaml
QualityMetrics:
  model_id: uuid
  computed_at: datetime
  
  metrics:
    fitness:
      value: float
      method: string
      sample_size: integer
    precision:
      value: float
      method: string
    generalization:
      value: float
      method: string
    simplicity:
      value: float
      details:
        places: integer
        transitions: integer
        arcs: integer
    f_score:
      value: float
  
  overall_score: float
```

---

## PHASE 6: ANALYTICS & PERFORMANCE

### Feature 6.1: Performance Metrics

**Resource:** `/api/v1/analytics/metrics`

Define and compute performance KPIs.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/metrics` | List metric definitions |
| `POST` | `/metrics` | Create metric |
| `GET` | `/metrics/{id}` | Get metric |
| `PATCH` | `/metrics/{id}` | Update metric |
| `DELETE` | `/metrics/{id}` | Delete metric |
| `POST` | `/metrics/{id}/compute` | Compute metric value |
| `GET` | `/metrics/{id}/values` | Get historical values |

#### Metric Definition

```yaml
PerformanceMetric:
  id: uuid
  event_log_id: uuid
  data_pool_id: uuid
  
  name: string (required)
  description: string
  
  metric_type: enum [throughput_time, waiting_time, service_time, count, cost, custom]
  
  aggregation: enum [avg, sum, min, max, median, p95, count]
  unit: string
  
  # For custom metrics
  formula: string (PQL-like syntax)
  
  # Filters
  filter_conditions:
    activities: array
    case_attributes: object
    time_range:
      from: datetime
      to: datetime
  
  # Thresholds
  thresholds:
    target: float
    warning: float
    critical: float
  
  is_active: boolean
  
  # Current value (cached)
  current_value: float
  current_value_at: datetime
  trend: enum [up, down, stable]
```

#### Compute Request

```yaml
ComputeMetricRequest:
  time_range:
    from: datetime
    to: datetime
  
  granularity: enum [hour, day, week, month]
  
  dimensions: array (group by fields)
  
  store_result: boolean (default: true)
```

#### Metric Values Response

```yaml
MetricValues:
  metric_id: uuid
  metric_name: string
  
  time_range:
    from: datetime
    to: datetime
  
  values:
    - timestamp: datetime
      value: float
      sample_count: integer
      dimensions: object
  
  summary:
    current: float
    previous: float
    change_percentage: float
    trend: enum [up, down, stable]
    min: float
    max: float
    avg: float
```

---

### Feature 6.2: Bottleneck Analysis

**Resource:** `/api/v1/analytics/bottlenecks`

Identify process bottlenecks.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/bottlenecks/analyze` | Run bottleneck analysis |
| `GET` | `/bottlenecks` | List analyses |
| `GET` | `/bottlenecks/{id}` | Get analysis results |

#### Bottleneck Analysis Request

```yaml
BottleneckAnalysisRequest:
  event_log_id: uuid (required)
  name: string
  
  method: enum [sojourn_time, waiting_time, queue_length]
  
  options:
    time_range:
      from: datetime
      to: datetime
    
    # Group analysis by
    dimensions: array [activity, resource, variant]
    
    # Thresholds
    significance_threshold: float (percentage of total time)
```

#### Bottleneck Analysis Result

```yaml
BottleneckAnalysis:
  id: uuid
  event_log_id: uuid
  name: string
  analyzed_at: datetime
  method: string
  
  summary:
    total_flow_time_seconds: float
    total_waiting_time_seconds: float
    waiting_time_percentage: float
    
  bottlenecks:
    - rank: integer
      element_type: enum [activity, transition, resource]
      element_name: string
      
      metrics:
        avg_waiting_time_seconds: float
        max_waiting_time_seconds: float
        cases_affected: integer
        contribution_percentage: float
      
      context:
        preceding_activities: array
        following_activities: array
        peak_hours: array
  
  recommendations:
    - priority: enum [high, medium, low]
      bottleneck: string
      suggestion: string
      estimated_impact: string
```

---

### Feature 6.3: Social Network Analysis

**Resource:** `/api/v1/analytics/sna`

Organizational mining and social network analysis.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sna/analyze` | Run SNA |
| `GET` | `/sna` | List analyses |
| `GET` | `/sna/{id}` | Get analysis |
| `GET` | `/sna/{id}/graph` | Get network graph |

#### SNA Request

```yaml
SNARequest:
  event_log_id: uuid (required)
  name: string
  
  analysis_type: enum [handover, working_together, subcontracting, similar_activities]
  
  options:
    threshold: float (min edge weight)
    normalize: boolean
    time_range:
      from: datetime
      to: datetime
```

#### SNA Result

```yaml
SNAResult:
  id: uuid
  event_log_id: uuid
  name: string
  analysis_type: string
  analyzed_at: datetime
  
  network:
    nodes:
      - id: string (resource name)
        type: string (human/system)
        department: string
        metrics:
          degree_centrality: float
          betweenness_centrality: float
          event_count: integer
    
    edges:
      - source: string
        target: string
        weight: float
        type: string
  
  metrics:
    density: float
    avg_clustering: float
    diameter: integer
    
  communities:
    - id: integer
      members: array
      label: string
  
  key_actors:
    - resource: string
      role: string (hub, bridge, isolate)
      centrality_score: float
```

---

### Feature 6.4: Dashboards

**Resource:** `/api/v1/dashboards`

Custom dashboard management.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboards` | List dashboards |
| `POST` | `/dashboards` | Create dashboard |
| `GET` | `/dashboards/{id}` | Get dashboard |
| `PATCH` | `/dashboards/{id}` | Update dashboard |
| `DELETE` | `/dashboards/{id}` | Delete dashboard |
| `GET` | `/dashboards/{id}/data` | Get dashboard data |
| `POST` | `/dashboards/{id}/duplicate` | Duplicate dashboard |

#### Dashboard Object

```yaml
Dashboard:
  id: uuid
  name: string (required)
  description: string
  
  # Layout
  layout:
    columns: integer
    row_height: integer
  
  # Widgets
  widgets:
    - id: string
      type: enum [kpi_card, line_chart, bar_chart, pie_chart, table, process_map, heatmap, gauge]
      
      position:
        x: integer
        y: integer
        w: integer (width in columns)
        h: integer (height in rows)
      
      config:
        title: string
        
        # Data source
        source_type: enum [metric, query, model]
        source_id: uuid
        
        # Type-specific config
        ... (varies by widget type)
  
  # Global filters
  filters:
    - field: string
      operator: string
      value: any
      is_user_selectable: boolean
  
  refresh_interval_seconds: integer
  is_public: boolean
  
  created_at: datetime
  updated_at: datetime
```

#### Widget Types Configuration

```yaml
# KPI Card
KPICardConfig:
  metric_id: uuid
  show_trend: boolean
  show_sparkline: boolean
  comparison_period: enum [previous_period, previous_year]

# Line Chart
LineChartConfig:
  metric_ids: array
  time_range: object
  granularity: enum [hour, day, week, month]
  show_legend: boolean
  
# Process Map
ProcessMapConfig:
  model_id: uuid
  color_by: enum [frequency, performance, conformance]
  show_statistics: boolean
  highlight_bottlenecks: boolean

# Table
TableConfig:
  source: enum [cases, events, objects, custom_query]
  columns: array
  default_sort: string
  page_size: integer
```

---

## PHASE 7: ONTOLOGY & SEMANTICS

### Feature 7.1: Ontologies

**Resource:** `/api/v1/ontologies`

Manage OWL ontologies.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ontologies` | List ontologies |
| `POST` | `/ontologies` | Create/upload ontology |
| `GET` | `/ontologies/{id}` | Get ontology |
| `PATCH` | `/ontologies/{id}` | Update ontology |
| `DELETE` | `/ontologies/{id}` | Delete ontology |
| `GET` | `/ontologies/{id}/export` | Export ontology file |
| `POST` | `/ontologies/{id}/parse` | Parse and extract concepts |

#### Ontology Object

```yaml
Ontology:
  id: uuid
  name: string (required)
  version: string
  iri: string (required)
  description: string
  
  format: enum [owl/xml, turtle, rdf/xml, jsonld]
  
  # File reference
  file_path: string
  
  # Statistics
  statistics:
    class_count: integer
    object_property_count: integer
    data_property_count: integer
    individual_count: integer
  
  imported_iris: array
  
  is_active: boolean
  
  created_at: datetime
  updated_at: datetime
```

---

### Feature 7.2: Concepts

**Resource:** `/api/v1/ontologies/{ontology_id}/concepts`

Manage ontology concepts.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/concepts` | List concepts |
| `GET` | `/concepts/{id}` | Get concept |
| `GET` | `/concepts/{id}/hierarchy` | Get concept hierarchy |
| `GET` | `/concepts/{id}/related` | Get related concepts |
| `GET` | `/concepts/search` | Search concepts |
| `GET` | `/concepts/tree` | Get full concept tree |

#### Concept Object

```yaml
Concept:
  id: uuid
  ontology_id: uuid
  
  iri: string
  local_name: string
  label: string
  definition: string
  
  concept_type: enum [class, object_property, data_property, individual]
  
  # Hierarchy
  parent_concept_id: uuid
  parent_label: string
  children_count: integer
  depth: integer
  
  # For properties
  domain_concept_id: uuid
  range_concept_id: uuid
  
  metadata: object (OWL axioms)
  
  # Usage
  annotation_count: integer
  
  created_at: datetime
```

#### Concept Tree Response

```yaml
ConceptTree:
  roots:
    - id: uuid
      label: string
      concept_type: string
      children:
        - id: uuid
          label: string
          children: array (recursive)
```

---

### Feature 7.3: Annotations

**Resource:** `/api/v1/annotations`

Link entities to concepts.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/annotations` | List annotations |
| `POST` | `/annotations` | Create annotation |
| `DELETE` | `/annotations/{id}` | Delete annotation |
| `POST` | `/annotations/bulk` | Bulk create |
| `POST` | `/annotations/auto-annotate` | Auto-annotate using ML |
| `GET` | `/annotations/by-entity/{type}/{id}` | Get annotations for entity |
| `GET` | `/annotations/by-concept/{concept_id}` | Get entities for concept |

#### Annotation Object

```yaml
Annotation:
  id: uuid
  concept_id: uuid
  concept_label: string
  concept_iri: string
  
  entity_type: enum [activities, ocel_event_types, ocel_object_types, resources]
  entity_id: uuid
  entity_name: string
  
  confidence: float (0-1)
  annotation_type: enum [manual, automatic, inferred]
  
  reasoning_chain: object (for inferred)
  
  created_at: datetime
```

#### Auto-Annotate Request

```yaml
AutoAnnotateRequest:
  entity_type: string (required)
  ontology_id: uuid (required)
  
  options:
    method: enum [string_matching, embedding_similarity, llm]
    confidence_threshold: float
    overwrite_existing: boolean
```

---

### Feature 7.4: Semantic Queries

**Resource:** `/api/v1/semantic`

Query using ontological concepts.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/semantic/query` | Semantic query |
| `GET` | `/semantic/entity-types/{type}/by-concept/{concept_id}` | Find entities by concept |

#### Semantic Query Request

```yaml
SemanticQueryRequest:
  # Find activities/events/objects that are instances of concept (including subclasses)
  query_type: enum [instances_of, related_to, path_between]
  
  concept_id: uuid
  include_subclasses: boolean (default: true)
  
  target_entity_type: enum [activities, events, cases, objects]
  
  # Additional filters
  filters: object
```

#### Semantic Query Response

```yaml
SemanticQueryResult:
  query: object
  
  results:
    - entity_type: string
      entity_id: uuid
      entity_name: string
      matched_concept: string
      match_path: array (inheritance chain)
      confidence: float
```

---

## PHASE 8: AUTOMATION

### Feature 8.1: Action Rules

**Resource:** `/api/v1/automation/rules`

Define trigger conditions for automated actions.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/rules` | List rules |
| `POST` | `/rules` | Create rule |
| `GET` | `/rules/{id}` | Get rule |
| `PATCH` | `/rules/{id}` | Update rule |
| `DELETE` | `/rules/{id}` | Delete rule |
| `POST` | `/rules/{id}/test` | Test rule |
| `POST` | `/rules/{id}/enable` | Enable rule |
| `POST` | `/rules/{id}/disable` | Disable rule |
| `GET` | `/rules/{id}/history` | Trigger history |

#### Action Rule Object

```yaml
ActionRule:
  id: uuid
  name: string (required)
  description: string
  
  # Scope
  event_log_id: uuid
  data_pool_id: uuid
  
  # Rule type and condition
  rule_type: enum [pattern, threshold, anomaly, new_case, case_completed]
  
  condition:
    # Pattern rule
    pattern:
      sequence: array
      within_seconds: integer
    
    # Threshold rule
    threshold:
      metric_id: uuid
      operator: enum [gt, gte, lt, lte, eq]
      value: float
    
    # Anomaly rule
    anomaly:
      metric: string
      method: enum [z_score, iqr, isolation_forest]
      threshold: float
  
  # Actions to execute
  actions:
    - action_type: enum [webhook, email, log, create_task]
      configuration: object
  
  # Execution control
  is_active: boolean
  cooldown_seconds: integer
  
  # Statistics
  trigger_count: integer
  last_triggered_at: datetime
  
  created_at: datetime
  updated_at: datetime
```

#### Action Configurations

```yaml
# Webhook
WebhookAction:
  url: string (required)
  method: enum [GET, POST, PUT]
  headers: object
  body_template: object
  timeout_seconds: integer

# Email
EmailAction:
  to: array (required)
  cc: array
  subject_template: string
  body_template: string
  include_details: boolean

# Create Task
CreateTaskAction:
  title_template: string
  description_template: string
  priority: enum [low, medium, high]
  assignee: string
```

#### Test Rule Response

```yaml
TestRuleResult:
  would_trigger: boolean
  matching_items:
    - entity_type: string
      entity_id: uuid
      matched_at: datetime
      match_details: object
  evaluation_time_ms: integer
```

---

### Feature 8.2: Scheduled Jobs

**Resource:** `/api/v1/automation/schedules`

Manage scheduled executions.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/schedules` | List schedules |
| `POST` | `/schedules` | Create schedule |
| `GET` | `/schedules/{id}` | Get schedule |
| `PATCH` | `/schedules/{id}` | Update schedule |
| `DELETE` | `/schedules/{id}` | Delete schedule |
| `POST` | `/schedules/{id}/run-now` | Trigger immediately |
| `GET` | `/schedules/{id}/runs` | Execution history |

#### Scheduled Job Object

```yaml
ScheduledJob:
  id: uuid
  name: string (required)
  
  job_type: enum [import, discovery, conformance, metric_compute, statistics_refresh]
  
  target_id: uuid
  target_type: string
  
  # Schedule
  cron_expression: string (required)
  timezone: string (default: UTC)
  
  # Configuration
  configuration: object (job-specific)
  
  is_active: boolean
  
  # Status
  next_run_at: datetime
  last_run_at: datetime
  last_status: enum [success, failed, running]
  
  created_at: datetime
```

#### Cron Expression Examples

| Expression | Description |
|------------|-------------|
| `0 0 * * *` | Daily at midnight |
| `0 */6 * * *` | Every 6 hours |
| `0 0 * * 1` | Weekly on Monday |
| `0 0 1 * *` | Monthly on 1st |
| `*/15 * * * *` | Every 15 minutes |

---

### Feature 8.3: Execution History

**Resource:** `/api/v1/automation/executions`

Track automation execution history.

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/executions` | List executions |
| `GET` | `/executions/{id}` | Get execution details |
| `GET` | `/executions/statistics` | Execution statistics |

#### Execution Record

```yaml
Execution:
  id: uuid
  
  source_type: enum [rule, schedule, manual, api]
  source_id: uuid
  source_name: string
  
  status: enum [pending, running, success, failed, skipped]
  
  started_at: datetime
  completed_at: datetime
  duration_ms: integer
  
  trigger_context: object
  
  result:
    actions_executed: integer
    actions_succeeded: integer
    actions_failed: integer
    details: array
  
  error_message: string
```

---

# PART 3: APPENDICES

## Appendix A: Common Query Patterns

### Filtering Examples

```
# Cases with duration > 24 hours
GET /event-logs/{id}/cases?filter[duration_seconds][gte]=86400

# Events for specific activities
GET /event-logs/{id}/events?filter[activity_name][in]=Approve,Reject

# Cases with specific attribute
GET /event-logs/{id}/cases?filter[attributes.customer_type]=enterprise

# Events in time range
GET /event-logs/{id}/events?filter[timestamp][gte]=2024-01-01T00:00:00Z&filter[timestamp][lte]=2024-01-31T23:59:59Z
```

### Sorting Examples

```
# Cases by duration descending
GET /event-logs/{id}/cases?sort=duration_seconds:desc

# Activities by frequency
GET /event-logs/{id}/activities?sort=occurrence_count:desc

# Multiple sort
GET /event-logs/{id}/events?sort=case_id:asc,timestamp:asc
```

### Pagination Examples

```
# Offset pagination
GET /event-logs/{id}/cases?page=2&per_page=50

# Cursor pagination (for large datasets)
GET /event-logs/{id}/events?cursor=eyJpZCI6IjEyMyJ9&limit=100
```

---

## Appendix B: Webhook Payload Templates

### Case Completed Webhook

```json
{
  "event_type": "case.completed",
  "timestamp": "{{timestamp}}",
  "data": {
    "case_id": "{{case.id}}",
    "case_identifier": "{{case.case_id}}",
    "event_log_id": "{{case.event_log_id}}",
    "duration_seconds": "{{case.duration_seconds}}",
    "event_count": "{{case.event_count}}",
    "variant_id": "{{case.variant_id}}",
    "attributes": "{{case.attributes}}"
  }
}
```

### Threshold Breach Webhook

```json
{
  "event_type": "threshold.breach",
  "timestamp": "{{timestamp}}",
  "data": {
    "rule_id": "{{rule.id}}",
    "rule_name": "{{rule.name}}",
    "metric_name": "{{metric.name}}",
    "threshold_value": "{{rule.threshold}}",
    "actual_value": "{{trigger.value}}",
    "severity": "{{trigger.severity}}"
  }
}
```

---

## Appendix C: File Format Specifications

### CSV Import Requirements

| Requirement | Specification |
|-------------|---------------|
| Encoding | UTF-8 (with or without BOM) |
| Delimiter | Comma (,), Semicolon (;), Tab (\t) - auto-detected |
| Header | Required (first row) |
| Quoting | Double quotes for values containing delimiter |
| Date Format | ISO 8601, or specify in mapping |
| Null Values | Empty string or "NULL" |

### XES Compliance

- XES 2.0 standard
- Gzip compression supported (.xes.gz)
- Extensions: concept, time, lifecycle, org, cost

### OCEL 2.0 Compliance

- JSON format per IEEE standard
- Required fields: ocel:events, ocel:objects
- Optional: ocel:eventTypes, ocel:objectTypes

---

## Appendix D: Development Checklist

### Phase 1 Deliverables
- [ ] Data pool CRUD
- [ ] File upload with validation
- [ ] Import job configuration
- [ ] Import execution with progress
- [ ] Event log management
- [ ] Basic statistics computation

### Phase 2 Deliverables
- [ ] Case listing with filters
- [ ] Event listing with filters
- [ ] Activity management
- [ ] Resource management
- [ ] Variant detection and listing
- [ ] DFG generation

### Phase 3 Deliverables
- [ ] OCEL object type management
- [ ] OCEL event type management
- [ ] OCEL object CRUD
- [ ] OCEL event CRUD
- [ ] E2O relationship management
- [ ] O2O relationship management
- [ ] OCEL import/export

### Phase 4 Deliverables
- [ ] Alpha miner integration
- [ ] Heuristics miner integration
- [ ] Inductive miner integration
- [ ] DFG discovery
- [ ] Model storage
- [ ] Model visualization
- [ ] Model export (PNML, BPMN)

### Phase 5 Deliverables
- [ ] Token replay implementation
- [ ] Alignment computation
- [ ] Deviation detection
- [ ] Quality metrics computation
- [ ] Conformance job management

### Phase 6 Deliverables
- [ ] Metric definition
- [ ] Metric computation
- [ ] Time-series storage
- [ ] Bottleneck analysis
- [ ] SNA implementation
- [ ] Dashboard management

### Phase 7 Deliverables
- [ ] Ontology upload/management
- [ ] Concept extraction
- [ ] Annotation management
- [ ] Semantic queries

### Phase 8 Deliverables
- [ ] Rule engine
- [ ] Action execution
- [ ] Scheduled jobs
- [ ] Execution logging

---

## Appendix E: pm4py Integration Points

| API Endpoint | pm4py Function |
|--------------|----------------|
| `GET /event-logs/{id}/export?format=xes` | `pm4py.write_xes()` |
| `POST /discovery/run` (alpha) | `pm4py.discover_petri_net_alpha()` |
| `POST /discovery/run` (heuristics) | `pm4py.discover_petri_net_heuristics()` |
| `POST /discovery/run` (inductive) | `pm4py.discover_petri_net_inductive()` |
| `POST /conformance/run` (replay) | `pm4py.conformance_diagnostics_token_based_replay()` |
| `POST /conformance/run` (alignment) | `pm4py.conformance_diagnostics_alignments()` |
| `GET /event-logs/{id}/events/dfg` | `pm4py.discover_dfg()` |
| `GET /analytics/sna/analyze` (handover) | `pm4py.discover_handover_of_work()` |
| `GET /event-logs/{id}/cases` | Maps to `pm4py.objects.log.obj.EventLog` |

---

*End of API Specification*
