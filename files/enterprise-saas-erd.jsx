import React, { useState } from 'react';

const EnterpriseSaaSERD = () => {
  const [activeLayer, setActiveLayer] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);

  const ontologicalLayers = [
    { id: 'existence', name: 'Existence Layer', color: '#1e3a5f', desc: 'Core identity & multi-tenancy' },
    { id: 'identity', name: 'Identity Layer', color: '#2d5a87', desc: 'Authentication & authorization' },
    { id: 'commercial', name: 'Commercial Layer', color: '#3d7aaf', desc: 'Subscription & billing' },
    { id: 'operational', name: 'Operational Layer', color: '#4a9ad4', desc: 'Configuration & settings' },
    { id: 'temporal', name: 'Temporal Layer', color: '#6bb3e0', desc: 'Audit, history & compliance' },
    { id: 'integration', name: 'Integration Layer', color: '#8ecae6', desc: 'APIs, webhooks & extensions' },
    { id: 'communication', name: 'Communication Layer', color: '#a8dadc', desc: 'Notifications & messaging' },
    { id: 'domain', name: 'Domain Layer', color: '#c7e9ef', desc: 'Your functional domain entities' },
  ];

  const entities = {
    existence: [
      {
        name: 'Tenant',
        desc: 'Root organizational boundary',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'external_id', type: 'VARCHAR(50)', unique: true },
          { name: 'name', type: 'VARCHAR(255)' },
          { name: 'slug', type: 'VARCHAR(100)', unique: true },
          { name: 'type', type: 'ENUM', values: ['individual', 'team', 'enterprise'] },
          { name: 'status', type: 'ENUM', values: ['provisioning', 'active', 'suspended', 'terminated'] },
          { name: 'tier', type: 'ENUM', values: ['free', 'starter', 'professional', 'enterprise'] },
          { name: 'metadata', type: 'JSONB' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
          { name: 'updated_at', type: 'TIMESTAMPTZ' },
          { name: 'deleted_at', type: 'TIMESTAMPTZ', nullable: true },
        ],
        relations: ['TenantSettings', 'Subscription', 'User', 'Team', 'ApiKey']
      },
      {
        name: 'Organization',
        desc: 'Logical grouping within tenant (for enterprise)',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'parent_org_id', type: 'UUID', fk: 'Organization', nullable: true },
          { name: 'name', type: 'VARCHAR(255)' },
          { name: 'code', type: 'VARCHAR(50)' },
          { name: 'type', type: 'ENUM', values: ['division', 'department', 'unit', 'custom'] },
          { name: 'hierarchy_path', type: 'LTREE' },
          { name: 'metadata', type: 'JSONB' },
          { name: 'is_active', type: 'BOOLEAN' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant', 'User', 'Team']
      },
      {
        name: 'Environment',
        desc: 'Isolated runtime context (prod, staging, dev)',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'type', type: 'ENUM', values: ['production', 'staging', 'development', 'sandbox'] },
          { name: 'is_default', type: 'BOOLEAN' },
          { name: 'config', type: 'JSONB' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant', 'ApiKey']
      },
    ],
    identity: [
      {
        name: 'User',
        desc: 'Human actor in the system',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'external_id', type: 'VARCHAR(255)', nullable: true },
          { name: 'email', type: 'VARCHAR(320)' },
          { name: 'email_verified_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'phone', type: 'VARCHAR(20)', nullable: true },
          { name: 'phone_verified_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'password_hash', type: 'VARCHAR(255)', nullable: true },
          { name: 'status', type: 'ENUM', values: ['pending', 'active', 'suspended', 'deactivated'] },
          { name: 'type', type: 'ENUM', values: ['human', 'service', 'bot'] },
          { name: 'last_login_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'failed_login_attempts', type: 'INTEGER', default: 0 },
          { name: 'locked_until', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'mfa_enabled', type: 'BOOLEAN', default: false },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
          { name: 'updated_at', type: 'TIMESTAMPTZ' },
          { name: 'deleted_at', type: 'TIMESTAMPTZ', nullable: true },
        ],
        relations: ['Tenant', 'UserProfile', 'UserCredential', 'RoleAssignment', 'Session']
      },
      {
        name: 'UserProfile',
        desc: 'Extended user information',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'user_id', type: 'UUID', fk: 'User', unique: true },
          { name: 'first_name', type: 'VARCHAR(100)' },
          { name: 'last_name', type: 'VARCHAR(100)' },
          { name: 'display_name', type: 'VARCHAR(200)' },
          { name: 'avatar_url', type: 'TEXT', nullable: true },
          { name: 'timezone', type: 'VARCHAR(50)' },
          { name: 'locale', type: 'VARCHAR(10)' },
          { name: 'bio', type: 'TEXT', nullable: true },
          { name: 'job_title', type: 'VARCHAR(100)', nullable: true },
          { name: 'department', type: 'VARCHAR(100)', nullable: true },
          { name: 'custom_fields', type: 'JSONB' },
          { name: 'updated_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['User']
      },
      {
        name: 'UserCredential',
        desc: 'Authentication credentials (SSO, OAuth, etc.)',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'user_id', type: 'UUID', fk: 'User' },
          { name: 'provider', type: 'ENUM', values: ['email', 'google', 'microsoft', 'saml', 'oidc', 'ldap'] },
          { name: 'provider_user_id', type: 'VARCHAR(255)' },
          { name: 'access_token_enc', type: 'TEXT', nullable: true },
          { name: 'refresh_token_enc', type: 'TEXT', nullable: true },
          { name: 'token_expires_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'metadata', type: 'JSONB' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
          { name: 'updated_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['User', 'IdentityProvider']
      },
      {
        name: 'IdentityProvider',
        desc: 'External identity provider configuration',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'type', type: 'ENUM', values: ['saml', 'oidc', 'ldap', 'oauth2'] },
          { name: 'is_enabled', type: 'BOOLEAN' },
          { name: 'is_default', type: 'BOOLEAN' },
          { name: 'config_encrypted', type: 'TEXT' },
          { name: 'metadata_url', type: 'TEXT', nullable: true },
          { name: 'domain_hints', type: 'VARCHAR[]' },
          { name: 'auto_provision', type: 'BOOLEAN', default: true },
          { name: 'default_role_id', type: 'UUID', fk: 'Role', nullable: true },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant', 'Role']
      },
      {
        name: 'Session',
        desc: 'Active user session',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'user_id', type: 'UUID', fk: 'User' },
          { name: 'token_hash', type: 'VARCHAR(64)' },
          { name: 'ip_address', type: 'INET' },
          { name: 'user_agent', type: 'TEXT' },
          { name: 'device_fingerprint', type: 'VARCHAR(64)', nullable: true },
          { name: 'location', type: 'JSONB', nullable: true },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
          { name: 'expires_at', type: 'TIMESTAMPTZ' },
          { name: 'last_active_at', type: 'TIMESTAMPTZ' },
          { name: 'revoked_at', type: 'TIMESTAMPTZ', nullable: true },
        ],
        relations: ['User']
      },
      {
        name: 'MfaDevice',
        desc: 'Multi-factor authentication devices',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'user_id', type: 'UUID', fk: 'User' },
          { name: 'type', type: 'ENUM', values: ['totp', 'sms', 'email', 'webauthn', 'backup_codes'] },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'secret_encrypted', type: 'TEXT' },
          { name: 'is_primary', type: 'BOOLEAN' },
          { name: 'is_verified', type: 'BOOLEAN' },
          { name: 'last_used_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['User']
      },
      {
        name: 'Team',
        desc: 'Group of users for collaboration',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'organization_id', type: 'UUID', fk: 'Organization', nullable: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'slug', type: 'VARCHAR(100)' },
          { name: 'description', type: 'TEXT', nullable: true },
          { name: 'visibility', type: 'ENUM', values: ['private', 'internal', 'public'] },
          { name: 'metadata', type: 'JSONB' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant', 'Organization', 'TeamMembership']
      },
      {
        name: 'TeamMembership',
        desc: 'User membership in teams',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'team_id', type: 'UUID', fk: 'Team' },
          { name: 'user_id', type: 'UUID', fk: 'User' },
          { name: 'role', type: 'ENUM', values: ['member', 'maintainer', 'owner'] },
          { name: 'joined_at', type: 'TIMESTAMPTZ' },
          { name: 'invited_by', type: 'UUID', fk: 'User', nullable: true },
        ],
        relations: ['Team', 'User']
      },
      {
        name: 'Role',
        desc: 'Named collection of permissions',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant', nullable: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'slug', type: 'VARCHAR(100)' },
          { name: 'description', type: 'TEXT' },
          { name: 'type', type: 'ENUM', values: ['system', 'custom'] },
          { name: 'scope', type: 'ENUM', values: ['global', 'organization', 'team', 'resource'] },
          { name: 'is_default', type: 'BOOLEAN' },
          { name: 'metadata', type: 'JSONB' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant', 'RolePermission', 'RoleAssignment']
      },
      {
        name: 'Permission',
        desc: 'Atomic authorization unit',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'resource', type: 'VARCHAR(100)' },
          { name: 'action', type: 'VARCHAR(50)' },
          { name: 'description', type: 'TEXT' },
          { name: 'category', type: 'VARCHAR(50)' },
          { name: 'is_sensitive', type: 'BOOLEAN', default: false },
        ],
        relations: ['RolePermission']
      },
      {
        name: 'RolePermission',
        desc: 'Role-permission mapping',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'role_id', type: 'UUID', fk: 'Role' },
          { name: 'permission_id', type: 'UUID', fk: 'Permission' },
          { name: 'conditions', type: 'JSONB', nullable: true },
          { name: 'granted_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Role', 'Permission']
      },
      {
        name: 'RoleAssignment',
        desc: 'Role assigned to principal',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'role_id', type: 'UUID', fk: 'Role' },
          { name: 'principal_type', type: 'ENUM', values: ['user', 'team', 'service_account'] },
          { name: 'principal_id', type: 'UUID' },
          { name: 'scope_type', type: 'ENUM', values: ['global', 'organization', 'team', 'resource'] },
          { name: 'scope_id', type: 'UUID', nullable: true },
          { name: 'granted_by', type: 'UUID', fk: 'User' },
          { name: 'granted_at', type: 'TIMESTAMPTZ' },
          { name: 'expires_at', type: 'TIMESTAMPTZ', nullable: true },
        ],
        relations: ['Role', 'User']
      },
    ],
    commercial: [
      {
        name: 'Plan',
        desc: 'Subscription plan definition',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'external_id', type: 'VARCHAR(100)' },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'slug', type: 'VARCHAR(100)', unique: true },
          { name: 'description', type: 'TEXT' },
          { name: 'tier', type: 'ENUM', values: ['free', 'starter', 'professional', 'enterprise', 'custom'] },
          { name: 'billing_interval', type: 'ENUM', values: ['monthly', 'quarterly', 'annual', 'custom'] },
          { name: 'base_price', type: 'DECIMAL(12,4)' },
          { name: 'currency', type: 'VARCHAR(3)' },
          { name: 'is_public', type: 'BOOLEAN' },
          { name: 'is_active', type: 'BOOLEAN' },
          { name: 'trial_days', type: 'INTEGER', default: 0 },
          { name: 'features', type: 'JSONB' },
          { name: 'metadata', type: 'JSONB' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['PlanLimit', 'PlanFeature', 'Subscription']
      },
      {
        name: 'PlanLimit',
        desc: 'Quantitative limits per plan',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'plan_id', type: 'UUID', fk: 'Plan' },
          { name: 'resource_type', type: 'VARCHAR(100)' },
          { name: 'limit_value', type: 'BIGINT' },
          { name: 'limit_type', type: 'ENUM', values: ['hard', 'soft', 'metered'] },
          { name: 'reset_interval', type: 'ENUM', values: ['never', 'daily', 'weekly', 'monthly', 'billing_cycle'] },
          { name: 'overage_allowed', type: 'BOOLEAN' },
          { name: 'overage_price', type: 'DECIMAL(12,4)', nullable: true },
        ],
        relations: ['Plan']
      },
      {
        name: 'PlanFeature',
        desc: 'Feature flags per plan',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'plan_id', type: 'UUID', fk: 'Plan' },
          { name: 'feature_key', type: 'VARCHAR(100)' },
          { name: 'is_enabled', type: 'BOOLEAN' },
          { name: 'config', type: 'JSONB', nullable: true },
        ],
        relations: ['Plan']
      },
      {
        name: 'Subscription',
        desc: 'Tenant subscription to a plan',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'plan_id', type: 'UUID', fk: 'Plan' },
          { name: 'external_id', type: 'VARCHAR(255)', nullable: true },
          { name: 'status', type: 'ENUM', values: ['trialing', 'active', 'past_due', 'canceled', 'paused', 'incomplete'] },
          { name: 'quantity', type: 'INTEGER', default: 1 },
          { name: 'billing_anchor_day', type: 'INTEGER' },
          { name: 'current_period_start', type: 'TIMESTAMPTZ' },
          { name: 'current_period_end', type: 'TIMESTAMPTZ' },
          { name: 'trial_start', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'trial_end', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'canceled_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'cancel_at_period_end', type: 'BOOLEAN', default: false },
          { name: 'metadata', type: 'JSONB' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
          { name: 'updated_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant', 'Plan', 'Invoice', 'UsageRecord']
      },
      {
        name: 'PaymentMethod',
        desc: 'Stored payment methods',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'external_id', type: 'VARCHAR(255)' },
          { name: 'type', type: 'ENUM', values: ['card', 'bank_account', 'invoice', 'paypal', 'other'] },
          { name: 'provider', type: 'ENUM', values: ['stripe', 'braintree', 'adyen', 'manual'] },
          { name: 'is_default', type: 'BOOLEAN' },
          { name: 'last_four', type: 'VARCHAR(4)', nullable: true },
          { name: 'brand', type: 'VARCHAR(50)', nullable: true },
          { name: 'exp_month', type: 'INTEGER', nullable: true },
          { name: 'exp_year', type: 'INTEGER', nullable: true },
          { name: 'billing_address', type: 'JSONB', nullable: true },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant']
      },
      {
        name: 'Invoice',
        desc: 'Billing invoice',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'subscription_id', type: 'UUID', fk: 'Subscription', nullable: true },
          { name: 'external_id', type: 'VARCHAR(255)', nullable: true },
          { name: 'number', type: 'VARCHAR(50)', unique: true },
          { name: 'status', type: 'ENUM', values: ['draft', 'open', 'paid', 'void', 'uncollectible'] },
          { name: 'currency', type: 'VARCHAR(3)' },
          { name: 'subtotal', type: 'DECIMAL(12,2)' },
          { name: 'tax', type: 'DECIMAL(12,2)' },
          { name: 'total', type: 'DECIMAL(12,2)' },
          { name: 'amount_paid', type: 'DECIMAL(12,2)' },
          { name: 'amount_due', type: 'DECIMAL(12,2)' },
          { name: 'period_start', type: 'TIMESTAMPTZ' },
          { name: 'period_end', type: 'TIMESTAMPTZ' },
          { name: 'due_date', type: 'DATE' },
          { name: 'paid_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'pdf_url', type: 'TEXT', nullable: true },
          { name: 'metadata', type: 'JSONB' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant', 'Subscription', 'InvoiceLineItem']
      },
      {
        name: 'InvoiceLineItem',
        desc: 'Individual invoice line item',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'invoice_id', type: 'UUID', fk: 'Invoice' },
          { name: 'description', type: 'TEXT' },
          { name: 'quantity', type: 'DECIMAL(12,4)' },
          { name: 'unit_price', type: 'DECIMAL(12,4)' },
          { name: 'amount', type: 'DECIMAL(12,2)' },
          { name: 'type', type: 'ENUM', values: ['subscription', 'usage', 'one_time', 'adjustment', 'tax'] },
          { name: 'period_start', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'period_end', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'metadata', type: 'JSONB' },
        ],
        relations: ['Invoice']
      },
      {
        name: 'UsageRecord',
        desc: 'Metered usage tracking',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'subscription_id', type: 'UUID', fk: 'Subscription' },
          { name: 'resource_type', type: 'VARCHAR(100)' },
          { name: 'quantity', type: 'DECIMAL(18,6)' },
          { name: 'unit', type: 'VARCHAR(50)' },
          { name: 'timestamp', type: 'TIMESTAMPTZ' },
          { name: 'idempotency_key', type: 'VARCHAR(255)', unique: true },
          { name: 'metadata', type: 'JSONB' },
        ],
        relations: ['Tenant', 'Subscription']
      },
      {
        name: 'Coupon',
        desc: 'Discount coupon',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'code', type: 'VARCHAR(50)', unique: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'discount_type', type: 'ENUM', values: ['percentage', 'fixed_amount'] },
          { name: 'discount_value', type: 'DECIMAL(12,4)' },
          { name: 'currency', type: 'VARCHAR(3)', nullable: true },
          { name: 'duration', type: 'ENUM', values: ['once', 'repeating', 'forever'] },
          { name: 'duration_months', type: 'INTEGER', nullable: true },
          { name: 'max_redemptions', type: 'INTEGER', nullable: true },
          { name: 'times_redeemed', type: 'INTEGER', default: 0 },
          { name: 'valid_from', type: 'TIMESTAMPTZ' },
          { name: 'valid_until', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'is_active', type: 'BOOLEAN' },
          { name: 'metadata', type: 'JSONB' },
        ],
        relations: []
      },
    ],
    operational: [
      {
        name: 'TenantSettings',
        desc: 'Tenant-level configuration',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant', unique: true },
          { name: 'timezone', type: 'VARCHAR(50)' },
          { name: 'date_format', type: 'VARCHAR(20)' },
          { name: 'locale', type: 'VARCHAR(10)' },
          { name: 'currency', type: 'VARCHAR(3)' },
          { name: 'branding', type: 'JSONB' },
          { name: 'security_settings', type: 'JSONB' },
          { name: 'notification_settings', type: 'JSONB' },
          { name: 'feature_flags', type: 'JSONB' },
          { name: 'custom_fields_schema', type: 'JSONB' },
          { name: 'updated_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant']
      },
      {
        name: 'UserPreferences',
        desc: 'User-level preferences',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'user_id', type: 'UUID', fk: 'User', unique: true },
          { name: 'theme', type: 'ENUM', values: ['light', 'dark', 'system'] },
          { name: 'language', type: 'VARCHAR(10)' },
          { name: 'timezone', type: 'VARCHAR(50)', nullable: true },
          { name: 'email_notifications', type: 'JSONB' },
          { name: 'push_notifications', type: 'JSONB' },
          { name: 'ui_preferences', type: 'JSONB' },
          { name: 'accessibility', type: 'JSONB' },
          { name: 'updated_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['User']
      },
      {
        name: 'FeatureFlag',
        desc: 'Feature toggle definition',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'key', type: 'VARCHAR(100)', unique: true },
          { name: 'name', type: 'VARCHAR(200)' },
          { name: 'description', type: 'TEXT' },
          { name: 'type', type: 'ENUM', values: ['boolean', 'percentage', 'variant', 'json'] },
          { name: 'default_value', type: 'JSONB' },
          { name: 'is_enabled', type: 'BOOLEAN' },
          { name: 'targeting_rules', type: 'JSONB' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
          { name: 'updated_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['FeatureFlagOverride']
      },
      {
        name: 'FeatureFlagOverride',
        desc: 'Feature flag override for tenant/user',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'feature_flag_id', type: 'UUID', fk: 'FeatureFlag' },
          { name: 'target_type', type: 'ENUM', values: ['tenant', 'user', 'segment'] },
          { name: 'target_id', type: 'UUID' },
          { name: 'value', type: 'JSONB' },
          { name: 'expires_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['FeatureFlag']
      },
      {
        name: 'SystemConfig',
        desc: 'Global system configuration',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'key', type: 'VARCHAR(200)', unique: true },
          { name: 'value', type: 'JSONB' },
          { name: 'type', type: 'ENUM', values: ['string', 'number', 'boolean', 'json', 'secret'] },
          { name: 'description', type: 'TEXT' },
          { name: 'is_sensitive', type: 'BOOLEAN' },
          { name: 'updated_by', type: 'UUID', fk: 'User', nullable: true },
          { name: 'updated_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['User']
      },
    ],
    temporal: [
      {
        name: 'AuditLog',
        desc: 'Immutable action audit trail',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'actor_type', type: 'ENUM', values: ['user', 'service', 'system', 'api_key'] },
          { name: 'actor_id', type: 'UUID' },
          { name: 'actor_email', type: 'VARCHAR(320)', nullable: true },
          { name: 'action', type: 'VARCHAR(100)' },
          { name: 'resource_type', type: 'VARCHAR(100)' },
          { name: 'resource_id', type: 'UUID' },
          { name: 'resource_name', type: 'VARCHAR(255)', nullable: true },
          { name: 'changes', type: 'JSONB', nullable: true },
          { name: 'metadata', type: 'JSONB' },
          { name: 'ip_address', type: 'INET', nullable: true },
          { name: 'user_agent', type: 'TEXT', nullable: true },
          { name: 'request_id', type: 'VARCHAR(100)', nullable: true },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant']
      },
      {
        name: 'EntityHistory',
        desc: 'Version history for entities',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'entity_type', type: 'VARCHAR(100)' },
          { name: 'entity_id', type: 'UUID' },
          { name: 'version', type: 'INTEGER' },
          { name: 'operation', type: 'ENUM', values: ['create', 'update', 'delete', 'restore'] },
          { name: 'data_before', type: 'JSONB', nullable: true },
          { name: 'data_after', type: 'JSONB', nullable: true },
          { name: 'changed_fields', type: 'VARCHAR[]' },
          { name: 'changed_by', type: 'UUID', nullable: true },
          { name: 'changed_at', type: 'TIMESTAMPTZ' },
        ],
        relations: []
      },
      {
        name: 'DataRetentionPolicy',
        desc: 'Data retention and archival rules',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant', nullable: true },
          { name: 'entity_type', type: 'VARCHAR(100)' },
          { name: 'retention_days', type: 'INTEGER' },
          { name: 'archive_after_days', type: 'INTEGER', nullable: true },
          { name: 'delete_after_archive_days', type: 'INTEGER', nullable: true },
          { name: 'is_active', type: 'BOOLEAN' },
          { name: 'last_applied_at', type: 'TIMESTAMPTZ', nullable: true },
        ],
        relations: ['Tenant']
      },
      {
        name: 'ComplianceRecord',
        desc: 'Compliance evidence and attestation',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'framework', type: 'ENUM', values: ['gdpr', 'hipaa', 'soc2', 'iso27001', 'ccpa', 'custom'] },
          { name: 'requirement_id', type: 'VARCHAR(100)' },
          { name: 'status', type: 'ENUM', values: ['pending', 'in_progress', 'compliant', 'non_compliant', 'not_applicable'] },
          { name: 'evidence_type', type: 'VARCHAR(100)' },
          { name: 'evidence', type: 'JSONB' },
          { name: 'assessed_at', type: 'TIMESTAMPTZ' },
          { name: 'assessed_by', type: 'UUID', fk: 'User' },
          { name: 'next_review_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'notes', type: 'TEXT', nullable: true },
        ],
        relations: ['Tenant', 'User']
      },
      {
        name: 'ScheduledJob',
        desc: 'Scheduled/recurring job definitions',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant', nullable: true },
          { name: 'name', type: 'VARCHAR(200)' },
          { name: 'job_type', type: 'VARCHAR(100)' },
          { name: 'schedule', type: 'VARCHAR(100)' },
          { name: 'timezone', type: 'VARCHAR(50)' },
          { name: 'payload', type: 'JSONB' },
          { name: 'status', type: 'ENUM', values: ['active', 'paused', 'disabled'] },
          { name: 'last_run_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'last_run_status', type: 'ENUM', values: ['success', 'failure', 'timeout', 'skipped'] },
          { name: 'next_run_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant', 'JobExecution']
      },
      {
        name: 'JobExecution',
        desc: 'Job execution history',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'job_id', type: 'UUID', fk: 'ScheduledJob' },
          { name: 'status', type: 'ENUM', values: ['pending', 'running', 'success', 'failure', 'timeout', 'canceled'] },
          { name: 'started_at', type: 'TIMESTAMPTZ' },
          { name: 'completed_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'duration_ms', type: 'INTEGER', nullable: true },
          { name: 'result', type: 'JSONB', nullable: true },
          { name: 'error', type: 'TEXT', nullable: true },
          { name: 'retries', type: 'INTEGER', default: 0 },
        ],
        relations: ['ScheduledJob']
      },
    ],
    integration: [
      {
        name: 'ApiKey',
        desc: 'API authentication key',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'environment_id', type: 'UUID', fk: 'Environment', nullable: true },
          { name: 'created_by', type: 'UUID', fk: 'User' },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'key_prefix', type: 'VARCHAR(12)' },
          { name: 'key_hash', type: 'VARCHAR(64)' },
          { name: 'scopes', type: 'VARCHAR[]' },
          { name: 'rate_limit', type: 'INTEGER', nullable: true },
          { name: 'allowed_ips', type: 'INET[]', nullable: true },
          { name: 'last_used_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'expires_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'revoked_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant', 'Environment', 'User']
      },
      {
        name: 'Webhook',
        desc: 'Outbound webhook configuration',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'url', type: 'TEXT' },
          { name: 'secret_hash', type: 'VARCHAR(64)' },
          { name: 'events', type: 'VARCHAR[]' },
          { name: 'is_active', type: 'BOOLEAN' },
          { name: 'version', type: 'VARCHAR(10)' },
          { name: 'headers', type: 'JSONB', nullable: true },
          { name: 'retry_config', type: 'JSONB' },
          { name: 'last_triggered_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'failure_count', type: 'INTEGER', default: 0 },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant', 'WebhookDelivery']
      },
      {
        name: 'WebhookDelivery',
        desc: 'Webhook delivery attempt log',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'webhook_id', type: 'UUID', fk: 'Webhook' },
          { name: 'event_type', type: 'VARCHAR(100)' },
          { name: 'payload', type: 'JSONB' },
          { name: 'status', type: 'ENUM', values: ['pending', 'success', 'failure', 'retrying'] },
          { name: 'attempts', type: 'INTEGER', default: 0 },
          { name: 'response_status', type: 'INTEGER', nullable: true },
          { name: 'response_body', type: 'TEXT', nullable: true },
          { name: 'error', type: 'TEXT', nullable: true },
          { name: 'next_retry_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
          { name: 'delivered_at', type: 'TIMESTAMPTZ', nullable: true },
        ],
        relations: ['Webhook']
      },
      {
        name: 'Integration',
        desc: 'Third-party integration configuration',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'provider', type: 'VARCHAR(100)' },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'type', type: 'ENUM', values: ['oauth', 'api_key', 'webhook', 'custom'] },
          { name: 'status', type: 'ENUM', values: ['pending', 'active', 'error', 'disabled'] },
          { name: 'config_encrypted', type: 'TEXT' },
          { name: 'credentials_encrypted', type: 'TEXT', nullable: true },
          { name: 'scopes', type: 'VARCHAR[]', nullable: true },
          { name: 'last_sync_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'sync_status', type: 'JSONB', nullable: true },
          { name: 'metadata', type: 'JSONB' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant']
      },
      {
        name: 'OAuthToken',
        desc: 'OAuth tokens for integrations',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'integration_id', type: 'UUID', fk: 'Integration' },
          { name: 'user_id', type: 'UUID', fk: 'User', nullable: true },
          { name: 'access_token_enc', type: 'TEXT' },
          { name: 'refresh_token_enc', type: 'TEXT', nullable: true },
          { name: 'token_type', type: 'VARCHAR(50)' },
          { name: 'scope', type: 'TEXT', nullable: true },
          { name: 'expires_at', type: 'TIMESTAMPTZ' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
          { name: 'updated_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Integration', 'User']
      },
    ],
    communication: [
      {
        name: 'NotificationTemplate',
        desc: 'Notification content template',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant', nullable: true },
          { name: 'key', type: 'VARCHAR(100)' },
          { name: 'name', type: 'VARCHAR(200)' },
          { name: 'channel', type: 'ENUM', values: ['email', 'sms', 'push', 'in_app', 'slack', 'webhook'] },
          { name: 'subject_template', type: 'TEXT', nullable: true },
          { name: 'body_template', type: 'TEXT' },
          { name: 'body_html_template', type: 'TEXT', nullable: true },
          { name: 'variables', type: 'JSONB' },
          { name: 'locale', type: 'VARCHAR(10)' },
          { name: 'is_active', type: 'BOOLEAN' },
          { name: 'version', type: 'INTEGER', default: 1 },
          { name: 'updated_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant']
      },
      {
        name: 'Notification',
        desc: 'Notification instance sent to user',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'user_id', type: 'UUID', fk: 'User' },
          { name: 'template_id', type: 'UUID', fk: 'NotificationTemplate', nullable: true },
          { name: 'channel', type: 'ENUM', values: ['email', 'sms', 'push', 'in_app', 'slack'] },
          { name: 'type', type: 'VARCHAR(100)' },
          { name: 'title', type: 'VARCHAR(200)' },
          { name: 'body', type: 'TEXT' },
          { name: 'data', type: 'JSONB', nullable: true },
          { name: 'action_url', type: 'TEXT', nullable: true },
          { name: 'priority', type: 'ENUM', values: ['low', 'normal', 'high', 'urgent'] },
          { name: 'status', type: 'ENUM', values: ['pending', 'sent', 'delivered', 'failed', 'read'] },
          { name: 'read_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'sent_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'error', type: 'TEXT', nullable: true },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant', 'User', 'NotificationTemplate']
      },
      {
        name: 'EmailMessage',
        desc: 'Transactional email log',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: 'notification_id', type: 'UUID', fk: 'Notification', nullable: true },
          { name: 'from_address', type: 'VARCHAR(320)' },
          { name: 'to_addresses', type: 'VARCHAR[]' },
          { name: 'cc_addresses', type: 'VARCHAR[]', nullable: true },
          { name: 'bcc_addresses', type: 'VARCHAR[]', nullable: true },
          { name: 'subject', type: 'TEXT' },
          { name: 'body_text', type: 'TEXT', nullable: true },
          { name: 'body_html', type: 'TEXT', nullable: true },
          { name: 'status', type: 'ENUM', values: ['queued', 'sent', 'delivered', 'bounced', 'complained', 'failed'] },
          { name: 'provider', type: 'VARCHAR(50)' },
          { name: 'provider_message_id', type: 'VARCHAR(255)', nullable: true },
          { name: 'opened_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'clicked_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'sent_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant', 'Notification']
      },
      {
        name: 'Announcement',
        desc: 'System-wide or tenant announcements',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant', nullable: true },
          { name: 'title', type: 'VARCHAR(200)' },
          { name: 'body', type: 'TEXT' },
          { name: 'type', type: 'ENUM', values: ['info', 'warning', 'critical', 'maintenance', 'feature'] },
          { name: 'target_audience', type: 'ENUM', values: ['all', 'admins', 'users', 'segment'] },
          { name: 'segment_rules', type: 'JSONB', nullable: true },
          { name: 'action_url', type: 'TEXT', nullable: true },
          { name: 'starts_at', type: 'TIMESTAMPTZ' },
          { name: 'ends_at', type: 'TIMESTAMPTZ', nullable: true },
          { name: 'is_dismissible', type: 'BOOLEAN', default: true },
          { name: 'is_active', type: 'BOOLEAN' },
          { name: 'created_by', type: 'UUID', fk: 'User' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
        relations: ['Tenant', 'User']
      },
    ],
    domain: [
      {
        name: 'DomainEntity',
        desc: 'Placeholder for your domain-specific entities',
        attrs: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'tenant_id', type: 'UUID', fk: 'Tenant' },
          { name: '...domain_fields', type: '...', note: 'Your functional domain attributes' },
          { name: 'created_by', type: 'UUID', fk: 'User' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
          { name: 'updated_at', type: 'TIMESTAMPTZ' },
          { name: 'deleted_at', type: 'TIMESTAMPTZ', nullable: true },
        ],
        relations: ['Tenant', 'User'],
        placeholder: true
      },
    ],
  };

  const EntityCard = ({ entity, layerColor }) => {
    const isSelected = selectedEntity?.name === entity.name;
    
    return (
      <div 
        className={`bg-white rounded-lg shadow-md border-2 transition-all cursor-pointer hover:shadow-lg ${isSelected ? 'ring-2 ring-blue-400' : ''} ${entity.placeholder ? 'border-dashed opacity-75' : ''}`}
        style={{ borderColor: layerColor }}
        onClick={() => setSelectedEntity(isSelected ? null : entity)}
      >
        <div className="p-3 rounded-t-lg text-white font-semibold text-sm" style={{ backgroundColor: layerColor }}>
          {entity.name}
        </div>
        <div className="p-2 text-xs text-gray-500">{entity.desc}</div>
        {isSelected && (
          <div className="p-3 border-t bg-gray-50 max-h-96 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="pb-1">Column</th>
                  <th className="pb-1">Type</th>
                  <th className="pb-1">Info</th>
                </tr>
              </thead>
              <tbody>
                {entity.attrs.map((attr, idx) => (
                  <tr key={idx} className="border-t border-gray-100">
                    <td className="py-1 font-medium">
                      {attr.pk && <span className="text-yellow-600">🔑 </span>}
                      {attr.fk && <span className="text-blue-600">🔗 </span>}
                      {attr.name}
                    </td>
                    <td className="py-1 text-gray-600 font-mono text-xs">{attr.type}</td>
                    <td className="py-1 text-gray-400">
                      {attr.nullable && 'nullable'}
                      {attr.unique && 'unique'}
                      {attr.fk && `→ ${attr.fk}`}
                      {attr.values && attr.values.slice(0, 3).join(', ') + (attr.values.length > 3 ? '...' : '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {entity.relations.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <span className="text-gray-500 text-xs">Relations: </span>
                <span className="text-xs text-blue-600">{entity.relations.join(' • ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Enterprise SaaS ERD</h1>
          <p className="text-slate-400 text-lg">Ontologically-Driven Architecture Foundation</p>
          <p className="text-slate-500 text-sm mt-2">Click any entity to expand its schema • Click layer headers to filter</p>
        </div>

        {/* Layer Legend */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {ontologicalLayers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
              className={`px-4 py-2 rounded-full text-white text-sm font-medium transition-all ${activeLayer === layer.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'}`}
              style={{ backgroundColor: layer.color }}
            >
              {layer.name}
            </button>
          ))}
        </div>

        {/* Entity Grid by Layer */}
        <div className="space-y-8">
          {ontologicalLayers.map((layer) => {
            if (activeLayer && activeLayer !== layer.id) return null;
            const layerEntities = entities[layer.id] || [];
            
            return (
              <div key={layer.id} className="bg-slate-800/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: layer.color }}></div>
                  <h2 className="text-xl font-bold text-white">{layer.name}</h2>
                  <span className="text-slate-400 text-sm">— {layer.desc}</span>
                  <span className="ml-auto text-slate-500 text-sm">{layerEntities.length} entities</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {layerEntities.map((entity, idx) => (
                    <EntityCard key={idx} entity={entity} layerColor={layer.color} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex gap-8 bg-slate-800/50 rounded-xl px-8 py-4">
            <div>
              <div className="text-3xl font-bold text-white">
                {Object.values(entities).flat().length}
              </div>
              <div className="text-slate-400 text-sm">Total Entities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {Object.values(entities).flat().reduce((acc, e) => acc + e.attrs.length, 0)}
              </div>
              <div className="text-slate-400 text-sm">Total Attributes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{ontologicalLayers.length}</div>
              <div className="text-slate-400 text-sm">Ontological Layers</div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-8 bg-slate-800/30 rounded-xl p-6 text-slate-300 text-sm">
          <h3 className="font-bold text-white mb-3">🧬 Ontological Design Principles</h3>
          <ul className="grid md:grid-cols-2 gap-2">
            <li>• <strong>Existence Layer:</strong> Foundational identity — Tenant is the root of all multi-tenancy</li>
            <li>• <strong>Identity Layer:</strong> Who can act — Users, Teams, Roles, Permissions (RBAC)</li>
            <li>• <strong>Commercial Layer:</strong> Value exchange — Subscriptions, Billing, Usage metering</li>
            <li>• <strong>Operational Layer:</strong> Configuration state — Settings, Feature flags, Preferences</li>
            <li>• <strong>Temporal Layer:</strong> Time-bound truth — Audit logs, History, Compliance records</li>
            <li>• <strong>Integration Layer:</strong> External connections — APIs, Webhooks, OAuth, Integrations</li>
            <li>• <strong>Communication Layer:</strong> Information flow — Notifications, Emails, Announcements</li>
            <li>• <strong>Domain Layer:</strong> Your business logic — Extend with functional domain entities</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseSaaSERD;
