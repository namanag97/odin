/**
 * Zod schemas for mfa_devices table
 * Source: 21_identity_layer.sql
 */

import { z } from "zod";

/** Schema for a mfa_devices row */
export const MfaDevicesSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(["totp", "sms", "email", "webauthn", "backup_codes"]),
  name: z.string(),
  secret_encrypted: z.string(),
  is_primary: z.number().int(),
  is_verified: z.number().int(),
  last_used_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type MfaDevices = z.infer<typeof MfaDevicesSchema>;

/** Schema for inserting a mfa_devices row */
export const MfaDevicesInsertSchema = z.object({
  user_id: z.string().uuid(),
  type: z.enum(["totp", "sms", "email", "webauthn", "backup_codes"]),
  name: z.string(),
  secret_encrypted: z.string(),
  is_primary: z.number().int().optional(),
  is_verified: z.number().int().optional(),
  last_used_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type MfaDevicesInsert = z.infer<typeof MfaDevicesInsertSchema>;

/** Schema for updating a mfa_devices row */
export const MfaDevicesUpdateSchema = MfaDevicesInsertSchema.partial();

export type MfaDevicesUpdate = z.infer<typeof MfaDevicesUpdateSchema>;