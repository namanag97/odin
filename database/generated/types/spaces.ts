export type SpacesStatus = "active" | "archived";

/**
 * Represents a row in the spaces table
 * Source: 17_studio.sql
 */
export interface Spaces {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_default: number;
  status: SpacesStatus;
  sort_order: number | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for spaces (excludes auto-generated fields) */
export interface SpacesInsert {
  tenant_id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  is_default?: number;
  status?: SpacesStatus;
  sort_order?: number | null;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
}