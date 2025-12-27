
/**
 * Represents a row in the permissions table
 * Source: 21_identity_layer.sql
 */
export interface Permissions {
  /** Primary key */
  id: string;
  resource: string;
  action: string;
  description: string | null;
  category: string | null;
  is_sensitive: number;
}

/** Insert type for permissions (excludes auto-generated fields) */
export interface PermissionsInsert {
  resource: string;
  action: string;
  description?: string | null;
  category?: string | null;
  is_sensitive?: number;
}