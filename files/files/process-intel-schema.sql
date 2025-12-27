-- ============================================================================
-- PROCESS INTELLIGENCE PLATFORM - SQL SCHEMA
-- Based on Celonis Architecture + PM4Py/OCEL 2.0 Standards
-- ============================================================================

-- ============================================================================
-- SECTION 1: DATA INTEGRATION LAYER
-- ============================================================================

-- Data Pool: Container for data connections and tables
CREATE TABLE data_pool (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    storage_type VARCHAR(50) NOT NULL DEFAULT 'internal',
    external_connection_id UUID REFERENCES data_connection(id),
    schema_name VARCHAR(100),
    storage_bytes BIGINT DEFAULT 0,
    table_count INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_data_pool_tenant_name UNIQUE (tenant_id, name),
    CONSTRAINT chk_data_pool_status CHECK (status IN ('active', 'inactive', 'archived'))
);

CREATE INDEX idx_data_pool_tenant ON data_pool(tenant_id);

-- Data Connection: Configuration for external sources
CREATE TABLE data_connection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    data_pool_id UUID NOT NULL REFERENCES data_pool(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    connector_type VARCHAR(50) NOT NULL,
    connection_config JSONB NOT NULL, -- Encrypted sensitive fields
    auth_type VARCHAR(50) NOT NULL,
    oauth_credentials_id UUID REFERENCES oauth_credential(id),
    test_query TEXT,
    last_tested_at TIMESTAMPTZ,
    last_test_status VARCHAR(20),
    last_test_error TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_data_connection_pool_name UNIQUE (tenant_id, data_pool_id, name),
    CONSTRAINT chk_connector_type CHECK (connector_type IN ('jdbc', 'rest', 'sap_rfc', 'sftp', 's3', 'kafka', 'salesforce', 'custom')),
    CONSTRAINT chk_auth_type CHECK (auth_type IN ('basic', 'oauth2', 'api_key', 'sap_user', 'none'))
);

CREATE INDEX idx_data_connection_pool ON data_connection(data_pool_id);
CREATE INDEX idx_data_connection_type ON data_connection(tenant_id, connector_type);

-- Table: Physical or virtual table in data pool
CREATE TABLE "table" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    data_pool_id UUID NOT NULL REFERENCES data_pool(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    table_type VARCHAR(20) NOT NULL DEFAULT 'physical',
    source_connection_id UUID REFERENCES data_connection(id),
    source_schema VARCHAR(255),
    source_table VARCHAR(255),
    transformation_sql TEXT, -- For views
    row_count BIGINT DEFAULT 0,
    size_bytes BIGINT DEFAULT 0,
    last_sync_at TIMESTAMPTZ,
    is_activity_table BOOLEAN DEFAULT false,
    is_case_table BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_table_pool_name UNIQUE (tenant_id, data_pool_id, name),
    CONSTRAINT chk_table_type CHECK (table_type IN ('physical', 'view', 'materialized', 'external'))
);

CREATE INDEX idx_table_pool ON "table"(data_pool_id);

-- Column: Column definition within a table
CREATE TABLE "column" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES "table"(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    data_type VARCHAR(50) NOT NULL,
    source_data_type VARCHAR(100),
    is_nullable BOOLEAN DEFAULT true,
    is_primary_key BOOLEAN DEFAULT false,
    is_indexed BOOLEAN DEFAULT false,
    default_value TEXT,
    format_pattern VARCHAR(100),
    ordinal_position INTEGER NOT NULL,
    description TEXT,
    statistics JSONB DEFAULT '{}', -- min, max, distinct_count, null_count
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_column_table_name UNIQUE (table_id, name),
    CONSTRAINT chk_data_type CHECK (data_type IN ('string', 'integer', 'decimal', 'boolean', 'date', 'datetime', 'json', 'array'))
);

CREATE INDEX idx_column_table ON "column"(table_id);

-- Data Model: Analytical schema for process mining
CREATE TABLE data_model (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    data_pool_id UUID NOT NULL REFERENCES data_pool(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    model_type VARCHAR(20) NOT NULL DEFAULT 'case_centric',
    activity_table_id UUID REFERENCES "table"(id),
    case_table_id UUID REFERENCES "table"(id),
    case_column VARCHAR(255),
    activity_column VARCHAR(255),
    timestamp_column VARCHAR(255),
    sorting_column VARCHAR(255),
    load_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    last_loaded_at TIMESTAMPTZ,
    load_type VARCHAR(10) DEFAULT 'full',
    row_counts JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_data_model_pool_name UNIQUE (tenant_id, data_pool_id, name),
    CONSTRAINT chk_model_type CHECK (model_type IN ('case_centric', 'object_centric')),
    CONSTRAINT chk_load_status CHECK (load_status IN ('pending', 'loading', 'loaded', 'failed', 'stale'))
);

CREATE INDEX idx_data_model_pool ON data_model(data_pool_id);
CREATE INDEX idx_data_model_status ON data_model(tenant_id, load_status);

-- Foreign Key: Relationship between tables
CREATE TABLE foreign_key (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    data_model_id UUID NOT NULL REFERENCES data_model(id) ON DELETE CASCADE,
    name VARCHAR(255),
    source_table_id UUID NOT NULL REFERENCES "table"(id),
    source_columns TEXT[] NOT NULL,
    target_table_id UUID NOT NULL REFERENCES "table"(id),
    target_columns TEXT[] NOT NULL,
    cardinality VARCHAR(10) DEFAULT 'N:1',
    is_enforced BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT chk_cardinality CHECK (cardinality IN ('1:1', '1:N', 'N:1', 'N:M')),
    CONSTRAINT chk_columns_length CHECK (array_length(source_columns, 1) = array_length(target_columns, 1))
);

CREATE INDEX idx_foreign_key_model ON foreign_key(data_model_id);

-- ============================================================================
-- SECTION 2: OCPM (OBJECT-CENTRIC PROCESS MINING) ENTITIES
-- ============================================================================

-- Perspective: Filtered view of OCPM data
CREATE TABLE perspective (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    data_model_id UUID NOT NULL REFERENCES data_model(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    included_object_types UUID[] DEFAULT '{}',
    included_event_types UUID[] DEFAULT '{}',
    included_relationships UUID[] DEFAULT '{}',
    filter_expression TEXT,
    is_default BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_by UUID NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ,
    
    CONSTRAINT uq_perspective_model_name UNIQUE (tenant_id, data_model_id, name),
    CONSTRAINT chk_perspective_status CHECK (status IN ('draft', 'published', 'deprecated'))
);

CREATE INDEX idx_perspective_model ON perspective(data_model_id);
CREATE INDEX idx_perspective_status ON perspective(tenant_id, status);

-- Object Type: Classification of business objects
CREATE TABLE object_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    perspective_id UUID NOT NULL REFERENCES perspective(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    source_table VARCHAR(255),
    identifier_columns TEXT[] NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7),
    tags TEXT[] DEFAULT '{}',
    is_lead_object BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    attribute_schema JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ,
    
    CONSTRAINT uq_object_type_perspective_name UNIQUE (tenant_id, perspective_id, name),
    CONSTRAINT chk_object_type_name CHECK (name ~ '^[A-Za-z][A-Za-z0-9_]*$'),
    CONSTRAINT chk_object_type_status CHECK (status IN ('draft', 'published', 'deprecated')),
    CONSTRAINT chk_identifier_columns CHECK (array_length(identifier_columns, 1) >= 1)
);

CREATE INDEX idx_object_type_perspective ON object_type(perspective_id);

-- Event Type: Classification of events
CREATE TABLE event_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    perspective_id UUID NOT NULL REFERENCES perspective(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    source_table VARCHAR(255),
    timestamp_column VARCHAR(255) NOT NULL,
    sorting_column VARCHAR(255),
    icon VARCHAR(50),
    color VARCHAR(7),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    attribute_schema JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_event_type_perspective_name UNIQUE (tenant_id, perspective_id, name),
    CONSTRAINT chk_event_type_name CHECK (name ~ '^[A-Za-z][A-Za-z0-9_]*$')
);

CREATE INDEX idx_event_type_perspective ON event_type(perspective_id);

-- Object Relationship: Relationship definition between ObjectTypes
CREATE TABLE object_relationship (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    perspective_id UUID NOT NULL REFERENCES perspective(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    source_object_type_id UUID NOT NULL REFERENCES object_type(id) ON DELETE CASCADE,
    target_object_type_id UUID NOT NULL REFERENCES object_type(id) ON DELETE CASCADE,
    cardinality VARCHAR(20) NOT NULL,
    join_columns JSONB NOT NULL,
    is_embedded BOOLEAN DEFAULT false,
    display_name VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_object_relationship_name UNIQUE (tenant_id, perspective_id, name),
    CONSTRAINT chk_relationship_cardinality CHECK (cardinality IN ('one_to_one', 'one_to_many', 'many_to_one', 'many_to_many'))
);

CREATE INDEX idx_object_relationship_source ON object_relationship(source_object_type_id);
CREATE INDEX idx_object_relationship_target ON object_relationship(target_object_type_id);

-- Object: Instance of an ObjectType (high-volume)
CREATE TABLE object (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    object_type_id UUID NOT NULL REFERENCES object_type(id) ON DELETE CASCADE,
    object_key VARCHAR(255) NOT NULL,
    source_system VARCHAR(100),
    source_id VARCHAR(255),
    lifecycle_state VARCHAR(50) DEFAULT 'active',
    first_event_at TIMESTAMPTZ,
    last_event_at TIMESTAMPTZ,
    event_count INTEGER DEFAULT 0,
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_object_type_key UNIQUE (tenant_id, object_type_id, object_key)
) PARTITION BY HASH (tenant_id);

-- Create partitions (example: 16 partitions)
CREATE TABLE object_p0 PARTITION OF object FOR VALUES WITH (MODULUS 16, REMAINDER 0);
CREATE TABLE object_p1 PARTITION OF object FOR VALUES WITH (MODULUS 16, REMAINDER 1);
-- ... continue for p2-p15

CREATE INDEX idx_object_type ON object(object_type_id);
CREATE INDEX idx_object_lifecycle ON object(tenant_id, object_type_id, lifecycle_state);

-- Object Relationship Instance: Links two Objects
CREATE TABLE object_relationship_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    relationship_id UUID NOT NULL REFERENCES object_relationship(id) ON DELETE CASCADE,
    source_object_id UUID NOT NULL REFERENCES object(id) ON DELETE CASCADE,
    target_object_id UUID NOT NULL REFERENCES object(id) ON DELETE CASCADE,
    valid_from TIMESTAMPTZ,
    valid_to TIMESTAMPTZ,
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_object_rel_instance UNIQUE (tenant_id, relationship_id, source_object_id, target_object_id)
);

CREATE INDEX idx_object_rel_source ON object_relationship_instance(source_object_id);
CREATE INDEX idx_object_rel_target ON object_relationship_instance(target_object_id);

-- ============================================================================
-- SECTION 3: CORE PROCESS MINING ENTITIES
-- ============================================================================

-- Activity: Named action/step
CREATE TABLE activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    icon VARCHAR(50),
    color VARCHAR(7),
    is_milestone BOOLEAN DEFAULT false,
    is_automated BOOLEAN DEFAULT false,
    avg_duration_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_activity_tenant_name UNIQUE (tenant_id, name),
    CONSTRAINT chk_activity_color CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE INDEX idx_activity_category ON activity(tenant_id, category);

-- Case: Single execution instance (case-centric)
CREATE TABLE "case" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    data_model_id UUID NOT NULL REFERENCES data_model(id) ON DELETE CASCADE,
    case_key VARCHAR(255) NOT NULL,
    source_system_id VARCHAR(100),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    throughput_time_seconds BIGINT,
    event_count INTEGER DEFAULT 0,
    variant_id UUID,
    is_complete BOOLEAN DEFAULT false,
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_case_model_key UNIQUE (tenant_id, data_model_id, case_key)
);

CREATE INDEX idx_case_model ON "case"(data_model_id);
CREATE INDEX idx_case_started ON "case"(tenant_id, started_at);
CREATE INDEX idx_case_variant ON "case"(tenant_id, variant_id);
CREATE INDEX idx_case_throughput ON "case"(tenant_id, throughput_time_seconds);

-- Event: Single occurrence (high-volume, partitioned)
CREATE TABLE event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    case_id UUID, -- NULL for pure OCPM
    activity_id UUID NOT NULL,
    activity_name VARCHAR(255) NOT NULL, -- Denormalized for performance
    timestamp TIMESTAMPTZ NOT NULL,
    sorting_key INTEGER,
    resource_id UUID,
    resource_name VARCHAR(255), -- Denormalized
    lifecycle_state VARCHAR(50) DEFAULT 'complete',
    source_system VARCHAR(100),
    source_table VARCHAR(255),
    source_id VARCHAR(255),
    cost DECIMAL(18,4),
    duration_seconds INTEGER,
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions (example)
CREATE TABLE event_y2024m01 PARTITION OF event 
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE event_y2024m02 PARTITION OF event 
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... continue for all months

CREATE INDEX idx_event_case_time ON event(tenant_id, case_id, timestamp, sorting_key);
CREATE INDEX idx_event_activity ON event(tenant_id, activity_id);
CREATE INDEX idx_event_timestamp ON event(tenant_id, timestamp);
CREATE INDEX idx_event_resource ON event(tenant_id, resource_id);

-- Event-Object Relationship: Links Events to Objects (OCPM N:M)
CREATE TABLE event_object_relationship (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    event_id UUID NOT NULL,
    object_id UUID NOT NULL,
    qualifier VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE event_object_rel_y2024m01 PARTITION OF event_object_relationship
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE INDEX idx_event_object_event ON event_object_relationship(event_id);
CREATE INDEX idx_event_object_object ON event_object_relationship(object_id);

-- Object Change: Tracks attribute changes (append-only)
CREATE TABLE object_change (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    object_id UUID NOT NULL,
    attribute_name VARCHAR(255) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    changed_at TIMESTAMPTZ NOT NULL,
    changed_by UUID,
    source_event_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (changed_at);

CREATE INDEX idx_object_change_object ON object_change(tenant_id, object_id, changed_at);
CREATE INDEX idx_object_change_attr ON object_change(tenant_id, object_id, attribute_name);

-- Variant: Unique activity sequence (materialized)
CREATE TABLE variant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    data_model_id UUID NOT NULL REFERENCES data_model(id) ON DELETE CASCADE,
    activity_sequence TEXT[] NOT NULL,
    sequence_hash VARCHAR(64) NOT NULL,
    case_count INTEGER DEFAULT 0,
    percentage DECIMAL(5,2),
    avg_throughput_seconds BIGINT,
    is_happy_path BOOLEAN DEFAULT false,
    rank INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_variant_model_hash UNIQUE (tenant_id, data_model_id, sequence_hash)
);

CREATE INDEX idx_variant_model_count ON variant(tenant_id, data_model_id, case_count DESC);

-- ============================================================================
-- SECTION 4: SEMANTIC LAYER (KNOWLEDGE MODEL)
-- ============================================================================

-- Knowledge Model: Semantic layer
CREATE TABLE knowledge_model (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES package(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data_model_id UUID NOT NULL REFERENCES data_model(id),
    km_type VARCHAR(20) NOT NULL DEFAULT 'base',
    extends_km_id UUID REFERENCES knowledge_model(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    yaml_content TEXT,
    published_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_km_package_key UNIQUE (tenant_id, package_id, key),
    CONSTRAINT chk_km_key CHECK (key ~ '^[a-z][a-z0-9_]*$'),
    CONSTRAINT chk_km_type CHECK (km_type IN ('base', 'extension')),
    CONSTRAINT chk_km_status CHECK (status IN ('draft', 'published'))
);

CREATE INDEX idx_km_package ON knowledge_model(package_id);
CREATE INDEX idx_km_data_model ON knowledge_model(data_model_id);

-- KPI: Calculated metric
CREATE TABLE kpi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    knowledge_model_id UUID NOT NULL REFERENCES knowledge_model(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    pql_expression TEXT NOT NULL,
    return_type VARCHAR(20) NOT NULL DEFAULT 'number',
    format_string VARCHAR(50),
    unit VARCHAR(50),
    unit_position VARCHAR(10) DEFAULT 'suffix',
    aggregation_type VARCHAR(20) DEFAULT 'sum',
    is_global BOOLEAN DEFAULT false,
    category VARCHAR(100),
    parameters JSONB DEFAULT '[]',
    thresholds JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_kpi_km_key UNIQUE (knowledge_model_id, key),
    CONSTRAINT chk_kpi_return_type CHECK (return_type IN ('number', 'string', 'date', 'boolean', 'array')),
    CONSTRAINT chk_kpi_unit_position CHECK (unit_position IN ('prefix', 'suffix'))
);

CREATE INDEX idx_kpi_km ON kpi(knowledge_model_id);
CREATE INDEX idx_kpi_category ON kpi(knowledge_model_id, category);

-- Record: Abstraction of Data Model table
CREATE TABLE record (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    knowledge_model_id UUID NOT NULL REFERENCES knowledge_model(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    base_table VARCHAR(255) NOT NULL,
    identifier_attribute VARCHAR(255),
    default_sort_attribute VARCHAR(255),
    default_sort_order VARCHAR(4) DEFAULT 'asc',
    icon VARCHAR(50),
    color VARCHAR(7),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_record_km_key UNIQUE (knowledge_model_id, key),
    CONSTRAINT chk_sort_order CHECK (default_sort_order IN ('asc', 'desc'))
);

CREATE INDEX idx_record_km ON record(knowledge_model_id);

-- Record Attribute: Column mapping within a Record
CREATE TABLE record_attribute (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    record_id UUID NOT NULL REFERENCES record(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    attribute_type VARCHAR(20) NOT NULL DEFAULT 'column',
    source_column VARCHAR(255),
    pql_expression TEXT,
    data_type VARCHAR(20) NOT NULL,
    format_string VARCHAR(50),
    is_identifier BOOLEAN DEFAULT false,
    is_filterable BOOLEAN DEFAULT true,
    is_sortable BOOLEAN DEFAULT true,
    ordinal_position INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_record_attr_key UNIQUE (record_id, key),
    CONSTRAINT chk_attr_type CHECK (attribute_type IN ('column', 'calculated', 'augmented'))
);

CREATE INDEX idx_record_attr ON record_attribute(record_id);

-- Filter: Reusable PQL-based filter
CREATE TABLE filter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    knowledge_model_id UUID NOT NULL REFERENCES knowledge_model(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    pql_expression TEXT NOT NULL,
    base_table VARCHAR(255),
    filter_type VARCHAR(20) NOT NULL DEFAULT 'standard',
    category VARCHAR(100),
    is_default BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_filter_km_key UNIQUE (knowledge_model_id, key),
    CONSTRAINT chk_filter_type CHECK (filter_type IN ('standard', 'process', 'forced'))
);

CREATE INDEX idx_filter_km ON filter(knowledge_model_id);

-- Event Log Config: Process mining event log definition
CREATE TABLE event_log_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    knowledge_model_id UUID NOT NULL REFERENCES knowledge_model(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    activity_table VARCHAR(255) NOT NULL,
    case_id_column VARCHAR(255) NOT NULL,
    activity_column VARCHAR(255) NOT NULL,
    timestamp_column VARCHAR(255) NOT NULL,
    sorting_column VARCHAR(255),
    resource_column VARCHAR(255),
    cost_column VARCHAR(255),
    included_activities TEXT[] DEFAULT '{}',
    excluded_activities TEXT[] DEFAULT '{}',
    filter_expression TEXT,
    is_default BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_event_log_km_key UNIQUE (knowledge_model_id, key)
);

CREATE INDEX idx_event_log_config_km ON event_log_config(knowledge_model_id);

-- Variable: Stored value for parameterization
CREATE TABLE variable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    scope_type VARCHAR(20) NOT NULL,
    scope_id UUID NOT NULL,
    key VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    data_type VARCHAR(20) NOT NULL,
    default_value JSONB,
    current_value JSONB,
    validation_pql TEXT,
    is_required BOOLEAN DEFAULT false,
    is_user_editable BOOLEAN DEFAULT true,
    ui_component VARCHAR(50) DEFAULT 'input_box',
    options_pql TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_variable_scope_key UNIQUE (scope_type, scope_id, key),
    CONSTRAINT chk_scope_type CHECK (scope_type IN ('knowledge_model', 'view', 'package')),
    CONSTRAINT chk_var_data_type CHECK (data_type IN ('string', 'number', 'date', 'boolean', 'array', 'object'))
);

CREATE INDEX idx_variable_scope ON variable(scope_type, scope_id);

-- Augmented Attribute: User-editable field
CREATE TABLE augmented_attribute (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    record_id UUID NOT NULL REFERENCES record(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    data_type VARCHAR(20) NOT NULL,
    possible_values TEXT[],
    default_value JSONB,
    is_required BOOLEAN DEFAULT false,
    is_multi_value BOOLEAN DEFAULT false,
    validation_regex VARCHAR(255),
    ordinal_position INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_aug_attr_record_key UNIQUE (record_id, key),
    CONSTRAINT chk_aug_data_type CHECK (data_type IN ('string', 'number', 'date', 'boolean', 'enum'))
);

CREATE INDEX idx_aug_attr_record ON augmented_attribute(record_id);

-- Augmented Attribute Value: Stored values
CREATE TABLE augmented_attribute_value (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    augmented_attribute_id UUID NOT NULL REFERENCES augmented_attribute(id) ON DELETE CASCADE,
    record_key VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    updated_by UUID NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_aug_value UNIQUE (augmented_attribute_id, record_key)
);

CREATE INDEX idx_aug_value_attr ON augmented_attribute_value(augmented_attribute_id);
CREATE INDEX idx_aug_value_updated ON augmented_attribute_value(tenant_id, updated_at);

-- ============================================================================
-- SECTION 5: STUDIO LAYER
-- ============================================================================

-- Space: Organizational container
CREATE TABLE space (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'folder',
    color VARCHAR(7) DEFAULT '#1890ff',
    is_default BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_space_tenant_name UNIQUE (tenant_id, name),
    CONSTRAINT chk_space_status CHECK (status IN ('active', 'archived'))
);

CREATE INDEX idx_space_tenant ON space(tenant_id);
CREATE INDEX idx_space_order ON space(tenant_id, sort_order);

-- Package: Container for Studio assets
CREATE TABLE package (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    space_id UUID NOT NULL REFERENCES space(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'box',
    color VARCHAR(7) DEFAULT '#1890ff',
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    version VARCHAR(20) DEFAULT '1.0.0',
    is_template BOOLEAN DEFAULT false,
    source_package_id UUID REFERENCES package(id),
    data_model_variable_id UUID,
    published_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_package_tenant_key UNIQUE (tenant_id, key),
    CONSTRAINT chk_package_key CHECK (key ~ '^[a-z][a-z0-9_-]*$'),
    CONSTRAINT chk_package_status CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE INDEX idx_package_space ON package(space_id);
CREATE INDEX idx_package_status ON package(tenant_id, space_id, status);

-- View: Interactive dashboard
CREATE TABLE view (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES package(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    knowledge_model_id UUID NOT NULL REFERENCES knowledge_model(id),
    base_view_id UUID REFERENCES view(id),
    view_type VARCHAR(20) NOT NULL DEFAULT 'standard',
    layout_mode VARCHAR(20) NOT NULL DEFAULT 'scale_to_fit',
    layout_config JSONB DEFAULT '{}',
    icon VARCHAR(50) DEFAULT 'layout',
    thumbnail_url VARCHAR(500),
    is_home BOOLEAN DEFAULT false,
    is_published_to_apps BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_view_package_key UNIQUE (package_id, key),
    CONSTRAINT chk_view_type CHECK (view_type IN ('standard', 'profile', 'extension')),
    CONSTRAINT chk_layout_mode CHECK (layout_mode IN ('scale_to_fit', 'custom_height'))
);

CREATE INDEX idx_view_package ON view(package_id);
CREATE INDEX idx_view_km ON view(knowledge_model_id);

-- Component: UI component within a View
CREATE TABLE component (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    view_id UUID NOT NULL REFERENCES view(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES component(id),
    component_type VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    layout_position JSONB NOT NULL,
    data_config JSONB DEFAULT '{}',
    visual_config JSONB DEFAULT '{}',
    interaction_config JSONB DEFAULT '{}',
    is_visible BOOLEAN DEFAULT true,
    visibility_expression TEXT,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_component_view_key UNIQUE (view_id, key),
    CONSTRAINT chk_component_type CHECK (component_type IN (
        'chart', 'table', 'kpi_list', 'process_explorer', 'variant_explorer',
        'text', 'button', 'input', 'filter_bar', 'tab', 'container',
        'action_button', 'image', 'custom'
    ))
);

CREATE INDEX idx_component_view ON component(view_id);
CREATE INDEX idx_component_parent ON component(view_id, parent_id);

-- ============================================================================
-- SECTION 6: AUTOMATION LAYER
-- ============================================================================

-- Full automation layer schemas (Action Flow, Skill, Signal, Task, etc.)
-- would continue here following the same pattern...

-- See the YAML definitions in the main ERD document for complete specifications
