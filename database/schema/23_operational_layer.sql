-- ============================================================================
-- OPERATIONAL LAYER: Configuration & settings
-- ============================================================================
-- This layer handles configuration state: Tenant settings, User preferences,
-- Feature flags, and System configuration.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: tenant_settings
-- Purpose: Tenant-level configuration
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenant_settings (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL UNIQUE,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    date_format TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
    locale TEXT NOT NULL DEFAULT 'en',
    currency TEXT NOT NULL DEFAULT 'USD',
    branding TEXT DEFAULT '{}',  -- JSON: logo, colors, custom CSS
    security_settings TEXT DEFAULT '{}',  -- JSON: password policy, session timeout, etc.
    notification_settings TEXT DEFAULT '{}',  -- JSON: default notification preferences
    feature_flags TEXT DEFAULT '{}',  -- JSON: tenant-specific feature overrides
    custom_fields_schema TEXT DEFAULT '{}',  -- JSON: schema for custom fields
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_tenant_settings_tenant ON tenant_settings(tenant_id);

-- -----------------------------------------------------------------------------
-- Table: user_preferences
-- Purpose: User-level preferences
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT NOT NULL DEFAULT 'en',
    timezone TEXT,  -- NULL means inherit from tenant
    email_notifications TEXT DEFAULT '{}',  -- JSON: per-category email notification settings
    push_notifications TEXT DEFAULT '{}',  -- JSON: per-category push notification settings
    ui_preferences TEXT DEFAULT '{}',  -- JSON: sidebar collapsed, default views, etc.
    accessibility TEXT DEFAULT '{}',  -- JSON: font size, high contrast, etc.
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);

-- -----------------------------------------------------------------------------
-- Table: feature_flags
-- Purpose: Feature toggle definition
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feature_flags (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'boolean' CHECK (type IN ('boolean', 'percentage', 'variant', 'json')),
    default_value TEXT DEFAULT 'false',  -- JSON value
    is_enabled INTEGER NOT NULL DEFAULT 1,
    targeting_rules TEXT DEFAULT '{}',  -- JSON: rules for gradual rollout, user segments, etc.
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);

-- -----------------------------------------------------------------------------
-- Table: feature_flag_overrides
-- Purpose: Feature flag override for tenant/user
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feature_flag_overrides (
    id TEXT PRIMARY KEY,
    feature_flag_id TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('tenant', 'user', 'segment')),
    target_id TEXT NOT NULL,
    value TEXT NOT NULL,  -- JSON value
    expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (feature_flag_id) REFERENCES feature_flags(id) ON DELETE CASCADE,
    UNIQUE (feature_flag_id, target_type, target_id)
);

CREATE INDEX idx_feature_flag_overrides_flag ON feature_flag_overrides(feature_flag_id);
CREATE INDEX idx_feature_flag_overrides_target ON feature_flag_overrides(target_type, target_id);

-- -----------------------------------------------------------------------------
-- Table: system_configs
-- Purpose: Global system configuration
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_configs (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,  -- JSON value
    type TEXT NOT NULL CHECK (type IN ('string', 'number', 'boolean', 'json', 'secret')),
    description TEXT,
    is_sensitive INTEGER NOT NULL DEFAULT 0,
    updated_by TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_system_configs_key ON system_configs(key);
