export type TenantsType = "individual" | "team" | "enterprise";
export type TenantsStatus = "provisioning" | "active" | "suspended" | "terminated";
export type TenantsTier = "free" | "starter" | "professional" | "enterprise";

/**
 * Represents a row in the tenants table
 * Source: 01_core.sql
 */
export interface Tenants {
  /** Primary key */
  id: string;
  external_id: string | null;
  name: string;
  slug: string;
  type: TenantsType;
  status: TenantsStatus;
  tier: TenantsTier;
  /** JSON field */
  settings: Record<string, unknown> | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  storage_quota_gb: number | null;
  event_quota_monthly: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Insert type for tenants (excludes auto-generated fields) */
export interface TenantsInsert {
  external_id?: string | null;
  name: string;
  slug: string;
  type?: TenantsType;
  status?: TenantsStatus;
  tier?: TenantsTier;
  settings?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  storage_quota_gb?: number | null;
  event_quota_monthly?: number | null;
  deleted_at?: string | null;
}