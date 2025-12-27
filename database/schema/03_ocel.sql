-- ============================================================================
-- PHASE 3: OCEL 2.0 NATIVE (7 tables)
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
