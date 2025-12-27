-- ============================================================================
-- UNIFIED PROCESS INTELLIGENCE PLATFORM SCHEMA
-- ============================================================================
-- Single consolidated SQLite schema for local development
-- Features:
-- - Multi-tenant support with minimal auth
-- - OCEL 2.0 compliant object-centric process mining
-- - Case-centric process mining (XES compatible)
-- - Semantic layer (Knowledge Models, KPIs, Filters)
-- - Studio UI layer (Spaces, Packages, Views, Components)
-- - Automation layer (Action Flows, Sensors, Skills, Signals, Tasks)
-- 
-- Total: 46 tables across 7 sections
-- ============================================================================

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================================================
-- SECTION 0: MINIMAL IDENTITY (3 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: tenants
-- Purpose: Root organizational boundary (simplified for dev)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated')),
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'professional', 'enterprise')),
    settings TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);

-- -----------------------------------------------------------------------------
-- Table: users
-- Purpose: System users (simplified for dev - no password/MFA)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    email TEXT NOT NULL,
    display_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deactivated')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, email)
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- -----------------------------------------------------------------------------
-- Table: api_keys
-- Purpose: API authentication for testing
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    expires_at TEXT,
    last_used_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- ============================================================================
-- SECTION 1: CORE INFRASTRUCTURE (4 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: data_pools
-- Purpose: Container for related data sources and event logs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_pools (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    pool_type TEXT NOT NULL CHECK (pool_type IN ('case_centric', 'ocel', 'hybrid')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'error')),
    schema_version INTEGER DEFAULT 1,
    statistics TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, name)
);

CREATE INDEX idx_data_pools_tenant ON data_pools(tenant_id, status);

-- -----------------------------------------------------------------------------
-- Table: data_connections
-- Purpose: External system integration configurations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_connections (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_pool_id TEXT,
    name TEXT NOT NULL,
    connector_type TEXT NOT NULL,
    connection_config TEXT NOT NULL,  -- JSON (encrypted fields)
    extraction_config TEXT DEFAULT '{}',  -- JSON
    status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
    last_tested_at TEXT,
    last_sync_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE SET NULL
);

CREATE INDEX idx_data_connections_tenant ON data_connections(tenant_id, connector_type);
CREATE INDEX idx_data_connections_pool ON data_connections(data_pool_id);

-- -----------------------------------------------------------------------------
-- Table: import_jobs
-- Purpose: ETL job definitions for data extraction and transformation
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_jobs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_pool_id TEXT NOT NULL,
    connection_id TEXT,
    name TEXT NOT NULL,
    job_type TEXT NOT NULL CHECK (job_type IN ('extraction', 'transformation', 'full_load', 'incremental', 'file_import', 'database_extract')),
    source_query TEXT,
    mapping_config TEXT NOT NULL,  -- JSON
    schedule_cron TEXT,
    is_active INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE CASCADE,
    FOREIGN KEY (connection_id) REFERENCES data_connections(id) ON DELETE SET NULL
);

CREATE INDEX idx_import_jobs_pool ON import_jobs(data_pool_id, is_active);

-- -----------------------------------------------------------------------------
-- Table: import_job_runs
-- Purpose: Execution history for import jobs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_job_runs (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'success', 'failed', 'cancelled')),
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    rows_read INTEGER DEFAULT 0,
    rows_written INTEGER DEFAULT 0,
    events_created INTEGER DEFAULT 0,
    cases_created INTEGER DEFAULT 0,
    objects_created INTEGER DEFAULT 0,
    error_message TEXT,
    error_details TEXT,  -- JSON
    metrics TEXT DEFAULT '{}',  -- JSON
    FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_import_job_runs_job ON import_job_runs(job_id, started_at DESC);
CREATE INDEX idx_import_job_runs_status ON import_job_runs(tenant_id, status);

-- ============================================================================
-- SECTION 2: CASE-CENTRIC PROCESS MINING (6 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: event_logs
-- Purpose: Event log definitions for case-centric mining
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_logs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_pool_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    case_notion TEXT NOT NULL,
    activity_key TEXT DEFAULT 'concept:name',
    timestamp_key TEXT DEFAULT 'time:timestamp',
    resource_key TEXT DEFAULT 'org:resource',
    case_attributes TEXT DEFAULT '[]',  -- JSON array
    event_attributes TEXT DEFAULT '[]',  -- JSON array
    classifiers TEXT DEFAULT '{}',  -- JSON
    extensions TEXT DEFAULT '{}',  -- JSON
    global_attributes TEXT DEFAULT '{}',  -- JSON
    statistics TEXT DEFAULT '{}',  -- JSON
    source_file_path TEXT,
    source_file_format TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, name)
);

CREATE INDEX idx_event_logs_pool ON event_logs(data_pool_id);

-- -----------------------------------------------------------------------------
-- Table: activities
-- Purpose: Activity type catalog and metadata
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    event_log_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    category TEXT,
    is_automated INTEGER DEFAULT 0,
    avg_duration_seconds INTEGER,
    avg_cost REAL,
    occurrence_count INTEGER DEFAULT 0,
    icon TEXT,
    color TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_log_id) REFERENCES event_logs(id) ON DELETE CASCADE,
    UNIQUE (event_log_id, name)
);

CREATE INDEX idx_activities_category ON activities(event_log_id, category);

-- -----------------------------------------------------------------------------
-- Table: resources
-- Purpose: Performers and organizational entities
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    event_log_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    resource_type TEXT DEFAULT 'human' CHECK (resource_type IN ('human', 'system', 'bot')),
    department TEXT,
    role TEXT,
    email TEXT,
    event_count INTEGER DEFAULT 0,
    distinct_activities INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_log_id) REFERENCES event_logs(id) ON DELETE CASCADE,
    UNIQUE (event_log_id, name)
);

CREATE INDEX idx_resources_department ON resources(event_log_id, department);
CREATE INDEX idx_resources_role ON resources(event_log_id, role);

-- -----------------------------------------------------------------------------
-- Table: variants
-- Purpose: Unique process execution patterns (activity sequences)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS variants (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    event_log_id TEXT NOT NULL,
    sequence TEXT NOT NULL,  -- JSON array of activity names
    sequence_hash TEXT NOT NULL,
    case_count INTEGER DEFAULT 0,
    percentage REAL,
    avg_duration_seconds INTEGER,
    min_duration_seconds INTEGER,
    max_duration_seconds INTEGER,
    is_happy_path INTEGER DEFAULT 0,
    first_seen_at TEXT,
    last_seen_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_log_id) REFERENCES event_logs(id) ON DELETE CASCADE,
    UNIQUE (event_log_id, sequence_hash)
);

CREATE INDEX idx_variants_frequency ON variants(event_log_id, case_count DESC);

-- -----------------------------------------------------------------------------
-- Table: cases
-- Purpose: Process instances (traces) in case-centric model
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    event_log_id TEXT NOT NULL,
    case_id TEXT NOT NULL,  -- Business case identifier
    variant_id TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration_seconds INTEGER,
    event_count INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('open', 'completed', 'cancelled')),
    attributes TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_log_id) REFERENCES event_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES variants(id) ON DELETE SET NULL,
    UNIQUE (event_log_id, case_id)
);

CREATE INDEX idx_cases_variant ON cases(event_log_id, variant_id);
CREATE INDEX idx_cases_duration ON cases(event_log_id, duration_seconds DESC);
CREATE INDEX idx_cases_status ON cases(event_log_id, status, start_time DESC);

-- -----------------------------------------------------------------------------
-- Table: events
-- Purpose: Individual activity occurrences
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    event_log_id TEXT NOT NULL,
    case_id TEXT NOT NULL,
    activity_id TEXT,
    activity_name TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    sort_key INTEGER DEFAULT 0,
    resource_id TEXT,
    resource_name TEXT,
    lifecycle TEXT DEFAULT 'complete' CHECK (lifecycle IN ('start', 'complete', 'suspend', 'resume', 'abort')),
    cost REAL,
    attributes TEXT DEFAULT '{}',  -- JSON
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_log_id) REFERENCES event_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE SET NULL
);

CREATE INDEX idx_events_case_time ON events(case_id, timestamp, sort_key);
CREATE INDEX idx_events_log_time ON events(event_log_id, timestamp DESC);
CREATE INDEX idx_events_activity ON events(event_log_id, activity_name, timestamp DESC);
CREATE INDEX idx_events_resource ON events(event_log_id, resource_id, timestamp DESC);

-- ============================================================================
-- SECTION 3: OCEL 2.0 (7 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: ocel_event_types
-- Purpose: Event type definitions with attribute schemas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ocel_event_types (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_pool_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    attribute_schema TEXT NOT NULL DEFAULT '{"attributes":[]}',  -- JSON
    description TEXT,
    category TEXT,
    color TEXT,
    occurrence_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE CASCADE,
    UNIQUE (data_pool_id, name)
);

-- -----------------------------------------------------------------------------
-- Table: ocel_object_types
-- Purpose: Object type definitions with attribute schemas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ocel_object_types (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_pool_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    attribute_schema TEXT NOT NULL DEFAULT '{"attributes":[]}',  -- JSON
    description TEXT,
    icon TEXT,
    color TEXT,
    object_count INTEGER DEFAULT 0,
    is_process_object INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE CASCADE,
    UNIQUE (data_pool_id, name)
);

-- -----------------------------------------------------------------------------
-- Table: ocel_events
-- Purpose: Event instances in OCEL format
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ocel_events (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_pool_id TEXT NOT NULL,
    ocel_id TEXT NOT NULL,
    event_type_id TEXT NOT NULL,
    event_type_name TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    attributes TEXT DEFAULT '{}',  -- JSON
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE CASCADE,
    FOREIGN KEY (event_type_id) REFERENCES ocel_event_types(id) ON DELETE CASCADE,
    UNIQUE (data_pool_id, ocel_id)
);

CREATE INDEX idx_ocel_events_type_time ON ocel_events(data_pool_id, event_type_id, timestamp DESC);
CREATE INDEX idx_ocel_events_time ON ocel_events(data_pool_id, timestamp DESC);

-- -----------------------------------------------------------------------------
-- Table: ocel_objects
-- Purpose: Object instances in OCEL format
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ocel_objects (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_pool_id TEXT NOT NULL,
    ocel_id TEXT NOT NULL,
    object_type_id TEXT NOT NULL,
    object_type_name TEXT NOT NULL,
    attributes TEXT DEFAULT '{}',  -- JSON (current values)
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE CASCADE,
    FOREIGN KEY (object_type_id) REFERENCES ocel_object_types(id) ON DELETE CASCADE,
    UNIQUE (data_pool_id, ocel_id)
);

CREATE INDEX idx_ocel_objects_type ON ocel_objects(data_pool_id, object_type_id);

-- -----------------------------------------------------------------------------
-- Table: ocel_e2o
-- Purpose: Event-to-Object relationships (core of OCEL)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ocel_e2o (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_pool_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    object_id TEXT NOT NULL,
    qualifier TEXT,
    qualifier_value TEXT,  -- JSON
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES ocel_events(id) ON DELETE CASCADE,
    FOREIGN KEY (object_id) REFERENCES ocel_objects(id) ON DELETE CASCADE,
    UNIQUE (event_id, object_id, qualifier)
);

CREATE INDEX idx_ocel_e2o_event ON ocel_e2o(event_id);
CREATE INDEX idx_ocel_e2o_object ON ocel_e2o(object_id);

-- -----------------------------------------------------------------------------
-- Table: ocel_o2o
-- Purpose: Object-to-Object relationships
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ocel_o2o (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_pool_id TEXT NOT NULL,
    source_object_id TEXT NOT NULL,
    target_object_id TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    attributes TEXT DEFAULT '{}',  -- JSON
    valid_from TEXT,
    valid_to TEXT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (source_object_id) REFERENCES ocel_objects(id) ON DELETE CASCADE,
    FOREIGN KEY (target_object_id) REFERENCES ocel_objects(id) ON DELETE CASCADE
);

CREATE INDEX idx_ocel_o2o_source ON ocel_o2o(source_object_id, relationship_type);
CREATE INDEX idx_ocel_o2o_target ON ocel_o2o(target_object_id, relationship_type);
CREATE INDEX idx_ocel_o2o_type ON ocel_o2o(data_pool_id, relationship_type);

-- -----------------------------------------------------------------------------
-- Table: ocel_object_changes
-- Purpose: Tracks attribute value changes over time (OCEL 2.0 feature)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ocel_object_changes (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    object_id TEXT NOT NULL,
    event_id TEXT,
    attribute_name TEXT NOT NULL,
    old_value TEXT,  -- JSON
    new_value TEXT NOT NULL,  -- JSON
    changed_at TEXT NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (object_id) REFERENCES ocel_objects(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES ocel_events(id) ON DELETE SET NULL
);

CREATE INDEX idx_ocel_object_changes_object ON ocel_object_changes(object_id, changed_at DESC);
CREATE INDEX idx_ocel_object_changes_event ON ocel_object_changes(event_id);

-- ============================================================================
-- SECTION 4: SEMANTIC LAYER (9 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: knowledge_models
-- Purpose: Semantic layer containing KPIs, Records, Filters
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_models (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    data_model_id TEXT NOT NULL,
    km_type TEXT NOT NULL DEFAULT 'base' CHECK (km_type IN ('base', 'extension')),
    extends_km_id TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    version INTEGER DEFAULT 1,
    yaml_content TEXT,
    published_at TEXT,
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (extends_km_id) REFERENCES knowledge_models(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, package_id, key)
);

CREATE INDEX idx_knowledge_models_package ON knowledge_models(package_id);

-- -----------------------------------------------------------------------------
-- Table: kpis
-- Purpose: Calculated metric with PQL formula
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kpis (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    knowledge_model_id TEXT NOT NULL,
    key TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    pql_expression TEXT NOT NULL,
    return_type TEXT NOT NULL DEFAULT 'number' CHECK (return_type IN ('number', 'string', 'date', 'boolean', 'array')),
    format_string TEXT,
    unit TEXT,
    unit_position TEXT DEFAULT 'suffix' CHECK (unit_position IN ('prefix', 'suffix')),
    aggregation_type TEXT DEFAULT 'sum' CHECK (aggregation_type IN ('sum', 'avg', 'min', 'max', 'count', 'count_distinct', 'custom')),
    is_global INTEGER DEFAULT 0,
    category TEXT,
    parameters TEXT DEFAULT '[]',  -- JSON
    thresholds TEXT DEFAULT '[]',  -- JSON
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (knowledge_model_id) REFERENCES knowledge_models(id) ON DELETE CASCADE,
    UNIQUE (knowledge_model_id, key)
);

CREATE INDEX idx_kpis_km ON kpis(knowledge_model_id);
CREATE INDEX idx_kpis_category ON kpis(knowledge_model_id, category);

-- -----------------------------------------------------------------------------
-- Table: records
-- Purpose: Abstraction of Data Model table with attributes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    knowledge_model_id TEXT NOT NULL,
    key TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    base_table TEXT NOT NULL,
    identifier_attribute TEXT,
    default_sort_attribute TEXT,
    default_sort_order TEXT DEFAULT 'asc' CHECK (default_sort_order IN ('asc', 'desc')),
    icon TEXT,
    color TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (knowledge_model_id) REFERENCES knowledge_models(id) ON DELETE CASCADE,
    UNIQUE (knowledge_model_id, key)
);

CREATE INDEX idx_records_km ON records(knowledge_model_id);

-- -----------------------------------------------------------------------------
-- Table: record_attributes
-- Purpose: Column mapping within a Record
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS record_attributes (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    record_id TEXT NOT NULL,
    key TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    attribute_type TEXT NOT NULL DEFAULT 'column' CHECK (attribute_type IN ('column', 'calculated', 'augmented')),
    source_column TEXT,
    pql_expression TEXT,
    data_type TEXT NOT NULL CHECK (data_type IN ('string', 'number', 'date', 'boolean', 'array')),
    format_string TEXT,
    is_identifier INTEGER DEFAULT 0,
    is_filterable INTEGER DEFAULT 1,
    is_sortable INTEGER DEFAULT 1,
    ordinal_position INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE,
    UNIQUE (record_id, key)
);

CREATE INDEX idx_record_attributes_record ON record_attributes(record_id);
CREATE INDEX idx_record_attributes_order ON record_attributes(record_id, ordinal_position);

-- -----------------------------------------------------------------------------
-- Table: filters
-- Purpose: Reusable PQL-based filter condition
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS filters (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    knowledge_model_id TEXT NOT NULL,
    key TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    pql_expression TEXT NOT NULL,
    base_table TEXT,
    filter_type TEXT NOT NULL DEFAULT 'standard' CHECK (filter_type IN ('standard', 'process', 'forced')),
    category TEXT,
    is_default INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (knowledge_model_id) REFERENCES knowledge_models(id) ON DELETE CASCADE,
    UNIQUE (knowledge_model_id, key)
);

CREATE INDEX idx_filters_km ON filters(knowledge_model_id);

-- -----------------------------------------------------------------------------
-- Table: variables
-- Purpose: Stored value referenced across components
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS variables (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    scope_type TEXT NOT NULL CHECK (scope_type IN ('knowledge_model', 'view', 'package')),
    scope_id TEXT NOT NULL,
    key TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    data_type TEXT NOT NULL CHECK (data_type IN ('string', 'number', 'date', 'boolean', 'array', 'object')),
    default_value TEXT,  -- JSON
    current_value TEXT,  -- JSON
    validation_pql TEXT,
    is_required INTEGER DEFAULT 0,
    is_user_editable INTEGER DEFAULT 1,
    ui_component TEXT DEFAULT 'input_box' CHECK (ui_component IN ('input_box', 'dropdown', 'date_picker', 'checkbox', 'slider')),
    options_pql TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (scope_type, scope_id, key)
);

CREATE INDEX idx_variables_scope ON variables(scope_type, scope_id);

-- -----------------------------------------------------------------------------
-- Table: event_log_configs
-- Purpose: Configuration mapping data to process mining format
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_log_configs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    knowledge_model_id TEXT NOT NULL,
    key TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    activity_table TEXT NOT NULL,
    case_id_column TEXT NOT NULL,
    activity_column TEXT NOT NULL,
    timestamp_column TEXT NOT NULL,
    sorting_column TEXT,
    resource_column TEXT,
    cost_column TEXT,
    included_activities TEXT DEFAULT '[]',  -- JSON array
    excluded_activities TEXT DEFAULT '[]',  -- JSON array
    filter_expression TEXT,
    is_default INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (knowledge_model_id) REFERENCES knowledge_models(id) ON DELETE CASCADE,
    UNIQUE (knowledge_model_id, key)
);

CREATE INDEX idx_event_log_configs_km ON event_log_configs(knowledge_model_id);

-- -----------------------------------------------------------------------------
-- Table: augmented_attributes
-- Purpose: User-editable field definitions stored alongside process data
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS augmented_attributes (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    record_id TEXT NOT NULL,
    key TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    data_type TEXT NOT NULL CHECK (data_type IN ('string', 'number', 'date', 'boolean', 'enum')),
    possible_values TEXT,  -- JSON array for enum type
    default_value TEXT,  -- JSON
    is_required INTEGER DEFAULT 0,
    is_multi_value INTEGER DEFAULT 0,
    validation_regex TEXT,
    ordinal_position INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE,
    UNIQUE (record_id, key)
);

CREATE INDEX idx_augmented_attributes_record ON augmented_attributes(record_id);

-- -----------------------------------------------------------------------------
-- Table: augmented_attribute_values
-- Purpose: Stored value for augmented attribute on specific record
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS augmented_attribute_values (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    augmented_attribute_id TEXT NOT NULL,
    record_key TEXT NOT NULL,  -- Identifier of the record instance
    value TEXT NOT NULL,  -- JSON
    updated_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (augmented_attribute_id) REFERENCES augmented_attributes(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (augmented_attribute_id, record_key)
);

CREATE INDEX idx_augmented_attribute_values_attr ON augmented_attribute_values(augmented_attribute_id);
CREATE INDEX idx_augmented_attribute_values_updated ON augmented_attribute_values(tenant_id, updated_at);

-- ============================================================================
-- SECTION 5: STUDIO UI (5 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: spaces
-- Purpose: Organizational container for packages
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spaces (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'folder',
    color TEXT DEFAULT '#1890ff',
    is_default INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    sort_order INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, name)
);

CREATE INDEX idx_spaces_tenant ON spaces(tenant_id);
CREATE INDEX idx_spaces_order ON spaces(tenant_id, sort_order);

-- -----------------------------------------------------------------------------
-- Table: packages
-- Purpose: Container for Studio assets (Views, KMs, Action Flows)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    space_id TEXT NOT NULL,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'box',
    color TEXT DEFAULT '#1890ff',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    version TEXT DEFAULT '1.0.0',
    is_template INTEGER NOT NULL DEFAULT 0,
    source_package_id TEXT,
    data_model_variable_id TEXT,
    published_at TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE,
    FOREIGN KEY (source_package_id) REFERENCES packages(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, key)
);

CREATE INDEX idx_packages_space ON packages(space_id);
CREATE INDEX idx_packages_status ON packages(tenant_id, space_id, status);

-- -----------------------------------------------------------------------------
-- Table: views
-- Purpose: Interactive dashboard/application
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS views (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    knowledge_model_id TEXT NOT NULL,
    base_view_id TEXT,
    view_type TEXT NOT NULL DEFAULT 'standard' CHECK (view_type IN ('standard', 'profile', 'extension')),
    layout_mode TEXT NOT NULL DEFAULT 'scale_to_fit' CHECK (layout_mode IN ('scale_to_fit', 'custom_height')),
    layout_config TEXT DEFAULT '{}',  -- JSON: Grid layout configuration
    icon TEXT DEFAULT 'layout',
    thumbnail_url TEXT,
    is_home INTEGER NOT NULL DEFAULT 0,
    is_published_to_apps INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    version INTEGER NOT NULL DEFAULT 1,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (knowledge_model_id) REFERENCES knowledge_models(id) ON DELETE RESTRICT,
    FOREIGN KEY (base_view_id) REFERENCES views(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (package_id, key)
);

CREATE INDEX idx_views_package ON views(package_id);
CREATE INDEX idx_views_km ON views(knowledge_model_id);
CREATE INDEX idx_views_order ON views(package_id, sort_order);

-- -----------------------------------------------------------------------------
-- Table: components
-- Purpose: UI component within a View
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS components (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    view_id TEXT NOT NULL,
    parent_id TEXT,
    component_type TEXT NOT NULL CHECK (component_type IN (
        'chart', 'table', 'kpi_list', 'process_explorer', 'variant_explorer',
        'text', 'button', 'input', 'filter_bar', 'tab', 'container',
        'action_button', 'image', 'custom'
    )),
    key TEXT NOT NULL,
    title TEXT,
    description TEXT,
    layout_position TEXT NOT NULL,  -- JSON: x, y, width, height
    data_config TEXT DEFAULT '{}',  -- JSON: PQL queries, record refs
    visual_config TEXT DEFAULT '{}',  -- JSON: Colors, formats, etc.
    interaction_config TEXT DEFAULT '{}',  -- JSON: Filters, selections, links
    is_visible INTEGER NOT NULL DEFAULT 1,
    visibility_expression TEXT,
    sort_order INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (view_id) REFERENCES views(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES components(id) ON DELETE CASCADE,
    UNIQUE (view_id, key)
);

CREATE INDEX idx_components_view ON components(view_id);
CREATE INDEX idx_components_parent ON components(view_id, parent_id, sort_order);

-- -----------------------------------------------------------------------------
-- Table: view_tabs
-- Purpose: Tab container within a View
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS view_tabs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    view_id TEXT NOT NULL,
    key TEXT NOT NULL,
    title TEXT NOT NULL,
    icon TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL,
    visibility_expression TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (view_id) REFERENCES views(id) ON DELETE CASCADE,
    UNIQUE (view_id, key)
);

CREATE INDEX idx_view_tabs_view ON view_tabs(view_id, sort_order);

-- ============================================================================
-- SECTION 6: AUTOMATION (12 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: action_flows
-- Purpose: Visual automation workflow
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS action_flows (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'scheduled', 'event', 'webhook', 'sensor')),
    schedule_id TEXT,
    webhook_id TEXT,
    sensor_id TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'deactivated')),
    consecutive_error_limit INTEGER DEFAULT 3,
    consecutive_error_count INTEGER DEFAULT 0,
    is_data_confidential INTEGER NOT NULL DEFAULT 0,
    timeout_seconds INTEGER DEFAULT 3600,
    max_cycles INTEGER DEFAULT 1,
    auto_commit INTEGER NOT NULL DEFAULT 1,
    sequential_processing INTEGER NOT NULL DEFAULT 0,
    incomplete_executions_enabled INTEGER NOT NULL DEFAULT 0,
    blueprint TEXT NOT NULL,  -- JSON: Module graph definition
    inputs TEXT DEFAULT '[]',  -- JSON
    outputs TEXT DEFAULT '[]',  -- JSON
    last_executed_at TEXT,
    last_execution_status TEXT CHECK (last_execution_status IN ('success', 'warning', 'error')),
    activated_at TEXT,
    deactivated_at TEXT,
    deactivation_reason TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (package_id, key)
);

CREATE INDEX idx_action_flows_package ON action_flows(package_id);
CREATE INDEX idx_action_flows_status ON action_flows(tenant_id, status);
CREATE INDEX idx_action_flows_trigger ON action_flows(tenant_id, trigger_type, status);

-- -----------------------------------------------------------------------------
-- Table: action_flow_modules
-- Purpose: Individual processing step in Action Flow
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS action_flow_modules (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    action_flow_id TEXT NOT NULL,
    parent_module_id TEXT,
    module_type TEXT NOT NULL CHECK (module_type IN ('trigger', 'action', 'transformer', 'aggregator', 'router', 'error_handler', 'iterator', 'repeater')),
    app_name TEXT NOT NULL,
    action_name TEXT NOT NULL,
    connection_id TEXT,
    position INTEGER NOT NULL,
    configuration TEXT NOT NULL,  -- JSON
    input_mapping TEXT DEFAULT '{}',  -- JSON
    output_mapping TEXT DEFAULT '{}',  -- JSON
    error_handler_type TEXT CHECK (error_handler_type IN ('break', 'resume', 'rollback', 'ignore', 'commit')),
    is_acid INTEGER NOT NULL DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (action_flow_id) REFERENCES action_flows(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_module_id) REFERENCES action_flow_modules(id) ON DELETE SET NULL
);

CREATE INDEX idx_action_flow_modules_flow ON action_flow_modules(action_flow_id, position);

-- -----------------------------------------------------------------------------
-- Table: connections
-- Purpose: Authentication link to external systems for Action Flows
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    package_id TEXT,
    name TEXT NOT NULL,
    app_name TEXT NOT NULL,
    connection_type TEXT NOT NULL CHECK (connection_type IN ('oauth2', 'api_key', 'basic', 'celonis_user', 'celonis_app_key', 'custom')),
    credentials TEXT NOT NULL,  -- JSON (encrypted)
    oauth_credentials_id TEXT,
    status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'invalid', 'expired', 'revoked')),
    is_dynamic INTEGER NOT NULL DEFAULT 0,
    last_used_at TEXT,
    last_tested_at TEXT,
    expires_at TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_connections_tenant_app ON connections(tenant_id, app_name);
CREATE INDEX idx_connections_package ON connections(tenant_id, package_id, name);

-- -----------------------------------------------------------------------------
-- Table: webhooks
-- Purpose: HTTP endpoint for receiving external triggers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhooks (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    action_flow_id TEXT NOT NULL,
    udid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    secret TEXT,
    connection_id TEXT,
    data_structure TEXT,  -- JSON: Expected payload schema
    get_request_headers INTEGER NOT NULL DEFAULT 0,
    get_http_method INTEGER NOT NULL DEFAULT 0,
    json_passthrough INTEGER NOT NULL DEFAULT 0,
    ip_allowlist TEXT DEFAULT '[]',  -- JSON array
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    queue_size INTEGER DEFAULT 0,
    max_queue_size INTEGER DEFAULT 10000,
    last_called_at TEXT,
    expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (action_flow_id) REFERENCES action_flows(id) ON DELETE CASCADE,
    FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE SET NULL
);

CREATE INDEX idx_webhooks_udid ON webhooks(udid);
CREATE INDEX idx_webhooks_tenant_status ON webhooks(tenant_id, status);

-- -----------------------------------------------------------------------------
-- Table: webhook_queues
-- Purpose: Buffered webhook requests awaiting processing
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_queues (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    webhook_id TEXT NOT NULL,
    payload TEXT NOT NULL,  -- JSON
    headers TEXT DEFAULT '{}',  -- JSON
    http_method TEXT DEFAULT 'POST',
    source_ip TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
    processed_at TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
);

CREATE INDEX idx_webhook_queues_webhook ON webhook_queues(webhook_id, status, created_at);

-- -----------------------------------------------------------------------------
-- Table: sensors
-- Purpose: Detector that identifies data conditions and creates Signals
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sensors (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    knowledge_model_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sensor_type TEXT NOT NULL CHECK (sensor_type IN ('record_based', 'data_model_based', 'ml_based')),
    record_id TEXT,
    filter_id TEXT,
    filter_expression TEXT,
    identifier_columns TEXT DEFAULT '[]',  -- JSON array
    additional_columns TEXT DEFAULT '[]',  -- JSON array
    evaluation_trigger TEXT NOT NULL DEFAULT 'data_model_reload' CHECK (evaluation_trigger IN ('data_model_reload', 'km_publish', 'scheduled', 'manual')),
    max_signals_per_evaluation INTEGER DEFAULT 10000,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    last_evaluated_at TEXT,
    last_signal_count INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (knowledge_model_id) REFERENCES knowledge_models(id) ON DELETE CASCADE,
    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE SET NULL,
    FOREIGN KEY (filter_id) REFERENCES filters(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (knowledge_model_id, name)
);

CREATE INDEX idx_sensors_km ON sensors(knowledge_model_id);
CREATE INDEX idx_sensors_status ON sensors(tenant_id, status);

-- -----------------------------------------------------------------------------
-- Table: skills
-- Purpose: Reusable automation combining Sensor + Actions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sensor_id TEXT NOT NULL,
    action_flow_id TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
    signal_count INTEGER DEFAULT 0,
    last_evaluated_at TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
    FOREIGN KEY (action_flow_id) REFERENCES action_flows(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (package_id, key)
);

CREATE INDEX idx_skills_package ON skills(package_id);
CREATE INDEX idx_skills_status ON skills(tenant_id, status);

-- -----------------------------------------------------------------------------
-- Table: signals
-- Purpose: Detected data incident from Sensor
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signals (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    sensor_id TEXT NOT NULL,
    skill_id TEXT,
    record_key TEXT NOT NULL,
    signal_data TEXT NOT NULL,  -- JSON: Record attributes at detection
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'snoozed', 'resolved', 'dismissed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    assignee_id TEXT,
    assigned_at TEXT,
    snoozed_until TEXT,
    resolved_at TEXT,
    resolved_by TEXT,
    resolution_notes TEXT,
    task_id TEXT,
    source_view_id TEXT,
    detected_at TEXT NOT NULL DEFAULT (datetime('now')),
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (source_view_id) REFERENCES views(id) ON DELETE SET NULL
);

CREATE INDEX idx_signals_tenant_status ON signals(tenant_id, status, priority);
CREATE INDEX idx_signals_assignee ON signals(tenant_id, assignee_id, status);
CREATE INDEX idx_signals_sensor ON signals(sensor_id, record_key);

-- -----------------------------------------------------------------------------
-- Table: task_types
-- Purpose: Classification of tasks
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_types (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'check-circle',
    color TEXT DEFAULT '#1890ff',
    default_priority TEXT DEFAULT 'medium',
    attribute_schema TEXT DEFAULT '{}',  -- JSON: Custom fields
    workflow_config TEXT DEFAULT '{}',  -- JSON: State transitions
    sla_config TEXT DEFAULT '{}',  -- JSON: Due date rules
    is_system INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, key)
);

-- -----------------------------------------------------------------------------
-- Table: tasks
-- Purpose: Work item assigned to users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    task_type_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    assignee_id TEXT,
    reporter_id TEXT NOT NULL,
    due_date TEXT,
    started_at TEXT,
    completed_at TEXT,
    related_signal_id TEXT,
    related_record_type TEXT,
    related_record_key TEXT,
    source_view_id TEXT,
    source_action_flow_id TEXT,
    attributes TEXT DEFAULT '{}',  -- JSON
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (task_type_id) REFERENCES task_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (related_signal_id) REFERENCES signals(id) ON DELETE SET NULL,
    FOREIGN KEY (source_view_id) REFERENCES views(id) ON DELETE SET NULL,
    FOREIGN KEY (source_action_flow_id) REFERENCES action_flows(id) ON DELETE SET NULL
);

CREATE INDEX idx_tasks_assignee ON tasks(tenant_id, assignee_id, status);
CREATE INDEX idx_tasks_status ON tasks(tenant_id, status, priority, due_date);
CREATE INDEX idx_tasks_type ON tasks(tenant_id, task_type_id);

-- -----------------------------------------------------------------------------
-- Table: action_flow_executions
-- Purpose: Single run instance of an Action Flow
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS action_flow_executions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    action_flow_id TEXT NOT NULL,
    triggered_by TEXT NOT NULL CHECK (triggered_by IN ('schedule', 'webhook', 'manual', 'sensor', 'api', 'on_demand')),
    triggered_by_user_id TEXT,
    trigger_data TEXT DEFAULT '{}',  -- JSON
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'warning', 'error', 'cancelled')),
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    duration_ms INTEGER,
    cycles_completed INTEGER DEFAULT 0,
    bundles_processed INTEGER DEFAULT 0,
    input_values TEXT DEFAULT '{}',  -- JSON
    output_values TEXT DEFAULT '{}',  -- JSON
    error_message TEXT,
    error_module_id TEXT,
    execution_log TEXT DEFAULT '[]',  -- JSON: Per-module results
    is_data_confidential INTEGER NOT NULL DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (action_flow_id) REFERENCES action_flows(id) ON DELETE CASCADE,
    FOREIGN KEY (triggered_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_action_flow_executions_flow ON action_flow_executions(tenant_id, action_flow_id, created_at DESC);
CREATE INDEX idx_action_flow_executions_status ON action_flow_executions(tenant_id, status);
CREATE INDEX idx_action_flow_executions_trigger ON action_flow_executions(tenant_id, triggered_by, created_at DESC);

-- -----------------------------------------------------------------------------
-- Table: incomplete_executions
-- Purpose: Stored failed execution for retry/manual resolution
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incomplete_executions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    action_flow_id TEXT NOT NULL,
    execution_id TEXT NOT NULL,
    failed_module_id TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_type TEXT NOT NULL,
    bundle_data TEXT NOT NULL,  -- JSON
    remaining_flow TEXT NOT NULL,  -- JSON: Modules not yet executed
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TEXT,
    retry_delay_seconds INTEGER DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'retrying', 'resolved', 'abandoned')),
    resolved_at TEXT,
    resolved_by TEXT,
    resolution_type TEXT CHECK (resolution_type IN ('retry_success', 'manual_resolve', 'deleted')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (action_flow_id) REFERENCES action_flows(id) ON DELETE CASCADE,
    FOREIGN KEY (execution_id) REFERENCES action_flow_executions(id) ON DELETE CASCADE,
    FOREIGN KEY (failed_module_id) REFERENCES action_flow_modules(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_incomplete_executions_flow ON incomplete_executions(tenant_id, action_flow_id, status);
CREATE INDEX idx_incomplete_executions_retry ON incomplete_executions(tenant_id, status, next_retry_at);

-- ============================================================================
-- SECTION 7: DEV SEED DATA
-- ============================================================================

-- Default tenant
INSERT INTO tenants (id, name, slug, status, tier) 
VALUES ('dev-tenant', 'Development Tenant', 'dev', 'active', 'free');

-- Default user (no password for dev)
INSERT INTO users (id, tenant_id, email, display_name, status)
VALUES ('dev-user', 'dev-tenant', 'dev@local', 'Dev User', 'active');

-- Default API key (for testing)
INSERT INTO api_keys (id, tenant_id, user_id, key_hash, name, status)
VALUES ('dev-key', 'dev-tenant', 'dev-user', 'dev_key_12345', 'Development Key', 'active');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
