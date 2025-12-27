-- ============================================================================
-- PHASE 2: CASE-CENTRIC PROCESS MINING (6 tables)
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
