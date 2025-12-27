-- ============================================================================
-- PHASE 6: CONFORMANCE & QUALITY (5 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: conformance_jobs
-- Purpose: Conformance checking job definitions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conformance_jobs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    event_log_id TEXT,
    data_pool_id TEXT,
    model_id TEXT NOT NULL,
    name TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('token_replay', 'alignment', 'footprints')),
    configuration TEXT DEFAULT '{}',  -- JSON
    schedule_cron TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_log_id) REFERENCES event_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES discovered_models(id) ON DELETE RESTRICT
);

CREATE INDEX idx_conformance_jobs_model ON conformance_jobs(model_id);
CREATE INDEX idx_conformance_jobs_tenant ON conformance_jobs(tenant_id, is_active);

-- -----------------------------------------------------------------------------
-- Table: conformance_results
-- Purpose: Aggregate conformance checking results
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conformance_results (
    id TEXT PRIMARY KEY,
    conformance_job_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    computed_at TEXT NOT NULL DEFAULT (datetime('now')),
    cases_checked INTEGER NOT NULL,
    conforming_cases INTEGER NOT NULL,
    non_conforming_cases INTEGER NOT NULL,
    fitness REAL,
    precision REAL,
    generalization REAL,
    computation_time_ms INTEGER,
    detailed_metrics TEXT DEFAULT '{}',  -- JSON
    FOREIGN KEY (conformance_job_id) REFERENCES conformance_jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_conformance_results_job ON conformance_results(conformance_job_id, computed_at DESC);
CREATE INDEX idx_conformance_results_time ON conformance_results(tenant_id, computed_at DESC);

-- -----------------------------------------------------------------------------
-- Table: deviations
-- Purpose: Individual conformance violations at trace level
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deviations (
    id TEXT PRIMARY KEY,
    conformance_result_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    case_id TEXT,
    event_id TEXT,
    deviation_type TEXT NOT NULL CHECK (deviation_type IN ('missing', 'unexpected', 'wrong_order')),
    expected_activity TEXT,
    actual_activity TEXT,
    position_in_trace INTEGER,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    cost REAL,
    details TEXT DEFAULT '{}',  -- JSON
    detected_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (conformance_result_id) REFERENCES conformance_results(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

CREATE INDEX idx_deviations_result ON deviations(conformance_result_id);
CREATE INDEX idx_deviations_case ON deviations(case_id);
CREATE INDEX idx_deviations_type ON deviations(tenant_id, deviation_type, detected_at DESC);
CREATE INDEX idx_deviations_severity ON deviations(tenant_id, severity);

-- -----------------------------------------------------------------------------
-- Table: alignments
-- Purpose: Store computed optimal alignments for cases
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alignments (
    id TEXT PRIMARY KEY,
    conformance_result_id TEXT NOT NULL,
    case_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    alignment_cost REAL NOT NULL,
    fitness_value REAL NOT NULL,
    alignment_sequence TEXT NOT NULL,  -- JSON
    trace_length INTEGER,
    model_length INTEGER,
    computation_time_ms INTEGER,
    FOREIGN KEY (conformance_result_id) REFERENCES conformance_results(id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_alignments_result ON alignments(conformance_result_id);
CREATE INDEX idx_alignments_case ON alignments(case_id);
CREATE INDEX idx_alignments_fitness ON alignments(tenant_id, fitness_value);

-- -----------------------------------------------------------------------------
-- Table: quality_metrics
-- Purpose: Store model quality assessments over time
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quality_metrics (
    id TEXT PRIMARY KEY,
    model_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    computed_at TEXT NOT NULL DEFAULT (datetime('now')),
    metric_type TEXT NOT NULL CHECK (metric_type IN ('fitness', 'precision', 'generalization', 'simplicity', 'f_score')),
    value REAL NOT NULL,
    method TEXT,
    sample_size INTEGER,
    confidence_interval TEXT,  -- JSON
    FOREIGN KEY (model_id) REFERENCES discovered_models(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_quality_metrics_model ON quality_metrics(model_id, metric_type, computed_at DESC);
CREATE INDEX idx_quality_metrics_time ON quality_metrics(tenant_id, computed_at DESC);
