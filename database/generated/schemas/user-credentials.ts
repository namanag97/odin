/**
 * Zod schemas for user_credentials table
 * Source: 21_identity_layer.sql
 */

import { z } from "zod";

/** Schema for a user_credentials row */
export const UserCredentialsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  provider: z.enum(["email", "google", "microsoft", "saml", "oidc", "ldap"]),
  provider_user_id: z.string().uuid(),
  access_token_enc: z.string().nullable(),
  refresh_token_enc: z.string().nullable(),
  token_expires_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type UserCredentials = z.infer<typeof UserCredentialsSchema>;

/** Schema for inserting a user_credentials row */
export const UserCredentialsInsertSchema = z.object({
  user_id: z.string().uuid(),
  provider: z.enum(["email", "google", "microsoft", "saml", "oidc", "ldap"]),
  provider_user_id: z.string().uuid(),
  access_token_enc: z.string().nullable().optional(),
  refresh_token_enc: z.string().nullable().optional(),
  token_expires_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type UserCredentialsInsert = z.infer<typeof UserCredentialsInsertSchema>;

/** Schema for updating a user_credentials row */
export const UserCredentialsUpdateSchema = UserCredentialsInsertSchema.partial();

export type UserCredentialsUpdate = z.infer<typeof UserCredentialsUpdateSchema>;