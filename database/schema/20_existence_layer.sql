-- ============================================================================
-- EXISTENCE LAYER: Core identity & multi-tenancy
-- ============================================================================
-- This layer contains the foundational entities that establish organizational
-- boundaries and runtime contexts. The Tenant is the root of all multi-tenancy.
-- ============================================================================

-- Note: The primary `tenants` table is defined in 01_core.sql and should be
-- enhanced with additional columns. This file extends the existence layer.

-- -----------------------------------------------------------------------------
-- Table: organizations
-- Purpose: Logical grouping within tenant (for enterprise)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    parent_org_id TEXT,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('division', 'department', 'unit', 'custom')),
    hierarchy_path TEXT,  -- LTREE equivalent: dot-separated path e.g., 'root.division1.dept1'
    metadata TEXT DEFAULT '{}',  -- JSON
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_org_id) REFERENCES organizations(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, code)
);

CREATE INDEX idx_organizations_tenant ON organizations(tenant_id);
CREATE INDEX idx_organizations_parent ON organizations(parent_org_id);
CREATE INDEX idx_organizations_hierarchy ON organizations(hierarchy_path);

-- -----------------------------------------------------------------------------
-- Table: environments
-- Purpose: Isolated runtime context (prod, staging, dev)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS environments (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('production', 'staging', 'development', 'sandbox')),
    is_default INTEGER NOT NULL DEFAULT 0,
    config TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, name)
);

CREATE INDEX idx_environments_tenant ON environments(tenant_id);
CREATE INDEX idx_environments_default ON environments(tenant_id, is_default);
