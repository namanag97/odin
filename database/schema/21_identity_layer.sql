-- ============================================================================
-- IDENTITY LAYER: Authentication & authorization
-- ============================================================================
-- This layer defines who can act in the system: Users, Teams, Roles, and
-- Permissions (RBAC). It handles authentication, sessions, and MFA.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: users
-- Purpose: Human actor in the system
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    external_id TEXT,
    email TEXT NOT NULL,
    email_verified_at TEXT,
    phone TEXT,
    phone_verified_at TEXT,
    password_hash TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'deactivated')),
    type TEXT NOT NULL DEFAULT 'human' CHECK (type IN ('human', 'service', 'bot')),
    last_login_at TEXT,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TEXT,
    mfa_enabled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, email)
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_external_id ON users(tenant_id, external_id);
CREATE INDEX idx_users_status ON users(tenant_id, status);

-- -----------------------------------------------------------------------------
-- Table: user_profiles
-- Purpose: Extended user information
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    locale TEXT DEFAULT 'en',
    bio TEXT,
    job_title TEXT,
    department TEXT,
    custom_fields TEXT DEFAULT '{}',  -- JSON
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);

-- -----------------------------------------------------------------------------
-- Table: user_credentials
-- Purpose: Authentication credentials (SSO, OAuth, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_credentials (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('email', 'google', 'microsoft', 'saml', 'oidc', 'ldap')),
    provider_user_id TEXT NOT NULL,
    access_token_enc TEXT,
    refresh_token_enc TEXT,
    token_expires_at TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (provider, provider_user_id)
);

CREATE INDEX idx_user_credentials_user ON user_credentials(user_id);
CREATE INDEX idx_user_credentials_provider ON user_credentials(provider, provider_user_id);

-- -----------------------------------------------------------------------------
-- Table: identity_providers
-- Purpose: External identity provider configuration
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS identity_providers (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('saml', 'oidc', 'ldap', 'oauth2')),
    is_enabled INTEGER NOT NULL DEFAULT 1,
    is_default INTEGER NOT NULL DEFAULT 0,
    config_encrypted TEXT NOT NULL,
    metadata_url TEXT,
    domain_hints TEXT,  -- JSON array of domain hints
    auto_provision INTEGER NOT NULL DEFAULT 1,
    default_role_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (default_role_id) REFERENCES roles(id) ON DELETE SET NULL
);

CREATE INDEX idx_identity_providers_tenant ON identity_providers(tenant_id);

-- -----------------------------------------------------------------------------
-- Table: sessions
-- Purpose: Active user session
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    device_fingerprint TEXT,
    location TEXT,  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    last_active_at TEXT NOT NULL DEFAULT (datetime('now')),
    revoked_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- -----------------------------------------------------------------------------
-- Table: mfa_devices
-- Purpose: Multi-factor authentication devices
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mfa_devices (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('totp', 'sms', 'email', 'webauthn', 'backup_codes')),
    name TEXT NOT NULL,
    secret_encrypted TEXT NOT NULL,
    is_primary INTEGER NOT NULL DEFAULT 0,
    is_verified INTEGER NOT NULL DEFAULT 0,
    last_used_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_mfa_devices_user ON mfa_devices(user_id);

-- -----------------------------------------------------------------------------
-- Table: teams
-- Purpose: Group of users for collaboration
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    organization_id TEXT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'internal', 'public')),
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, slug)
);

CREATE INDEX idx_teams_tenant ON teams(tenant_id);
CREATE INDEX idx_teams_org ON teams(organization_id);

-- -----------------------------------------------------------------------------
-- Table: team_memberships
-- Purpose: User membership in teams
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_memberships (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'maintainer', 'owner')),
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    invited_by TEXT,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (team_id, user_id)
);

CREATE INDEX idx_team_memberships_team ON team_memberships(team_id);
CREATE INDEX idx_team_memberships_user ON team_memberships(user_id);

-- -----------------------------------------------------------------------------
-- Table: roles
-- Purpose: Named collection of permissions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,  -- NULL for system-wide roles
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'custom' CHECK (type IN ('system', 'custom')),
    scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'organization', 'team', 'resource')),
    is_default INTEGER NOT NULL DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, slug)
);

CREATE INDEX idx_roles_tenant ON roles(tenant_id);
CREATE INDEX idx_roles_type ON roles(type);

-- -----------------------------------------------------------------------------
-- Table: permissions
-- Purpose: Atomic authorization unit
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    category TEXT,
    is_sensitive INTEGER NOT NULL DEFAULT 0,
    UNIQUE (resource, action)
);

CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_category ON permissions(category);

-- -----------------------------------------------------------------------------
-- Table: role_permissions
-- Purpose: Role-permission mapping
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permissions (
    id TEXT PRIMARY KEY,
    role_id TEXT NOT NULL,
    permission_id TEXT NOT NULL,
    conditions TEXT,  -- JSON for ABAC-style conditions
    granted_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- -----------------------------------------------------------------------------
-- Table: role_assignments
-- Purpose: Role assigned to principal (user, team, service account)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_assignments (
    id TEXT PRIMARY KEY,
    role_id TEXT NOT NULL,
    principal_type TEXT NOT NULL CHECK (principal_type IN ('user', 'team', 'service_account')),
    principal_id TEXT NOT NULL,
    scope_type TEXT NOT NULL DEFAULT 'global' CHECK (scope_type IN ('global', 'organization', 'team', 'resource')),
    scope_id TEXT,  -- ID of the scope entity if not global
    granted_by TEXT NOT NULL,
    granted_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_role_assignments_role ON role_assignments(role_id);
CREATE INDEX idx_role_assignments_principal ON role_assignments(principal_type, principal_id);
CREATE INDEX idx_role_assignments_scope ON role_assignments(scope_type, scope_id);
