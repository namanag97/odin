-- ============================================================================
-- TEMPORAL LAYER: Audit, history & compliance
-- ============================================================================
-- This layer handles time-bound truth: Audit logs, Entity history,
-- Compliance records, and Scheduled jobs.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: audit_logs
-- Purpose: Immutable action audit trail
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'service', 'system', 'api_key')),
    actor_id TEXT NOT NULL,
    actor_email TEXT,
    action TEXT NOT NULL,  -- e.g., 'create', 'update', 'delete', 'login', 'export'
    resource_type TEXT NOT NULL,  -- e.g., 'user', 'team', 'data_pool'
    resource_id TEXT NOT NULL,
    resource_name TEXT,
    changes TEXT,  -- JSON: before/after for updates
    metadata TEXT DEFAULT '{}',  -- JSON: additional context
    ip_address TEXT,
    user_agent TEXT,
    request_id TEXT,  -- Correlation ID for distributed tracing
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Audit logs are append-only; indexes optimized for queries
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_type, actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);

-- -----------------------------------------------------------------------------
-- Table: entity_history
-- Purpose: Version history for entities (temporal versioning)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entity_history (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete', 'restore')),
    data_before TEXT,  -- JSON: entity state before change
    data_after TEXT,  -- JSON: entity state after change
    changed_fields TEXT,  -- JSON array of field names that changed
    changed_by TEXT,
    changed_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (entity_type, entity_id, version)
);

CREATE INDEX idx_entity_history_entity ON entity_history(entity_type, entity_id, version DESC);
CREATE INDEX idx_entity_history_changed_by ON entity_history(changed_by);

-- -----------------------------------------------------------------------------
-- Table: data_retention_policies
-- Purpose: Data retention and archival rules
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,  -- NULL for system-wide policies
    entity_type TEXT NOT NULL,
    retention_days INTEGER NOT NULL,
    archive_after_days INTEGER,
    delete_after_archive_days INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    last_applied_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, entity_type)
);

CREATE INDEX idx_data_retention_policies_tenant ON data_retention_policies(tenant_id);
CREATE INDEX idx_data_retention_policies_entity ON data_retention_policies(entity_type);

-- -----------------------------------------------------------------------------
-- Table: compliance_records
-- Purpose: Compliance evidence and attestation
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compliance_records (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    framework TEXT NOT NULL CHECK (framework IN ('gdpr', 'hipaa', 'soc2', 'iso27001', 'ccpa', 'custom')),
    requirement_id TEXT NOT NULL,  -- e.g., 'GDPR-7.1', 'SOC2-CC6.1'
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'compliant', 'non_compliant', 'not_applicable')),
    evidence_type TEXT,  -- e.g., 'document', 'screenshot', 'log', 'attestation'
    evidence TEXT DEFAULT '{}',  -- JSON: evidence details
    assessed_at TEXT NOT NULL,
    assessed_by TEXT NOT NULL,
    next_review_at TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (assessed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_compliance_records_tenant ON compliance_records(tenant_id);
CREATE INDEX idx_compliance_records_framework ON compliance_records(framework, status);
CREATE INDEX idx_compliance_records_review ON compliance_records(next_review_at);

-- -----------------------------------------------------------------------------
-- Note: Scheduled jobs and job executions are defined in 10_automation.sql
-- The scheduled_jobs table in automation handles process mining specific jobs.
-- For general-purpose scheduled tasks, extend that table or use the existing
-- workflow infrastructure in 14_workflow_eventsource.sql.
-- -----------------------------------------------------------------------------

