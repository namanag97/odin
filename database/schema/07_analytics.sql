-- ============================================================================
-- PHASE 7: PERFORMANCE & ANALYTICS (5 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: performance_metrics
-- Purpose: KPI definitions for process performance
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS performance_metrics (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    event_log_id TEXT,
    data_pool_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('throughput_time', 'waiting_time', 'service_time', 'count', 'cost', 'custom')),
    aggregation TEXT DEFAULT 'avg' CHECK (aggregation IN ('avg', 'sum', 'min', 'max', 'median', 'p95', 'count')),
    unit TEXT,
    formula TEXT,
    filter_conditions TEXT DEFAULT '{}',  -- JSON
    thresholds TEXT DEFAULT '{}',  -- JSON
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_log_id) REFERENCES event_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE CASCADE
);

CREATE INDEX idx_performance_metrics_tenant ON performance_metrics(tenant_id, metric_type);
CREATE INDEX idx_performance_metrics_log ON performance_metrics(event_log_id);

-- -----------------------------------------------------------------------------
-- Table: metric_values
-- Purpose: Time-series storage for metric measurements
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS metric_values (
    id TEXT PRIMARY KEY,
    metric_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    measured_at TEXT NOT NULL,
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,
    value REAL NOT NULL,
    sample_count INTEGER,
    dimensions TEXT DEFAULT '{}',  -- JSON
    FOREIGN KEY (metric_id) REFERENCES performance_metrics(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_metric_values_metric_time ON metric_values(metric_id, measured_at DESC);

-- -----------------------------------------------------------------------------
-- Table: bottleneck_analyses
-- Purpose: Store bottleneck detection results
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bottleneck_analyses (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    event_log_id TEXT,
    data_pool_id TEXT,
    name TEXT NOT NULL,
    analyzed_at TEXT NOT NULL DEFAULT (datetime('now')),
    method TEXT NOT NULL CHECK (method IN ('sojourn_time', 'waiting_time', 'queue_length')),
    results TEXT NOT NULL,  -- JSON
    recommendations TEXT DEFAULT '[]',  -- JSON array
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_log_id) REFERENCES event_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE CASCADE
);

CREATE INDEX idx_bottleneck_analyses_tenant ON bottleneck_analyses(tenant_id, analyzed_at DESC);

-- -----------------------------------------------------------------------------
-- Table: sna_results
-- Purpose: Social Network Analysis results
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sna_results (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    event_log_id TEXT NOT NULL,
    name TEXT NOT NULL,
    analyzed_at TEXT NOT NULL DEFAULT (datetime('now')),
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('handover', 'working_together', 'subcontracting', 'similar_activities')),
    network_data TEXT NOT NULL,  -- JSON
    metrics TEXT DEFAULT '{}',  -- JSON
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_log_id) REFERENCES event_logs(id) ON DELETE CASCADE
);

CREATE INDEX idx_sna_results_tenant ON sna_results(tenant_id, analysis_type, analyzed_at DESC);
CREATE INDEX idx_sna_results_log ON sna_results(event_log_id);

-- -----------------------------------------------------------------------------
-- Table: dashboards
-- Purpose: User-defined dashboard configurations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboards (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    layout TEXT NOT NULL,  -- JSON
    widgets TEXT NOT NULL,  -- JSON
    filters TEXT DEFAULT '[]',  -- JSON array
    refresh_interval_seconds INTEGER DEFAULT 300,
    is_public INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_dashboards_tenant ON dashboards(tenant_id, name);
CREATE INDEX idx_dashboards_public ON dashboards(tenant_id) WHERE is_public = 1;
