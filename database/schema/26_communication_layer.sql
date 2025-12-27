-- ============================================================================
-- COMMUNICATION LAYER: Notifications & messaging
-- ============================================================================
-- This layer handles information flow: Notifications, Emails, and
-- Announcements across all channels.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: notification_templates
-- Purpose: Notification content template
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_templates (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,  -- NULL for system templates
    key TEXT NOT NULL,  -- e.g., 'welcome_email', 'password_reset', 'invoice_paid'
    name TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app', 'slack', 'webhook')),
    subject_template TEXT,  -- For email/push
    body_template TEXT NOT NULL,  -- Plain text template
    body_html_template TEXT,  -- HTML template for email
    variables TEXT DEFAULT '{}',  -- JSON: available variables and their descriptions
    locale TEXT NOT NULL DEFAULT 'en',
    is_active INTEGER NOT NULL DEFAULT 1,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, key, channel, locale)
);

CREATE INDEX idx_notification_templates_tenant ON notification_templates(tenant_id);
CREATE INDEX idx_notification_templates_key ON notification_templates(key, channel);

-- -----------------------------------------------------------------------------
-- Table: notifications
-- Purpose: Notification instance sent to user
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    template_id TEXT,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app', 'slack')),
    type TEXT NOT NULL,  -- e.g., 'alert', 'reminder', 'update', 'system'
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data TEXT,  -- JSON: additional payload
    action_url TEXT,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
    read_at TEXT,
    sent_at TEXT,
    error TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES notification_templates(id) ON DELETE SET NULL
);

CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_unread ON notifications(user_id, status) WHERE status != 'read';

-- -----------------------------------------------------------------------------
-- Table: email_messages
-- Purpose: Transactional email log
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_messages (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    notification_id TEXT,
    from_address TEXT NOT NULL,
    to_addresses TEXT NOT NULL,  -- JSON array
    cc_addresses TEXT,  -- JSON array
    bcc_addresses TEXT,  -- JSON array
    subject TEXT NOT NULL,
    body_text TEXT,
    body_html TEXT,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'bounced', 'complained', 'failed')),
    provider TEXT NOT NULL,  -- e.g., 'sendgrid', 'ses', 'postmark'
    provider_message_id TEXT,
    opened_at TEXT,
    clicked_at TEXT,
    sent_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE SET NULL
);

CREATE INDEX idx_email_messages_tenant ON email_messages(tenant_id);
CREATE INDEX idx_email_messages_notification ON email_messages(notification_id);
CREATE INDEX idx_email_messages_status ON email_messages(status);
CREATE INDEX idx_email_messages_provider_id ON email_messages(provider_message_id);

-- -----------------------------------------------------------------------------
-- Table: announcements
-- Purpose: System-wide or tenant announcements
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,  -- NULL for system-wide announcements
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'critical', 'maintenance', 'feature')),
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'admins', 'users', 'segment')),
    segment_rules TEXT,  -- JSON: rules for segment targeting
    action_url TEXT,
    starts_at TEXT NOT NULL,
    ends_at TEXT,
    is_dismissible INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_announcements_tenant ON announcements(tenant_id);
CREATE INDEX idx_announcements_active ON announcements(is_active, starts_at, ends_at);
CREATE INDEX idx_announcements_type ON announcements(type);
