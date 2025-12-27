/**
 * Zod schemas for audit_logs table
 * Source: 24_temporal_layer.sql
 */

import { z } from "zod";

/** Schema for a audit_logs row */
export const AuditLogsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  actor_type: z.enum(["user", "service", "system", "api_key"]),
  actor_id: z.string().uuid(),
  actor_email: z.string().nullable(),
  action: z.string(),
  resource_type: z.string(),
  resource_id: z.string().uuid(),
  resource_name: z.string().nullable(),
  changes: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  request_id: z.string().uuid().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type AuditLogs = z.infer<typeof AuditLogsSchema>;

/** Schema for inserting a audit_logs row */
export const AuditLogsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  actor_type: z.enum(["user", "service", "system", "api_key"]),
  actor_id: z.string().uuid(),
  actor_email: z.string().nullable().optional(),
  action: z.string(),
  resource_type: z.string(),
  resource_id: z.string().uuid(),
  resource_name: z.string().nullable().optional(),
  changes: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  request_id: z.string().uuid().nullable().optional(),
});

export type AuditLogsInsert = z.infer<typeof AuditLogsInsertSchema>;

/** Schema for updating a audit_logs row */
export const AuditLogsUpdateSchema = AuditLogsInsertSchema.partial();

export type AuditLogsUpdate = z.infer<typeof AuditLogsUpdateSchema>;