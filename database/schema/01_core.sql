-- ============================================================================
-- PHASE 1: CORE INFRASTRUCTURE (5 tables)
-- ============================================================================

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- -----------------------------------------------------------------------------
-- Table: tenants
-- Purpose: Root organizational boundary for multi-tenancy
-- Enhanced with Enterprise SaaS ERD attributes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    external_id TEXT UNIQUE,  -- External system identifier
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'team' CHECK (type IN ('individual', 'team', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('provisioning', 'active', 'suspended', 'terminated')),
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'professional', 'enterprise')),
    settings TEXT DEFAULT '{}',  -- JSON: legacy settings field
    metadata TEXT DEFAULT '{}',  -- JSON: additional tenant metadata
    storage_quota_gb INTEGER DEFAULT 10,
    event_quota_monthly INTEGER DEFAULT 1000000,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT  -- Soft delete support
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_external_id ON tenants(external_id);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_tier ON tenants(tier);

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
