export type MfaDevicesType = "totp" | "sms" | "email" | "webauthn" | "backup_codes";

/**
 * Represents a row in the mfa_devices table
 * Source: 21_identity_layer.sql
 */
export interface MfaDevices {
  /** Primary key */
  id: string;
  user_id: string;
  type: MfaDevicesType;
  name: string;
  secret_encrypted: string;
  is_primary: number;
  is_verified: number;
  last_used_at: string | null;
  created_at: string;
}

/** Insert type for mfa_devices (excludes auto-generated fields) */
export interface MfaDevicesInsert {
  user_id: string;
  type: MfaDevicesType;
  name: string;
  secret_encrypted: string;
  is_primary?: number;
  is_verified?: number;
  last_used_at?: string | null;
}