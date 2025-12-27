-- ============================================================================
-- PHASE 5: PROCESS DISCOVERY (6 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: discovered_models
-- Purpose: Store process models discovered by mining algorithms
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS discovered_models (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    event_log_id TEXT,
    data_pool_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    algorithm TEXT NOT NULL,
    algorithm_params TEXT DEFAULT '{}',  -- JSON
    model_type TEXT NOT NULL CHECK (model_type IN ('petri_net', 'bpmn', 'dfg', 'process_tree', 'ocel_ocdfg')),
    model_data TEXT NOT NULL,  -- JSON serialized model
    model_file_path TEXT,
    quality_metrics TEXT DEFAULT '{}',  -- JSON
    statistics TEXT DEFAULT '{}',  -- JSON
    perspective TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_log_id) REFERENCES event_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE CASCADE
);

CREATE INDEX idx_discovered_models_event_log ON discovered_models(event_log_id);
CREATE INDEX idx_discovered_models_pool ON discovered_models(data_pool_id);
CREATE INDEX idx_discovered_models_algorithm ON discovered_models(tenant_id, algorithm);
CREATE INDEX idx_discovered_models_type ON discovered_models(tenant_id, model_type);

-- -----------------------------------------------------------------------------
-- Table: petri_nets
-- Purpose: Structured storage for Petri net models
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS petri_nets (
    id TEXT PRIMARY KEY,
    discovered_model_id TEXT NOT NULL UNIQUE,
    tenant_id TEXT NOT NULL,
    name TEXT,
    initial_marking TEXT NOT NULL,  -- JSON: place -> tokens
    final_marking TEXT NOT NULL,  -- JSON: place -> tokens
    properties TEXT DEFAULT '{}',  -- JSON: soundness, liveness, etc.
    FOREIGN KEY (discovered_model_id) REFERENCES discovered_models(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Table: petri_net_places
-- Purpose: Places in Petri net models
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS petri_net_places (
    id TEXT PRIMARY KEY,
    petri_net_id TEXT NOT NULL,
    name TEXT NOT NULL,
    label TEXT,
    is_initial INTEGER DEFAULT 0,
    is_final INTEGER DEFAULT 0,
    position_x REAL,
    position_y REAL,
    FOREIGN KEY (petri_net_id) REFERENCES petri_nets(id) ON DELETE CASCADE,
    UNIQUE (petri_net_id, name)
);

CREATE INDEX idx_petri_net_places_net ON petri_net_places(petri_net_id);

-- -----------------------------------------------------------------------------
-- Table: petri_net_transitions
-- Purpose: Transitions in Petri net models
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS petri_net_transitions (
    id TEXT PRIMARY KEY,
    petri_net_id TEXT NOT NULL,
    name TEXT NOT NULL,
    label TEXT,
    is_silent INTEGER DEFAULT 0,
    activity_id TEXT,
    position_x REAL,
    position_y REAL,
    frequency INTEGER,
    FOREIGN KEY (petri_net_id) REFERENCES petri_nets(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL,
    UNIQUE (petri_net_id, name)
);

CREATE INDEX idx_petri_net_transitions_net ON petri_net_transitions(petri_net_id);
CREATE INDEX idx_petri_net_transitions_activity ON petri_net_transitions(activity_id);

-- -----------------------------------------------------------------------------
-- Table: petri_net_arcs
-- Purpose: Arcs connecting places and transitions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS petri_net_arcs (
    id TEXT PRIMARY KEY,
    petri_net_id TEXT NOT NULL,
    source_place_id TEXT,
    source_transition_id TEXT,
    target_place_id TEXT,
    target_transition_id TEXT,
    weight INTEGER DEFAULT 1,
    FOREIGN KEY (petri_net_id) REFERENCES petri_nets(id) ON DELETE CASCADE,
    FOREIGN KEY (source_place_id) REFERENCES petri_net_places(id) ON DELETE CASCADE,
    FOREIGN KEY (source_transition_id) REFERENCES petri_net_transitions(id) ON DELETE CASCADE,
    FOREIGN KEY (target_place_id) REFERENCES petri_net_places(id) ON DELETE CASCADE,
    FOREIGN KEY (target_transition_id) REFERENCES petri_net_transitions(id) ON DELETE CASCADE,
    CHECK (
        (source_place_id IS NOT NULL AND source_transition_id IS NULL AND target_place_id IS NULL AND target_transition_id IS NOT NULL)
        OR
        (source_place_id IS NULL AND source_transition_id IS NOT NULL AND target_place_id IS NOT NULL AND target_transition_id IS NULL)
    )
);

CREATE INDEX idx_petri_net_arcs_net ON petri_net_arcs(petri_net_id);
CREATE INDEX idx_petri_net_arcs_source_place ON petri_net_arcs(source_place_id);
CREATE INDEX idx_petri_net_arcs_source_trans ON petri_net_arcs(source_transition_id);

-- -----------------------------------------------------------------------------
-- Table: bpmn_models
-- Purpose: BPMN 2.0 model storage
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bpmn_models (
    id TEXT PRIMARY KEY,
    discovered_model_id TEXT UNIQUE,
    tenant_id TEXT NOT NULL,
    bpmn_xml TEXT NOT NULL,
    bpmn_json TEXT NOT NULL,  -- JSON representation for rendering
    process_id TEXT,
    pools TEXT DEFAULT '[]',  -- JSON array
    element_count INTEGER,
    FOREIGN KEY (discovered_model_id) REFERENCES discovered_models(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_bpmn_models_discovered ON bpmn_models(discovered_model_id);
