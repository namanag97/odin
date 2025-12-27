-- ============================================================================
-- PHASE 11: GRAPH DATABASE INTEGRATION (3 tables)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: graph_projections
-- Purpose: Define what data to project to Neo4j
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS graph_projections (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    source_type TEXT NOT NULL CHECK (source_type IN ('event_log', 'data_pool', 'discovered_model')),
    source_id TEXT NOT NULL,
    projection_config TEXT NOT NULL,  -- JSON
    neo4j_database TEXT DEFAULT 'neo4j',
    sync_mode TEXT DEFAULT 'full' CHECK (sync_mode IN ('full', 'incremental', 'cdc')),
    sync_interval_seconds INTEGER DEFAULT 3600,
    last_sync_at TEXT,
    last_sync_status TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_graph_projections_tenant ON graph_projections(tenant_id, source_type);
CREATE INDEX idx_graph_projections_source ON graph_projections(source_type, source_id);

-- -----------------------------------------------------------------------------
-- Table: graph_sync_log
-- Purpose: Track synchronization between PostgreSQL and Neo4j
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS graph_sync_log (
    id TEXT PRIMARY KEY,
    projection_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'partial')),
    nodes_created INTEGER DEFAULT 0,
    nodes_updated INTEGER DEFAULT 0,
    nodes_deleted INTEGER DEFAULT 0,
    relationships_created INTEGER DEFAULT 0,
    relationships_deleted INTEGER DEFAULT 0,
    error_message TEXT,
    sync_checkpoint TEXT,  -- JSON
    FOREIGN KEY (projection_id) REFERENCES graph_projections(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_graph_sync_log_projection ON graph_sync_log(projection_id, started_at DESC);

-- -----------------------------------------------------------------------------
-- Table: graph_queries
-- Purpose: Store reusable Cypher queries
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS graph_queries (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('process_discovery', 'sna', 'pattern', 'custom')),
    cypher_query TEXT NOT NULL,
    parameters TEXT DEFAULT '[]',  -- JSON array
    return_type TEXT CHECK (return_type IN ('nodes', 'relationships', 'paths', 'scalar', 'table')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_graph_queries_tenant ON graph_queries(tenant_id, category);
