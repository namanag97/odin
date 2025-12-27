
/**
 * Represents a row in the view_tabs table
 * Source: 17_studio.sql
 */
export interface ViewTabs {
  /** Primary key */
  id: string;
  tenant_id: string;
  view_id: string;
  key: string;
  title: string;
  icon: string | null;
  is_default: number;
  sort_order: number;
  visibility_expression: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for view_tabs (excludes auto-generated fields) */
export interface ViewTabsInsert {
  tenant_id: string;
  view_id: string;
  key: string;
  title: string;
  icon?: string | null;
  is_default?: number;
  sort_order: number;
  visibility_expression?: string | null;
  metadata?: Record<string, unknown> | null;
}