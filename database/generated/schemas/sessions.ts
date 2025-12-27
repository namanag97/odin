/**
 * Zod schemas for sessions table
 * Source: 21_identity_layer.sql
 */

import { z } from "zod";

/** Schema for a sessions row */
export const SessionsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  token_hash: z.string(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  device_fingerprint: z.string().nullable(),
  location: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  expires_at: z.string().datetime({ offset: true }).or(z.string()),
  last_active_at: z.string().datetime({ offset: true }).or(z.string()),
  revoked_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
});

export type Sessions = z.infer<typeof SessionsSchema>;

/** Schema for inserting a sessions row */
export const SessionsInsertSchema = z.object({
  user_id: z.string().uuid(),
  token_hash: z.string(),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  device_fingerprint: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  expires_at: z.string().datetime({ offset: true }).or(z.string()),
  last_active_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  revoked_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type SessionsInsert = z.infer<typeof SessionsInsertSchema>;

/** Schema for updating a sessions row */
export const SessionsUpdateSchema = SessionsInsertSchema.partial();

export type SessionsUpdate = z.infer<typeof SessionsUpdateSchema>;