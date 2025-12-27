
/**
 * Represents a row in the tenant_settings table
 * Source: 23_operational_layer.sql
 */
export interface TenantSettings {
  /** Primary key */
  id: string;
  tenant_id: string;
  timezone: string;
  date_format: string;
  locale: string;
  currency: string;
  /** JSON field */
  branding: Record<string, unknown> | null;
  /** JSON field */
  security_settings: Record<string, unknown> | null;
  /** JSON field */
  notification_settings: Record<string, unknown> | null;
  /** JSON field */
  feature_flags: Record<string, unknown> | null;
  /** JSON field */
  custom_fields_schema: Record<string, unknown> | null;
  updated_at: string;
}

/** Insert type for tenant_settings (excludes auto-generated fields) */
export interface TenantSettingsInsert {
  tenant_id: string;
  timezone?: string;
  date_format?: string;
  locale?: string;
  currency?: string;
  branding?: Record<string, unknown> | null;
  security_settings?: Record<string, unknown> | null;
  notification_settings?: Record<string, unknown> | null;
  feature_flags?: Record<string, unknown> | null;
  custom_fields_schema?: Record<string, unknown> | null;
}