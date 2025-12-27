-- ============================================================================
-- DATA MODEL LAYER: Enhanced data integration entities
-- ============================================================================
-- This layer extends the core data integration with analytical data models,
-- table/column definitions, foreign keys, schedules, and job execution tracking.
-- Based on Process Intelligence Platform ERD Specification.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: data_models
-- Purpose: Analytical schema built from data pool tables
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_models (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_pool_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    model_type TEXT NOT NULL DEFAULT 'case_centric' CHECK (model_type IN ('case_centric', 'object_centric')),
    activity_table_id TEXT,
    case_table_id TEXT,
    case_column TEXT,
    activity_column TEXT,
    timestamp_column TEXT,
    sorting_column TEXT,
    load_status TEXT NOT NULL DEFAULT 'pending' CHECK (load_status IN ('pending', 'loading', 'loaded', 'failed', 'stale')),
    last_loaded_at TEXT,
    load_type TEXT NOT NULL DEFAULT 'full' CHECK (load_type IN ('full', 'delta')),
    row_counts TEXT DEFAULT '{}',  -- JSON: Table name -> row count
    version INTEGER NOT NULL DEFAULT 1,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, data_pool_id, name)
);

CREATE INDEX idx_data_models_pool ON data_models(data_pool_id);
CREATE INDEX idx_data_models_tenant_status ON data_models(tenant_id, load_status);

-- -----------------------------------------------------------------------------
-- Table: tables
-- Purpose: Physical or virtual table in data pool
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tables (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_pool_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    table_type TEXT NOT NULL DEFAULT 'physical' CHECK (table_type IN ('physical', 'view', 'materialized', 'external')),
    source_connection_id TEXT,
    source_schema TEXT,
    source_table TEXT,
    transformation_sql TEXT,  -- For views
    row_count INTEGER DEFAULT 0,
    size_bytes INTEGER DEFAULT 0,
    last_sync_at TEXT,
    is_activity_table INTEGER NOT NULL DEFAULT 0,
    is_case_table INTEGER NOT NULL DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE CASCADE,
    FOREIGN KEY (source_connection_id) REFERENCES data_connections(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, data_pool_id, name)
);

CREATE INDEX idx_tables_pool ON tables(data_pool_id);
CREATE INDEX idx_tables_type ON tables(tenant_id, table_type);

-- -----------------------------------------------------------------------------
-- Table: columns
-- Purpose: Column definition within a table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS columns (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    table_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    data_type TEXT NOT NULL CHECK (data_type IN ('string', 'integer', 'decimal', 'boolean', 'date', 'datetime', 'json', 'array')),
    source_data_type TEXT,  -- Original database type
    is_nullable INTEGER NOT NULL DEFAULT 1,
    is_primary_key INTEGER NOT NULL DEFAULT 0,
    is_indexed INTEGER NOT NULL DEFAULT 0,
    default_value TEXT,
    format_pattern TEXT,
    ordinal_position INTEGER NOT NULL,
    description TEXT,
    statistics TEXT DEFAULT '{}',  -- JSON: min, max, distinct_count, null_count
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
    UNIQUE (table_id, name)
);

CREATE INDEX idx_columns_table ON columns(table_id);
CREATE INDEX idx_columns_position ON columns(table_id, ordinal_position);

-- -----------------------------------------------------------------------------
-- Table: foreign_keys
-- Purpose: Relationship between tables in data model
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS foreign_keys (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_model_id TEXT NOT NULL,
    name TEXT,
    source_table_id TEXT NOT NULL,
    source_columns TEXT NOT NULL,  -- JSON array of column names
    target_table_id TEXT NOT NULL,
    target_columns TEXT NOT NULL,  -- JSON array of column names
    cardinality TEXT NOT NULL DEFAULT 'N:1' CHECK (cardinality IN ('1:1', '1:N', 'N:1', 'N:M')),
    is_enforced INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (data_model_id) REFERENCES data_models(id) ON DELETE CASCADE,
    FOREIGN KEY (source_table_id) REFERENCES tables(id) ON DELETE CASCADE,
    FOREIGN KEY (target_table_id) REFERENCES tables(id) ON DELETE CASCADE
);

CREATE INDEX idx_foreign_keys_model ON foreign_keys(data_model_id);
CREATE INDEX idx_foreign_keys_source ON foreign_keys(source_table_id);
CREATE INDEX idx_foreign_keys_target ON foreign_keys(target_table_id);

-- -----------------------------------------------------------------------------
-- Table: schedules
-- Purpose: Time-based trigger configuration
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('cron', 'interval', 'once')),
    cron_expression TEXT,  -- For cron type
    interval_seconds INTEGER,  -- For interval type
    run_at TEXT,  -- For once type (ISO timestamp)
    timezone TEXT NOT NULL DEFAULT 'UTC',
    is_enabled INTEGER NOT NULL DEFAULT 1,
    last_triggered_at TEXT,
    next_trigger_at TEXT,
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_schedules_tenant ON schedules(tenant_id, is_enabled);
CREATE INDEX idx_schedules_next_trigger ON schedules(next_trigger_at) WHERE is_enabled = 1;

-- -----------------------------------------------------------------------------
-- Table: job_executions
-- Purpose: Single run instance of a data job
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_executions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_job_id TEXT NOT NULL,
    triggered_by TEXT NOT NULL CHECK (triggered_by IN ('schedule', 'manual', 'api', 'dependent')),
    triggered_by_user_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed', 'cancelled')),
    started_at TEXT,
    completed_at TEXT,
    duration_ms INTEGER,
    rows_processed INTEGER DEFAULT 0,
    rows_failed INTEGER DEFAULT 0,
    error_message TEXT,
    error_details TEXT DEFAULT '{}',  -- JSON
    task_results TEXT DEFAULT '[]',  -- JSON: Per-task status
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (data_job_id) REFERENCES import_jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (triggered_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_job_executions_job ON job_executions(data_job_id, created_at DESC);
CREATE INDEX idx_job_executions_tenant_status ON job_executions(tenant_id, status);

-- -----------------------------------------------------------------------------
-- Table: data_job_tasks
-- Purpose: Individual task within a data job
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_job_tasks (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_job_id TEXT NOT NULL,
    name TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('extraction', 'transformation', 'load', 'custom')),
    execution_order INTEGER NOT NULL,
    source_connection_id TEXT,
    source_query TEXT,
    target_table_id TEXT,
    transformation_sql TEXT,
    extraction_mode TEXT NOT NULL DEFAULT 'full' CHECK (extraction_mode IN ('full', 'delta')),
    delta_column TEXT,
    delta_value TEXT,
    is_enabled INTEGER NOT NULL DEFAULT 1,
    timeout_seconds INTEGER DEFAULT 1800,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (data_job_id) REFERENCES import_jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (source_connection_id) REFERENCES data_connections(id) ON DELETE SET NULL,
    FOREIGN KEY (target_table_id) REFERENCES tables(id) ON DELETE SET NULL
);

CREATE INDEX idx_data_job_tasks_job ON data_job_tasks(data_job_id, execution_order);
