export type TeamsVisibility = "private" | "internal" | "public";

/**
 * Represents a row in the teams table
 * Source: 21_identity_layer.sql
 */
export interface Teams {
  /** Primary key */
  id: string;
  tenant_id: string;
  organization_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  visibility: TeamsVisibility;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for teams (excludes auto-generated fields) */
export interface TeamsInsert {
  tenant_id: string;
  organization_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  visibility?: TeamsVisibility;
  metadata?: Record<string, unknown> | null;
}