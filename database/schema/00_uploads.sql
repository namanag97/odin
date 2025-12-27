-- ============================================================================
-- ADDITIONAL: UPLOADS TABLE (for file handling)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: uploads
-- Purpose: Track uploaded files for import
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT,
    format TEXT CHECK (format IN ('xes', 'csv', 'ocel_json', 'ocel_xml', 'parquet')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'error')),
    file_path TEXT NOT NULL,
    detected_schema TEXT,  -- JSON
    validation_result TEXT,  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_uploads_tenant ON uploads(tenant_id, status);
CREATE INDEX idx_uploads_format ON uploads(tenant_id, format);
