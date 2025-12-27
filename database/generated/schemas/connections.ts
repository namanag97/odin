/**
 * Zod schemas for connections table
 * Source: 18_automation_enhanced.sql
 */

import { z } from "zod";

/** Schema for a connections row */
export const ConnectionsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  package_id: z.string().uuid().nullable(),
  name: z.string(),
  app_name: z.string(),
  connection_type: z.enum(["oauth2", "api_key", "basic", "celonis_user", "celonis_app_key", "custom"]),
  credentials: z.string(),
  oauth_credentials_id: z.string().uuid().nullable(),
  status: z.enum(["valid", "invalid", "expired", "revoked"]),
  is_dynamic: z.number().int(),
  last_used_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  last_tested_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  expires_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_by: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Connections = z.infer<typeof ConnectionsSchema>;

/** Schema for inserting a connections row */
export const ConnectionsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  package_id: z.string().uuid().nullable().optional(),
  name: z.string(),
  app_name: z.string(),
  connection_type: z.enum(["oauth2", "api_key", "basic", "celonis_user", "celonis_app_key", "custom"]),
  credentials: z.string(),
  oauth_credentials_id: z.string().uuid().nullable().optional(),
  status: z.enum(["valid", "invalid", "expired", "revoked"]).optional(),
  is_dynamic: z.number().int().optional(),
  last_used_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  last_tested_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  expires_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  created_by: z.string().nullable().optional(),
});

export type ConnectionsInsert = z.infer<typeof ConnectionsInsertSchema>;

/** Schema for updating a connections row */
export const ConnectionsUpdateSchema = ConnectionsInsertSchema.partial();

export type ConnectionsUpdate = z.infer<typeof ConnectionsUpdateSchema>;