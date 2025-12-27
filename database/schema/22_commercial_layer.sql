-- ============================================================================
-- COMMERCIAL LAYER: Subscription & billing
-- ============================================================================
-- This layer handles the value exchange: Subscriptions, Billing, Plans,
-- Usage metering, and payment processing.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: plans
-- Purpose: Subscription plan definition
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    external_id TEXT,  -- External provider ID (e.g., Stripe price ID)
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'starter', 'professional', 'enterprise', 'custom')),
    billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'quarterly', 'annual', 'custom')),
    base_price REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    is_public INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    trial_days INTEGER NOT NULL DEFAULT 0,
    features TEXT DEFAULT '{}',  -- JSON: feature configuration
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_plans_tier ON plans(tier);
CREATE INDEX idx_plans_active ON plans(is_active, is_public);

-- -----------------------------------------------------------------------------
-- Table: plan_limits
-- Purpose: Quantitative limits per plan
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plan_limits (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    resource_type TEXT NOT NULL,  -- e.g., 'users', 'storage_gb', 'api_calls'
    limit_value INTEGER NOT NULL,
    limit_type TEXT NOT NULL CHECK (limit_type IN ('hard', 'soft', 'metered')),
    reset_interval TEXT NOT NULL DEFAULT 'never' CHECK (reset_interval IN ('never', 'daily', 'weekly', 'monthly', 'billing_cycle')),
    overage_allowed INTEGER NOT NULL DEFAULT 0,
    overage_price REAL,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    UNIQUE (plan_id, resource_type)
);

CREATE INDEX idx_plan_limits_plan ON plan_limits(plan_id);

-- -----------------------------------------------------------------------------
-- Table: plan_features
-- Purpose: Feature flags per plan
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plan_features (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    feature_key TEXT NOT NULL,
    is_enabled INTEGER NOT NULL DEFAULT 1,
    config TEXT,  -- JSON: additional feature configuration
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    UNIQUE (plan_id, feature_key)
);

CREATE INDEX idx_plan_features_plan ON plan_features(plan_id);

-- -----------------------------------------------------------------------------
-- Table: subscriptions
-- Purpose: Tenant subscription to a plan
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    external_id TEXT,  -- External provider subscription ID
    status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'paused', 'incomplete')),
    quantity INTEGER NOT NULL DEFAULT 1,
    billing_anchor_day INTEGER,  -- Day of month for billing
    current_period_start TEXT NOT NULL,
    current_period_end TEXT NOT NULL,
    trial_start TEXT,
    trial_end TEXT,
    canceled_at TEXT,
    cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
);

CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period ON subscriptions(current_period_end);

-- -----------------------------------------------------------------------------
-- Table: payment_methods
-- Purpose: Stored payment methods
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    external_id TEXT NOT NULL,  -- External provider payment method ID
    type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'invoice', 'paypal', 'other')),
    provider TEXT NOT NULL CHECK (provider IN ('stripe', 'braintree', 'adyen', 'manual')),
    is_default INTEGER NOT NULL DEFAULT 0,
    last_four TEXT,
    brand TEXT,
    exp_month INTEGER,
    exp_year INTEGER,
    billing_address TEXT,  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_payment_methods_tenant ON payment_methods(tenant_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(tenant_id, is_default);

-- -----------------------------------------------------------------------------
-- Table: invoices
-- Purpose: Billing invoice
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    subscription_id TEXT,
    external_id TEXT,  -- External provider invoice ID
    number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    currency TEXT NOT NULL DEFAULT 'USD',
    subtotal REAL NOT NULL DEFAULT 0,
    tax REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    amount_paid REAL NOT NULL DEFAULT 0,
    amount_due REAL NOT NULL DEFAULT 0,
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,
    due_date TEXT NOT NULL,
    paid_at TEXT,
    pdf_url TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due ON invoices(due_date);

-- -----------------------------------------------------------------------------
-- Table: invoice_line_items
-- Purpose: Individual invoice line item
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('subscription', 'usage', 'one_time', 'adjustment', 'tax')),
    period_start TEXT,
    period_end TEXT,
    metadata TEXT DEFAULT '{}',  -- JSON
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);

-- -----------------------------------------------------------------------------
-- Table: usage_records
-- Purpose: Metered usage tracking
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usage_records (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    subscription_id TEXT NOT NULL,
    resource_type TEXT NOT NULL,  -- e.g., 'api_calls', 'storage_bytes', 'compute_minutes'
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    idempotency_key TEXT UNIQUE,  -- Prevent duplicate usage reports
    metadata TEXT DEFAULT '{}',  -- JSON
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

CREATE INDEX idx_usage_records_tenant ON usage_records(tenant_id);
CREATE INDEX idx_usage_records_subscription ON usage_records(subscription_id);
CREATE INDEX idx_usage_records_resource ON usage_records(resource_type, timestamp);

-- -----------------------------------------------------------------------------
-- Table: coupons
-- Purpose: Discount coupon
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value REAL NOT NULL,
    currency TEXT,  -- Required for fixed_amount type
    duration TEXT NOT NULL CHECK (duration IN ('once', 'repeating', 'forever')),
    duration_months INTEGER,  -- For repeating duration
    max_redemptions INTEGER,
    times_redeemed INTEGER NOT NULL DEFAULT 0,
    valid_from TEXT NOT NULL,
    valid_until TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    metadata TEXT DEFAULT '{}',  -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active, valid_from, valid_until);
