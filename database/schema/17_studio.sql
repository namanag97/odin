-- ============================================================================
-- STUDIO LAYER: UI and visualization entities
-- ============================================================================
-- This layer implements the Studio/UI layer for dashboards and applications,
-- containing Spaces, Packages, Views, Components, and Tabs.
-- Based on Process Intelligence Platform ERD Specification.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: spaces
-- Purpose: Organizational container for packages
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spaces (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'folder',
    color TEXT DEFAULT '#1890ff',
    is_default INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    sort_order INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, name)
);

CREATE INDEX idx_spaces_tenant ON spaces(tenant_id);
CREATE INDEX idx_spaces_order ON spaces(tenant_id, sort_order);

-- -----------------------------------------------------------------------------
-- Table: packages
-- Purpose: Container for Studio assets (Views, KMs, Action Flows)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    space_id TEXT NOT NULL,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'box',
    color TEXT DEFAULT '#1890ff',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    version TEXT DEFAULT '1.0.0',
    is_template INTEGER NOT NULL DEFAULT 0,
    source_package_id TEXT,  -- If created from template
    data_model_variable_id TEXT,
    published_at TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE,
    FOREIGN KEY (source_package_id) REFERENCES packages(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (tenant_id, key)
);

CREATE INDEX idx_packages_space ON packages(space_id);
CREATE INDEX idx_packages_status ON packages(tenant_id, space_id, status);

-- -----------------------------------------------------------------------------
-- Table: views
-- Purpose: Interactive dashboard/application
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS views (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    knowledge_model_id TEXT NOT NULL,
    base_view_id TEXT,  -- For extension views
    view_type TEXT NOT NULL DEFAULT 'standard' CHECK (view_type IN ('standard', 'profile', 'extension')),
    layout_mode TEXT NOT NULL DEFAULT 'scale_to_fit' CHECK (layout_mode IN ('scale_to_fit', 'custom_height')),
    layout_config TEXT DEFAULT '{}',  -- JSON: Grid layout configuration
    icon TEXT DEFAULT 'layout',
    thumbnail_url TEXT,
    is_home INTEGER NOT NULL DEFAULT 0,
    is_published_to_apps INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    version INTEGER NOT NULL DEFAULT 1,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (knowledge_model_id) REFERENCES knowledge_models(id) ON DELETE RESTRICT,
    FOREIGN KEY (base_view_id) REFERENCES views(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (package_id, key)
);

CREATE INDEX idx_views_package ON views(package_id);
CREATE INDEX idx_views_km ON views(knowledge_model_id);
CREATE INDEX idx_views_order ON views(package_id, sort_order);

-- -----------------------------------------------------------------------------
-- Table: components
-- Purpose: UI component within a View
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS components (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    view_id TEXT NOT NULL,
    parent_id TEXT,  -- For nested components
    component_type TEXT NOT NULL CHECK (component_type IN (
        'chart', 'table', 'kpi_list', 'process_explorer', 'variant_explorer',
        'text', 'button', 'input', 'filter_bar', 'tab', 'container',
        'action_button', 'image', 'custom'
    )),
    key TEXT NOT NULL,
    title TEXT,
    description TEXT,
    layout_position TEXT NOT NULL,  -- JSON: x, y, width, height
    data_config TEXT DEFAULT '{}',  -- JSON: PQL queries, record refs
    visual_config TEXT DEFAULT '{}',  -- JSON: Colors, formats, etc.
    interaction_config TEXT DEFAULT '{}',  -- JSON: Filters, selections, links
    is_visible INTEGER NOT NULL DEFAULT 1,
    visibility_expression TEXT,  -- Dynamic visibility
    sort_order INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (view_id) REFERENCES views(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES components(id) ON DELETE CASCADE,
    UNIQUE (view_id, key)
);

CREATE INDEX idx_components_view ON components(view_id);
CREATE INDEX idx_components_parent ON components(view_id, parent_id, sort_order);

-- -----------------------------------------------------------------------------
-- Table: view_tabs
-- Purpose: Tab container within a View
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS view_tabs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    view_id TEXT NOT NULL,
    key TEXT NOT NULL,
    title TEXT NOT NULL,
    icon TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL,
    visibility_expression TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (view_id) REFERENCES views(id) ON DELETE CASCADE,
    UNIQUE (view_id, key)
);

CREATE INDEX idx_view_tabs_view ON view_tabs(view_id, sort_order);
