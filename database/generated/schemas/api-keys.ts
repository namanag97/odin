/**
 * Zod schemas for api_keys table
 * Source: 25_integration_layer.sql
 */

import { z } from "zod";

/** Schema for a api_keys row */
export const ApiKeysSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  environment_id: z.string().uuid().nullable(),
  created_by: z.string(),
  name: z.string(),
  key_prefix: z.string(),
  key_hash: z.string(),
  scopes: z.array(z.unknown()).nullable(),
  rate_limit: z.number().int().nullable(),
  allowed_ips: z.string().nullable(),
  last_used_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  expires_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  revoked_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type ApiKeys = z.infer<typeof ApiKeysSchema>;

/** Schema for inserting a api_keys row */
export const ApiKeysInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  environment_id: z.string().uuid().nullable().optional(),
  created_by: z.string(),
  name: z.string(),
  key_prefix: z.string(),
  key_hash: z.string(),
  scopes: z.array(z.unknown()).nullable().optional(),
  rate_limit: z.number().int().nullable().optional(),
  allowed_ips: z.string().nullable().optional(),
  last_used_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  expires_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  revoked_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type ApiKeysInsert = z.infer<typeof ApiKeysInsertSchema>;

/** Schema for updating a api_keys row */
export const ApiKeysUpdateSchema = ApiKeysInsertSchema.partial();

export type ApiKeysUpdate = z.infer<typeof ApiKeysUpdateSchema>;