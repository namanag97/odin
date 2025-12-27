-- ============================================================================
-- PHASE 9: SIMULATION (4 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: simulation_models
-- Purpose: Simulation configuration and parameters
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulation_models (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    discovered_model_id TEXT,
    event_log_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    simulation_type TEXT NOT NULL CHECK (simulation_type IN ('discrete_event', 'monte_carlo', 'agent_based')),
    base_configuration TEXT NOT NULL,  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (discovered_model_id) REFERENCES discovered_models(id) ON DELETE CASCADE,
    FOREIGN KEY (event_log_id) REFERENCES event_logs(id) ON DELETE CASCADE
);

CREATE INDEX idx_simulation_models_tenant ON simulation_models(tenant_id);
CREATE INDEX idx_simulation_models_discovered ON simulation_models(discovered_model_id);

-- -----------------------------------------------------------------------------
-- Table: simulation_parameters
-- Purpose: Detailed parameter distributions for simulation
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulation_parameters (
    id TEXT PRIMARY KEY,
    simulation_model_id TEXT NOT NULL,
    element_type TEXT NOT NULL CHECK (element_type IN ('activity', 'gateway', 'resource')),
    element_name TEXT NOT NULL,
    parameter_name TEXT NOT NULL,
    distribution TEXT NOT NULL,
    distribution_params TEXT NOT NULL,  -- JSON
    source TEXT DEFAULT 'mined' CHECK (source IN ('mined', 'manual', 'estimated')),
    FOREIGN KEY (simulation_model_id) REFERENCES simulation_models(id) ON DELETE CASCADE
);

CREATE INDEX idx_simulation_parameters_model ON simulation_parameters(simulation_model_id, element_type);

-- -----------------------------------------------------------------------------
-- Table: simulation_runs
-- Purpose: Simulation execution records
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulation_runs (
    id TEXT PRIMARY KEY,
    simulation_model_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    name TEXT,
    scenario_config TEXT DEFAULT '{}',  -- JSON
    random_seed INTEGER,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    replications INTEGER DEFAULT 1,
    error_message TEXT,
    FOREIGN KEY (simulation_model_id) REFERENCES simulation_models(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_simulation_runs_model ON simulation_runs(simulation_model_id, started_at DESC);
CREATE INDEX idx_simulation_runs_status ON simulation_runs(tenant_id, status);

-- -----------------------------------------------------------------------------
-- Table: simulation_results
-- Purpose: Simulation output and statistics
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulation_results (
    id TEXT PRIMARY KEY,
    simulation_run_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    replication_number INTEGER DEFAULT 1,
    summary_statistics TEXT NOT NULL,  -- JSON
    activity_statistics TEXT NOT NULL,  -- JSON
    resource_statistics TEXT NOT NULL,  -- JSON
    queue_statistics TEXT DEFAULT '{}',  -- JSON
    cost_analysis TEXT DEFAULT '{}',  -- JSON
    raw_output_path TEXT,
    FOREIGN KEY (simulation_run_id) REFERENCES simulation_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_simulation_results_run ON simulation_results(simulation_run_id, replication_number);
