export type ViewsViewType = "standard" | "profile" | "extension";
export type ViewsLayoutMode = "scale_to_fit" | "custom_height";
export type ViewsStatus = "draft" | "published";

/**
 * Represents a row in the views table
 * Source: 17_studio.sql
 */
export interface Views {
  /** Primary key */
  id: string;
  tenant_id: string;
  package_id: string;
  key: string;
  name: string;
  description: string | null;
  knowledge_model_id: string;
  base_view_id: string | null;
  view_type: ViewsViewType;
  layout_mode: ViewsLayoutMode;
  /** JSON field */
  layout_config: Record<string, unknown> | null;
  icon: string | null;
  thumbnail_url: string | null;
  is_home: number;
  is_published_to_apps: number;
  sort_order: number | null;
  status: ViewsStatus;
  version: number;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for views (excludes auto-generated fields) */
export interface ViewsInsert {
  tenant_id: string;
  package_id: string;
  key: string;
  name: string;
  description?: string | null;
  knowledge_model_id: string;
  base_view_id?: string | null;
  view_type?: ViewsViewType;
  layout_mode?: ViewsLayoutMode;
  layout_config?: Record<string, unknown> | null;
  icon?: string | null;
  thumbnail_url?: string | null;
  is_home?: number;
  is_published_to_apps?: number;
  sort_order?: number | null;
  status?: ViewsStatus;
  version?: number;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
}