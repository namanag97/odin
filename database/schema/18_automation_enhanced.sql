-- ============================================================================
-- ENHANCED AUTOMATION LAYER: Action Flows and Advanced Automation
-- ============================================================================
-- This layer implements the complete automation system with Action Flows,
-- Connections, Webhooks, Skills, Sensors, Signals, and Tasks.
-- Based on Process Intelligence Platform ERD Specification.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: action_flows
-- Purpose: Visual automation workflow (Celonis-style)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS action_flows (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'scheduled', 'event', 'webhook', 'sensor')),
    schedule_id TEXT,
    webhook_id TEXT,
    sensor_id TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'deactivated')),
    consecutive_error_limit INTEGER DEFAULT 3,
    consecutive_error_count INTEGER DEFAULT 0,
    is_data_confidential INTEGER NOT NULL DEFAULT 0,
    timeout_seconds INTEGER DEFAULT 3600,
    max_cycles INTEGER DEFAULT 1,
    auto_commit INTEGER NOT NULL DEFAULT 1,
    sequential_processing INTEGER NOT NULL DEFAULT 0,
    incomplete_executions_enabled INTEGER NOT NULL DEFAULT 0,
    blueprint TEXT NOT NULL,  -- JSON: Module graph definition
    inputs TEXT DEFAULT '[]',  -- JSON
    outputs TEXT DEFAULT '[]',  -- JSON
    last_executed_at TEXT,
    last_execution_status TEXT CHECK (last_execution_status IN ('success', 'warning', 'error')),
    activated_at TEXT,
    deactivated_at TEXT,
    deactivation_reason TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (package_id, key)
);

CREATE INDEX idx_action_flows_package ON action_flows(package_id);
CREATE INDEX idx_action_flows_status ON action_flows(tenant_id, status);
CREATE INDEX idx_action_flows_trigger ON action_flows(tenant_id, trigger_type, status);

-- -----------------------------------------------------------------------------
-- Table: action_flow_modules
-- Purpose: Individual processing step in Action Flow
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS action_flow_modules (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    action_flow_id TEXT NOT NULL,
    parent_module_id TEXT,  -- For error handlers
    module_type TEXT NOT NULL CHECK (module_type IN ('trigger', 'action', 'transformer', 'aggregator', 'router', 'error_handler', 'iterator', 'repeater')),
    app_name TEXT NOT NULL,  -- Slack, HTTP, CSV, etc.
    action_name TEXT NOT NULL,  -- Send Message, Make Request, etc.
    connection_id TEXT,
    position INTEGER NOT NULL,
    configuration TEXT NOT NULL,  -- JSON
    input_mapping TEXT DEFAULT '{}',  -- JSON
    output_mapping TEXT DEFAULT '{}',  -- JSON
    error_handler_type TEXT CHECK (error_handler_type IN ('break', 'resume', 'rollback', 'ignore', 'commit')),
    is_acid INTEGER NOT NULL DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (action_flow_id) REFERENCES action_flows(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_module_id) REFERENCES action_flow_modules(id) ON DELETE SET NULL,
    FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE SET NULL
);

CREATE INDEX idx_action_flow_modules_flow ON action_flow_modules(action_flow_id, position);

-- -----------------------------------------------------------------------------
-- Table: connections
-- Purpose: Authentication link to external systems for Action Flows
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    package_id TEXT,
    name TEXT NOT NULL,
    app_name TEXT NOT NULL,
    connection_type TEXT NOT NULL CHECK (connection_type IN ('oauth2', 'api_key', 'basic', 'celonis_user', 'celonis_app_key', 'custom')),
    credentials TEXT NOT NULL,  -- JSON (encrypted)
    oauth_credentials_id TEXT,
    status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'invalid', 'expired', 'revoked')),
    is_dynamic INTEGER NOT NULL DEFAULT 0,  -- Requires user auth at execution
    last_used_at TEXT,
    last_tested_at TEXT,
    expires_at TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_connections_tenant_app ON connections(tenant_id, app_name);
CREATE INDEX idx_connections_package ON connections(tenant_id, package_id, name);

-- -----------------------------------------------------------------------------
-- Table: action_flow_webhooks
-- Purpose: HTTP endpoint for receiving external triggers for Action Flows
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS action_flow_webhooks (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    action_flow_id TEXT NOT NULL,
    udid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,  -- Generated URL
    secret TEXT,  -- Encrypted
    connection_id TEXT,
    data_structure TEXT,  -- JSON: Expected payload schema
    get_request_headers INTEGER NOT NULL DEFAULT 0,
    get_http_method INTEGER NOT NULL DEFAULT 0,
    json_passthrough INTEGER NOT NULL DEFAULT 0,
    ip_allowlist TEXT DEFAULT '[]',  -- JSON array
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    queue_size INTEGER DEFAULT 0,
    max_queue_size INTEGER DEFAULT 10000,
    last_called_at TEXT,
    expires_at TEXT,  -- 5 days after last inactivity
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (action_flow_id) REFERENCES action_flows(id) ON DELETE CASCADE,
    FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE SET NULL
);

CREATE INDEX idx_action_flow_webhooks_udid ON action_flow_webhooks(udid);
CREATE INDEX idx_action_flow_webhooks_tenant_status ON action_flow_webhooks(tenant_id, status);

-- -----------------------------------------------------------------------------
-- Table: webhook_queues
-- Purpose: Buffered webhook requests awaiting processing
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_queues (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    webhook_id TEXT NOT NULL,
    payload TEXT NOT NULL,  -- JSON
    headers TEXT DEFAULT '{}',  -- JSON
    http_method TEXT DEFAULT 'POST',
    source_ip TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
    processed_at TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (webhook_id) REFERENCES action_flow_webhooks(id) ON DELETE CASCADE
);

CREATE INDEX idx_webhook_queues_webhook ON webhook_queues(webhook_id, status, created_at);

-- -----------------------------------------------------------------------------
-- Table: sensors
-- Purpose: Detector that identifies data conditions and creates Signals
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sensors (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    knowledge_model_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sensor_type TEXT NOT NULL CHECK (sensor_type IN ('record_based', 'data_model_based', 'ml_based')),
    record_id TEXT,
    filter_id TEXT,
    filter_expression TEXT,
    identifier_columns TEXT DEFAULT '[]',  -- JSON array
    additional_columns TEXT DEFAULT '[]',  -- JSON array
    evaluation_trigger TEXT NOT NULL DEFAULT 'data_model_reload' CHECK (evaluation_trigger IN ('data_model_reload', 'km_publish', 'scheduled', 'manual')),
    max_signals_per_evaluation INTEGER DEFAULT 10000,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    last_evaluated_at TEXT,
    last_signal_count INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (knowledge_model_id) REFERENCES knowledge_models(id) ON DELETE CASCADE,
    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE SET NULL,
    FOREIGN KEY (filter_id) REFERENCES filters(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (knowledge_model_id, name)
);

CREATE INDEX idx_sensors_km ON sensors(knowledge_model_id);
CREATE INDEX idx_sensors_status ON sensors(tenant_id, status);

-- -----------------------------------------------------------------------------
-- Table: skills
-- Purpose: Reusable automation combining Sensor + Actions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sensor_id TEXT NOT NULL,
    action_flow_id TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
    signal_count INTEGER DEFAULT 0,
    last_evaluated_at TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
    FOREIGN KEY (action_flow_id) REFERENCES action_flows(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (package_id, key)
);

CREATE INDEX idx_skills_package ON skills(package_id);
CREATE INDEX idx_skills_status ON skills(tenant_id, status);

-- -----------------------------------------------------------------------------
-- Table: signals
-- Purpose: Detected data incident from Sensor
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signals (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    sensor_id TEXT NOT NULL,
    skill_id TEXT,
    record_key TEXT NOT NULL,
    signal_data TEXT NOT NULL,  -- JSON: Record attributes at detection
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'snoozed', 'resolved', 'dismissed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    assignee_id TEXT,
    assigned_at TEXT,
    snoozed_until TEXT,
    resolved_at TEXT,
    resolved_by TEXT,
    resolution_notes TEXT,
    task_id TEXT,
    source_view_id TEXT,
    detected_at TEXT NOT NULL DEFAULT (datetime('now')),
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (source_view_id) REFERENCES views(id) ON DELETE SET NULL
);

CREATE INDEX idx_signals_tenant_status ON signals(tenant_id, status, priority);
CREATE INDEX idx_signals_assignee ON signals(tenant_id, assignee_id, status);
CREATE INDEX idx_signals_sensor ON signals(sensor_id, record_key);

-- -----------------------------------------------------------------------------
-- Table: task_types
-- Purpose: Classification of tasks
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_types (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'check-circle',
    color TEXT DEFAULT '#1890ff',
    default_priority TEXT DEFAULT 'medium',
    attribute_schema TEXT DEFAULT '{}',  -- JSON: Custom fields
    workflow_config TEXT DEFAULT '{}',  -- JSON: State transitions
    sla_config TEXT DEFAULT '{}',  -- JSON: Due date rules
    is_system INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, key)
);

-- -----------------------------------------------------------------------------
-- Table: tasks
-- Purpose: Work item assigned to users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    task_type_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    assignee_id TEXT,
    reporter_id TEXT NOT NULL,
    due_date TEXT,
    started_at TEXT,
    completed_at TEXT,
    related_signal_id TEXT,
    related_record_type TEXT,
    related_record_key TEXT,
    source_view_id TEXT,
    source_action_flow_id TEXT,
    attributes TEXT DEFAULT '{}',  -- JSON
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (task_type_id) REFERENCES task_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (related_signal_id) REFERENCES signals(id) ON DELETE SET NULL,
    FOREIGN KEY (source_view_id) REFERENCES views(id) ON DELETE SET NULL,
    FOREIGN KEY (source_action_flow_id) REFERENCES action_flows(id) ON DELETE SET NULL
);

CREATE INDEX idx_tasks_assignee ON tasks(tenant_id, assignee_id, status);
CREATE INDEX idx_tasks_status ON tasks(tenant_id, status, priority, due_date);
CREATE INDEX idx_tasks_type ON tasks(tenant_id, task_type_id);

-- -----------------------------------------------------------------------------
-- Table: action_flow_executions
-- Purpose: Single run instance of an Action Flow
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS action_flow_executions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    action_flow_id TEXT NOT NULL,
    triggered_by TEXT NOT NULL CHECK (triggered_by IN ('schedule', 'webhook', 'manual', 'sensor', 'api', 'on_demand')),
    triggered_by_user_id TEXT,
    trigger_data TEXT DEFAULT '{}',  -- JSON
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'warning', 'error', 'cancelled')),
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    duration_ms INTEGER,
    cycles_completed INTEGER DEFAULT 0,
    bundles_processed INTEGER DEFAULT 0,
    input_values TEXT DEFAULT '{}',  -- JSON
    output_values TEXT DEFAULT '{}',  -- JSON
    error_message TEXT,
    error_module_id TEXT,
    execution_log TEXT DEFAULT '[]',  -- JSON: Per-module results
    is_data_confidential INTEGER NOT NULL DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (action_flow_id) REFERENCES action_flows(id) ON DELETE CASCADE,
    FOREIGN KEY (triggered_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_action_flow_executions_flow ON action_flow_executions(tenant_id, action_flow_id, created_at DESC);
CREATE INDEX idx_action_flow_executions_status ON action_flow_executions(tenant_id, status);
CREATE INDEX idx_action_flow_executions_trigger ON action_flow_executions(tenant_id, triggered_by, created_at DESC);

-- -----------------------------------------------------------------------------
-- Table: incomplete_executions
-- Purpose: Stored failed execution for retry/manual resolution
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incomplete_executions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    action_flow_id TEXT NOT NULL,
    execution_id TEXT NOT NULL,
    failed_module_id TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_type TEXT NOT NULL,
    bundle_data TEXT NOT NULL,  -- JSON
    remaining_flow TEXT NOT NULL,  -- JSON: Modules not yet executed
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TEXT,
    retry_delay_seconds INTEGER DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'retrying', 'resolved', 'abandoned')),
    resolved_at TEXT,
    resolved_by TEXT,
    resolution_type TEXT CHECK (resolution_type IN ('retry_success', 'manual_resolve', 'deleted')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (action_flow_id) REFERENCES action_flows(id) ON DELETE CASCADE,
    FOREIGN KEY (execution_id) REFERENCES action_flow_executions(id) ON DELETE CASCADE,
    FOREIGN KEY (failed_module_id) REFERENCES action_flow_modules(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_incomplete_executions_flow ON incomplete_executions(tenant_id, action_flow_id, status);
CREATE INDEX idx_incomplete_executions_retry ON incomplete_executions(tenant_id, status, next_retry_at);
