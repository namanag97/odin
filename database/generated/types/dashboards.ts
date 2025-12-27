
/**
 * Represents a row in the dashboards table
 * Source: 07_analytics.sql
 */
export interface Dashboards {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  layout: string;
  widgets: string;
  /** JSON field */
  filters: unknown[] | null;
  refresh_interval_seconds: number | null;
  is_public: number | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for dashboards (excludes auto-generated fields) */
export interface DashboardsInsert {
  tenant_id: string;
  name: string;
  description?: string | null;
  layout: string;
  widgets: string;
  filters?: unknown[] | null;
  refresh_interval_seconds?: number | null;
  is_public?: number | null;
}