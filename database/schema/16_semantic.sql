-- ============================================================================
-- SEMANTIC LAYER: Knowledge Model entities
-- ============================================================================
-- This layer implements the semantic abstraction over data models,
-- containing KPIs, Records, Filters, Variables, and Event Log configurations.
-- Based on Process Intelligence Platform ERD Specification.
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
    version INTEGER NOT NULL DEFAULT 1,
    yaml_content TEXT,
    published_at TEXT,
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (data_model_id) REFERENCES data_models(id) ON DELETE RESTRICT,
    FOREIGN KEY (extends_km_id) REFERENCES knowledge_models(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, package_id, key)
);

CREATE INDEX idx_knowledge_models_package ON knowledge_models(package_id);
CREATE INDEX idx_knowledge_models_data_model ON knowledge_models(data_model_id);

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
    is_global INTEGER NOT NULL DEFAULT 0,
    category TEXT,
    parameters TEXT DEFAULT '[]',  -- JSON array
    thresholds TEXT DEFAULT '[]',  -- JSON array
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
    source_column TEXT,  -- For column type
    pql_expression TEXT,  -- For calculated type
    data_type TEXT NOT NULL CHECK (data_type IN ('string', 'number', 'date', 'boolean', 'array')),
    format_string TEXT,
    is_identifier INTEGER NOT NULL DEFAULT 0,
    is_filterable INTEGER NOT NULL DEFAULT 1,
    is_sortable INTEGER NOT NULL DEFAULT 1,
    ordinal_position INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE,
    UNIQUE (record_id, key)
);

CREATE INDEX idx_record_attributes_record ON record_attributes(record_id);
CREATE INDEX idx_record_attributes_position ON record_attributes(record_id, ordinal_position);

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
    is_default INTEGER NOT NULL DEFAULT 0,
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
    is_required INTEGER NOT NULL DEFAULT 0,
    is_user_editable INTEGER NOT NULL DEFAULT 1,
    ui_component TEXT DEFAULT 'input_box' CHECK (ui_component IN ('input_box', 'dropdown', 'date_picker', 'checkbox', 'slider')),
    options_pql TEXT,  -- For dropdowns
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
    is_default INTEGER NOT NULL DEFAULT 0,
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
    is_required INTEGER NOT NULL DEFAULT 0,
    is_multi_value INTEGER NOT NULL DEFAULT 0,
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
    updated_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (augmented_attribute_id) REFERENCES augmented_attributes(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (augmented_attribute_id, record_key)
);

CREATE INDEX idx_augmented_attribute_values_attr ON augmented_attribute_values(augmented_attribute_id);
CREATE INDEX idx_augmented_attribute_values_updated ON augmented_attribute_values(tenant_id, updated_at);
