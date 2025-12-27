/**
 * Zod schemas for integrations table
 * Source: 25_integration_layer.sql
 */

import { z } from "zod";

/** Schema for a integrations row */
export const IntegrationsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  provider: z.string(),
  name: z.string(),
  type: z.enum(["oauth", "api_key", "webhook", "custom"]),
  status: z.enum(["pending", "active", "error", "disabled"]),
  config_encrypted: z.record(z.string(), z.unknown()),
  credentials_encrypted: z.string().nullable(),
  scopes: z.string().nullable(),
  last_sync_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  sync_status: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Integrations = z.infer<typeof IntegrationsSchema>;

/** Schema for inserting a integrations row */
export const IntegrationsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  provider: z.string(),
  name: z.string(),
  type: z.enum(["oauth", "api_key", "webhook", "custom"]),
  status: z.enum(["pending", "active", "error", "disabled"]).optional(),
  config_encrypted: z.record(z.string(), z.unknown()),
  credentials_encrypted: z.string().nullable().optional(),
  scopes: z.string().nullable().optional(),
  last_sync_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  sync_status: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type IntegrationsInsert = z.infer<typeof IntegrationsInsertSchema>;

/** Schema for updating a integrations row */
export const IntegrationsUpdateSchema = IntegrationsInsertSchema.partial();

export type IntegrationsUpdate = z.infer<typeof IntegrationsUpdateSchema>;