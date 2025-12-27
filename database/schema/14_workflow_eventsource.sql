-- ============================================================================
-- PHASE 14: TEMPORAL-STYLE EVENT SOURCING FOR WORKFLOWS
-- Purpose: Event-sourced workflow execution (Temporal.io compatible pattern)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: workflow_executions
-- Purpose: Top-level workflow execution records (Temporal WorkflowExecution)
-- Each execution has a unique run_id for retry/continuation tracking
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workflow_executions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    
    -- Workflow identity (Temporal-style)
    workflow_id TEXT NOT NULL,        -- Logical workflow ID (can have multiple runs)
    run_id TEXT NOT NULL,             -- Unique per execution attempt
    
    -- Workflow type binding
    workflow_type TEXT NOT NULL,      -- 'action_flow', 'scheduled_job', 'import_job', etc.
    workflow_type_id TEXT,            -- FK to the definition (e.g., workflows.id)
    
    -- Temporal-style parent-child
    parent_execution_id TEXT,         -- For child workflows
    parent_run_id TEXT,
    
    -- Execution state
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN (
        'running', 'completed', 'failed', 'cancelled', 'terminated', 'timed_out', 'continued_as_new'
    )),
    
    -- Timing
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    timeout_seconds INTEGER,
    
    -- Input/Output
    input TEXT,          -- JSON: workflow input parameters
    output TEXT,         -- JSON: workflow result (on completion)
    error TEXT,          -- Error message (on failure)
    
    -- Retry configuration
    attempt_number INTEGER DEFAULT 1,
    max_attempts INTEGER DEFAULT 3,
    
    -- Search attributes (for querying)
    search_attributes TEXT DEFAULT '{}',  -- JSON: custom searchable fields
    
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_execution_id) REFERENCES workflow_executions(id) ON DELETE SET NULL,
    UNIQUE (workflow_id, run_id)
);

CREATE INDEX idx_workflow_executions_tenant ON workflow_executions(tenant_id, status);
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id, started_at DESC);
CREATE INDEX idx_workflow_executions_type ON workflow_executions(tenant_id, workflow_type, status);
CREATE INDEX idx_workflow_executions_parent ON workflow_executions(parent_execution_id) WHERE parent_execution_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Table: workflow_history
-- Purpose: Immutable event log for workflow execution (Event Sourcing)
-- This is the core of Temporal-style durability - replay from history
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workflow_history (
    id TEXT PRIMARY KEY,
    execution_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    
    -- Event identity (Temporal EventID)
    event_sequence INTEGER NOT NULL,  -- Monotonically increasing within execution
    
    -- Event type (Temporal EventType enum)
    event_type TEXT NOT NULL CHECK (event_type IN (
        -- Workflow lifecycle
        'workflow_execution_started',
        'workflow_execution_completed',
        'workflow_execution_failed',
        'workflow_execution_timed_out',
        'workflow_execution_cancelled',
        'workflow_execution_terminated',
        'workflow_execution_continued_as_new',
        
        -- Activity lifecycle
        'activity_task_scheduled',
        'activity_task_started',
        'activity_task_completed',
        'activity_task_failed',
        'activity_task_timed_out',
        'activity_task_cancelled',
        
        -- Timer events
        'timer_started',
        'timer_fired',
        'timer_cancelled',
        
        -- Signal/Query events
        'workflow_execution_signaled',
        'signal_external_workflow_execution_initiated',
        
        -- Child workflow events
        'start_child_workflow_execution_initiated',
        'child_workflow_execution_started',
        'child_workflow_execution_completed',
        'child_workflow_execution_failed',
        
        -- Markers and side effects
        'marker_recorded',
        'side_effect_recorded',
        
        -- Local activities
        'local_activity_started',
        'local_activity_completed',
        'local_activity_failed'
    )),
    
    -- Event timestamp
    event_timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- Event payload (polymorphic based on event_type)
    event_data TEXT NOT NULL,  -- JSON: event-specific attributes
    
    -- Event metadata
    event_metadata TEXT DEFAULT '{}',  -- JSON: headers, context
    
    FOREIGN KEY (execution_id) REFERENCES workflow_executions(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (execution_id, event_sequence)
);

-- Critical: Index for replay (must be fast)
CREATE INDEX idx_workflow_history_replay ON workflow_history(execution_id, event_sequence);
CREATE INDEX idx_workflow_history_type ON workflow_history(execution_id, event_type);

-- -----------------------------------------------------------------------------
-- Table: workflow_activities
-- Purpose: Activity execution tracking (denormalized for query efficiency)
-- Correlates with workflow_history activity events
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workflow_activities (
    id TEXT PRIMARY KEY,
    execution_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    
    -- Activity identity
    activity_id TEXT NOT NULL,        -- Unique within execution
    activity_type TEXT NOT NULL,      -- Activity/module name
    
    -- Correlation to history events
    scheduled_event_id INTEGER NOT NULL,  -- workflow_history.event_sequence
    started_event_id INTEGER,
    completed_event_id INTEGER,
    
    -- Execution state
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'running', 'completed', 'failed', 'cancelled', 'timed_out'
    )),
    
    -- Timing
    scheduled_at TEXT NOT NULL DEFAULT (datetime('now')),
    started_at TEXT,
    completed_at TEXT,
    
    -- Retry tracking
    attempt_number INTEGER DEFAULT 1,
    max_attempts INTEGER DEFAULT 3,
    
    -- Input/Output
    input TEXT,   -- JSON
    output TEXT,  -- JSON
    error TEXT,
    
    -- Task queue (for worker routing)
    task_queue TEXT DEFAULT 'default',
    
    FOREIGN KEY (execution_id) REFERENCES workflow_executions(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (execution_id, activity_id)
);

CREATE INDEX idx_workflow_activities_execution ON workflow_activities(execution_id, status);
CREATE INDEX idx_workflow_activities_queue ON workflow_activities(task_queue, status) WHERE status = 'scheduled';

-- -----------------------------------------------------------------------------
-- Table: workflow_timers
-- Purpose: Timer tracking for delayed workflow execution
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workflow_timers (
    id TEXT PRIMARY KEY,
    execution_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    
    timer_id TEXT NOT NULL,
    
    -- Timer configuration
    fire_at TEXT NOT NULL,  -- When timer should fire
    duration_seconds INTEGER,  -- Original duration
    
    -- State
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fired', 'cancelled')),
    
    -- History correlation
    started_event_id INTEGER NOT NULL,
    fired_event_id INTEGER,
    
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (execution_id) REFERENCES workflow_executions(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (execution_id, timer_id)
);

CREATE INDEX idx_workflow_timers_fire ON workflow_timers(fire_at, status) WHERE status = 'pending';

-- -----------------------------------------------------------------------------
-- Table: workflow_signals
-- Purpose: External signals sent to workflows
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workflow_signals (
    id TEXT PRIMARY KEY,
    execution_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    
    signal_name TEXT NOT NULL,
    signal_input TEXT,  -- JSON
    
    -- Source tracking
    source_type TEXT,  -- 'api', 'workflow', 'system'
    source_id TEXT,
    
    received_at TEXT NOT NULL DEFAULT (datetime('now')),
    processed_at TEXT,
    
    FOREIGN KEY (execution_id) REFERENCES workflow_executions(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_workflow_signals_execution ON workflow_signals(execution_id, received_at DESC);
