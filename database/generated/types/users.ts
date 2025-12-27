export type UsersStatus = "pending" | "active" | "suspended" | "deactivated";
export type UsersType = "human" | "service" | "bot";

/**
 * Represents a row in the users table
 * Source: 21_identity_layer.sql
 */
export interface Users {
  /** Primary key */
  id: string;
  tenant_id: string;
  external_id: string | null;
  email: string;
  email_verified_at: string | null;
  phone: string | null;
  phone_verified_at: string | null;
  password_hash: string | null;
  status: UsersStatus;
  type: UsersType;
  last_login_at: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  mfa_enabled: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Insert type for users (excludes auto-generated fields) */
export interface UsersInsert {
  tenant_id: string;
  external_id?: string | null;
  email: string;
  email_verified_at?: string | null;
  phone?: string | null;
  phone_verified_at?: string | null;
  password_hash?: string | null;
  status?: UsersStatus;
  type?: UsersType;
  last_login_at?: string | null;
  failed_login_attempts?: number;
  locked_until?: string | null;
  mfa_enabled?: number;
  deleted_at?: string | null;
}