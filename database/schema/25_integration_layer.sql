-- ============================================================================
-- INTEGRATION LAYER: APIs, webhooks & extensions
-- ============================================================================
-- This layer handles external connections: API keys, Webhooks, OAuth,
-- and third-party integrations.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: api_keys
-- Purpose: API authentication key
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    environment_id TEXT,  -- NULL for all environments
    created_by TEXT NOT NULL,
    name TEXT NOT NULL,
    key_prefix TEXT NOT NULL,  -- First 8-12 chars for identification (e.g., 'pk_live_')
    key_hash TEXT NOT NULL,  -- SHA-256 hash of full key
    scopes TEXT DEFAULT '[]',  -- JSON array of allowed scopes
    rate_limit INTEGER,  -- Requests per minute, NULL for default
    allowed_ips TEXT,  -- JSON array of allowed IP addresses/CIDRs
    last_used_at TEXT,
    expires_at TEXT,
    revoked_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (environment_id) REFERENCES environments(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- -----------------------------------------------------------------------------
-- Table: webhooks
-- Purpose: Outbound webhook configuration
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhooks (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    secret_hash TEXT NOT NULL,  -- HMAC signing secret hash
    events TEXT NOT NULL,  -- JSON array of event types to trigger on
    is_active INTEGER NOT NULL DEFAULT 1,
    version TEXT NOT NULL DEFAULT 'v1',
    headers TEXT,  -- JSON: custom headers to include
    retry_config TEXT DEFAULT '{"max_retries": 3, "backoff_seconds": [60, 300, 900]}',  -- JSON
    last_triggered_at TEXT,
    failure_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_webhooks_tenant ON webhooks(tenant_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);

-- -----------------------------------------------------------------------------
-- Table: webhook_deliveries
-- Purpose: Webhook delivery attempt log
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id TEXT PRIMARY KEY,
    webhook_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload TEXT NOT NULL,  -- JSON: event payload
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failure', 'retrying')),
    attempts INTEGER NOT NULL DEFAULT 0,
    response_status INTEGER,  -- HTTP status code
    response_body TEXT,
    error TEXT,
    next_retry_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    delivered_at TEXT,
    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
);

CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_retry ON webhook_deliveries(next_retry_at);

-- -----------------------------------------------------------------------------
-- Table: integrations
-- Purpose: Third-party integration configuration
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integrations (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    provider TEXT NOT NULL,  -- e.g., 'salesforce', 'slack', 'jira'
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('oauth', 'api_key', 'webhook', 'custom')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error', 'disabled')),
    config_encrypted TEXT NOT NULL,  -- Encrypted JSON: integration-specific config
    credentials_encrypted TEXT,  -- Encrypted JSON: API keys, tokens, etc.
    scopes TEXT,  -- JSON array of granted scopes
    last_sync_at TEXT,
    sync_status TEXT,  -- JSON: last sync result
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_integrations_tenant ON integrations(tenant_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_status ON integrations(status);

-- -----------------------------------------------------------------------------
-- Table: oauth_tokens
-- Purpose: OAuth tokens for integrations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id TEXT PRIMARY KEY,
    integration_id TEXT NOT NULL,
    user_id TEXT,  -- NULL for app-level tokens
    access_token_enc TEXT NOT NULL,  -- Encrypted access token
    refresh_token_enc TEXT,  -- Encrypted refresh token
    token_type TEXT NOT NULL DEFAULT 'Bearer',
    scope TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_oauth_tokens_integration ON oauth_tokens(integration_id);
CREATE INDEX idx_oauth_tokens_user ON oauth_tokens(user_id);
CREATE INDEX idx_oauth_tokens_expires ON oauth_tokens(expires_at);
