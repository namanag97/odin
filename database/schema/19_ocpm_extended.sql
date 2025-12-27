-- ============================================================================
-- OCPM EXTENDED: Enhanced Object-Centric Process Mining
-- ============================================================================
-- This layer extends the base OCEL schema with Perspectives, Object
-- Relationships, and Custom Event Logs for advanced OCPM capabilities.
-- Based on Process Intelligence Platform ERD Specification.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: perspectives
-- Purpose: Filtered view of OCPM data for specific analysis
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS perspectives (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    data_model_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    included_object_types TEXT DEFAULT '[]',  -- JSON array of UUIDs
    included_event_types TEXT DEFAULT '[]',  -- JSON array of UUIDs
    included_relationships TEXT DEFAULT '[]',  -- JSON array of UUIDs
    filter_expression TEXT,  -- PQL filter
    is_default INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deprecated')),
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    published_at TEXT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (data_model_id) REFERENCES data_models(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, data_model_id, name)
);

CREATE INDEX idx_perspectives_model ON perspectives(data_model_id);
CREATE INDEX idx_perspectives_status ON perspectives(tenant_id, status);

-- -----------------------------------------------------------------------------
-- Table: object_types
-- Purpose: Classification of business objects (e.g., SalesOrder, Invoice)
-- Extended from base ocel_object_types with perspective support
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS object_types (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    perspective_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    source_table TEXT,
    identifier_columns TEXT NOT NULL,  -- JSON array
    icon TEXT,
    color TEXT,
    tags TEXT DEFAULT '[]',  -- JSON array
    is_lead_object INTEGER NOT NULL DEFAULT 0,  -- Case key for event logs
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deprecated')),
    attribute_schema TEXT DEFAULT '{}',  -- JSON Schema for attributes
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    published_at TEXT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (perspective_id) REFERENCES perspectives(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, perspective_id, name)
);

CREATE INDEX idx_object_types_perspective ON object_types(perspective_id);
CREATE INDEX idx_object_types_status ON object_types(tenant_id, status);

-- -----------------------------------------------------------------------------
-- Table: event_types
-- Purpose: Classification of event occurrences in OCPM
-- Extended from base ocel_event_types with perspective support
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_types (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    perspective_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    source_table TEXT,
    timestamp_column TEXT NOT NULL,
    sorting_column TEXT,
    icon TEXT,
    color TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deprecated')),
    attribute_schema TEXT DEFAULT '{}',  -- JSON Schema for attributes
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (perspective_id) REFERENCES perspectives(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, perspective_id, name)
);

CREATE INDEX idx_event_types_perspective ON event_types(perspective_id);

-- -----------------------------------------------------------------------------
-- Table: object_relationships
-- Purpose: Relationship definition between two ObjectTypes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS object_relationships (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    perspective_id TEXT NOT NULL,
    name TEXT NOT NULL,
    source_object_type_id TEXT NOT NULL,
    target_object_type_id TEXT NOT NULL,
    cardinality TEXT NOT NULL CHECK (cardinality IN ('one_to_one', 'one_to_many', 'many_to_one', 'many_to_many')),
    join_columns TEXT NOT NULL,  -- JSON: Column mapping for join
    is_embedded INTEGER NOT NULL DEFAULT 0,  -- Breaks cycles in perspective
    display_name TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (perspective_id) REFERENCES perspectives(id) ON DELETE CASCADE,
    FOREIGN KEY (source_object_type_id) REFERENCES object_types(id) ON DELETE CASCADE,
    FOREIGN KEY (target_object_type_id) REFERENCES object_types(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, perspective_id, name)
);

CREATE INDEX idx_object_relationships_source ON object_relationships(source_object_type_id);
CREATE INDEX idx_object_relationships_target ON object_relationships(target_object_type_id);

-- -----------------------------------------------------------------------------
-- Table: object_relationship_instances
-- Purpose: Instance linking two Objects
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS object_relationship_instances (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    relationship_id TEXT NOT NULL,
    source_object_id TEXT NOT NULL,
    target_object_id TEXT NOT NULL,
    valid_from TEXT,
    valid_to TEXT,
    attributes TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (relationship_id) REFERENCES object_relationships(id) ON DELETE CASCADE,
    FOREIGN KEY (source_object_id) REFERENCES ocel_objects(id) ON DELETE CASCADE,
    FOREIGN KEY (target_object_id) REFERENCES ocel_objects(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, relationship_id, source_object_id, target_object_id)
);

CREATE INDEX idx_object_relationship_instances_source ON object_relationship_instances(source_object_id);
CREATE INDEX idx_object_relationship_instances_target ON object_relationship_instances(target_object_id);

-- -----------------------------------------------------------------------------
-- Table: custom_event_logs
-- Purpose: Case-centric event log generated from OCPM perspective
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS custom_event_logs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    perspective_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    lead_object_type_id TEXT NOT NULL,  -- Case key
    included_event_types TEXT DEFAULT '[]',  -- JSON array of UUIDs
    flattening_strategy TEXT NOT NULL DEFAULT 'simple' CHECK (flattening_strategy IN ('simple', 'object_propagation', 'all_events')),
    filter_expression TEXT,
    is_materialized INTEGER NOT NULL DEFAULT 0,
    last_materialized_at TEXT,
    row_count INTEGER DEFAULT 0,
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (perspective_id) REFERENCES perspectives(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, perspective_id, name)
);

CREATE INDEX idx_custom_event_logs_perspective ON custom_event_logs(perspective_id);
