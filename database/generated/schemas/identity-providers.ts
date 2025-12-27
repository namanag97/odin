/**
 * Zod schemas for identity_providers table
 * Source: 21_identity_layer.sql
 */

import { z } from "zod";

/** Schema for a identity_providers row */
export const IdentityProvidersSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  type: z.enum(["saml", "oidc", "ldap", "oauth2"]),
  is_enabled: z.number().int(),
  is_default: z.number().int(),
  config_encrypted: z.record(z.string(), z.unknown()),
  metadata_url: z.record(z.string(), z.unknown()).nullable(),
  domain_hints: z.string().nullable(),
  auto_provision: z.number().int(),
  default_role_id: z.string().uuid().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type IdentityProviders = z.infer<typeof IdentityProvidersSchema>;

/** Schema for inserting a identity_providers row */
export const IdentityProvidersInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string(),
  type: z.enum(["saml", "oidc", "ldap", "oauth2"]),
  is_enabled: z.number().int().optional(),
  is_default: z.number().int().optional(),
  config_encrypted: z.record(z.string(), z.unknown()),
  metadata_url: z.record(z.string(), z.unknown()).nullable().optional(),
  domain_hints: z.string().nullable().optional(),
  auto_provision: z.number().int().optional(),
  default_role_id: z.string().uuid().nullable().optional(),
});

export type IdentityProvidersInsert = z.infer<typeof IdentityProvidersInsertSchema>;

/** Schema for updating a identity_providers row */
export const IdentityProvidersUpdateSchema = IdentityProvidersInsertSchema.partial();

export type IdentityProvidersUpdate = z.infer<typeof IdentityProvidersUpdateSchema>;