-- ============================================================================
-- PHASE 10: AUTOMATION & ACTIONS (6 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: action_rules
-- Purpose: Define conditions that trigger automated actions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS action_rules (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    event_log_id TEXT,
    data_pool_id TEXT,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('pattern', 'threshold', 'anomaly', 'schedule', 'new_case', 'case_completed')),
    condition TEXT NOT NULL,  -- JSON
    is_active INTEGER DEFAULT 1,
    cooldown_seconds INTEGER DEFAULT 300,
    last_triggered_at TEXT,
    trigger_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_log_id) REFERENCES event_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE CASCADE
);

CREATE INDEX idx_action_rules_tenant ON action_rules(tenant_id, is_active, rule_type);
CREATE INDEX idx_action_rules_log ON action_rules(event_log_id);

-- -----------------------------------------------------------------------------
-- Table: actions
-- Purpose: Define executable actions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS actions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    rule_id TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('webhook', 'email', 'slack', 'create_task', 'update_attribute', 'log')),
    action_order INTEGER DEFAULT 0,
    configuration TEXT NOT NULL,  -- JSON
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (rule_id) REFERENCES action_rules(id) ON DELETE CASCADE
);

CREATE INDEX idx_actions_rule ON actions(rule_id, action_order);

-- -----------------------------------------------------------------------------
-- Table: action_executions
-- Purpose: Log of action executions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS action_executions (
    id TEXT PRIMARY KEY,
    action_id TEXT NOT NULL,
    rule_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    triggered_at TEXT NOT NULL DEFAULT (datetime('now')),
    trigger_context TEXT NOT NULL,  -- JSON
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending', 'skipped')),
    response TEXT,  -- JSON
    error_message TEXT,
    execution_time_ms INTEGER,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE RESTRICT,
    FOREIGN KEY (rule_id) REFERENCES action_rules(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_action_executions_action ON action_executions(action_id, triggered_at DESC);
CREATE INDEX idx_action_executions_status ON action_executions(tenant_id, status, triggered_at DESC);

-- -----------------------------------------------------------------------------
-- Table: workflows
-- Purpose: Multi-step automation workflows
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('rule', 'schedule', 'manual', 'api')),
    trigger_config TEXT DEFAULT '{}',  -- JSON
    is_active INTEGER DEFAULT 1,
    timeout_seconds INTEGER DEFAULT 3600,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_workflows_tenant ON workflows(tenant_id, is_active);

-- -----------------------------------------------------------------------------
-- Table: workflow_steps
-- Purpose: Individual steps in workflows
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workflow_steps (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    step_type TEXT NOT NULL CHECK (step_type IN ('action', 'condition', 'wait', 'parallel', 'loop')),
    configuration TEXT NOT NULL,  -- JSON
    on_success_step_id TEXT,
    on_failure_step_id TEXT,
    timeout_seconds INTEGER,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
    FOREIGN KEY (on_success_step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL,
    FOREIGN KEY (on_failure_step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL
);

CREATE INDEX idx_workflow_steps_workflow ON workflow_steps(workflow_id, step_order);

-- -----------------------------------------------------------------------------
-- Table: scheduled_jobs
-- Purpose: Cron-style scheduled job definitions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    job_type TEXT NOT NULL CHECK (job_type IN ('import', 'discovery', 'conformance', 'prediction', 'workflow', 'metric_compute', 'statistics_refresh')),
    target_id TEXT,
    cron_expression TEXT NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    is_active INTEGER DEFAULT 1,
    next_run_at TEXT,
    last_run_at TEXT,
    last_status TEXT CHECK (last_status IN ('success', 'failed', 'running')),
    configuration TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_scheduled_jobs_next_run ON scheduled_jobs(next_run_at) WHERE is_active = 1;
CREATE INDEX idx_scheduled_jobs_tenant ON scheduled_jobs(tenant_id, job_type);
