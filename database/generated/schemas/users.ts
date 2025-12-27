/**
 * Zod schemas for users table
 * Source: 21_identity_layer.sql
 */

import { z } from "zod";

/** Schema for a users row */
export const UsersSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  external_id: z.string().uuid().nullable(),
  email: z.string(),
  email_verified_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  phone: z.string().nullable(),
  phone_verified_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  password_hash: z.string().nullable(),
  status: z.enum(["pending", "active", "suspended", "deactivated"]),
  type: z.enum(["human", "service", "bot"]),
  last_login_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  failed_login_attempts: z.number().int(),
  locked_until: z.string().nullable(),
  mfa_enabled: z.number().int(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
  deleted_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
});

export type Users = z.infer<typeof UsersSchema>;

/** Schema for inserting a users row */
export const UsersInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  external_id: z.string().uuid().nullable().optional(),
  email: z.string(),
  email_verified_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  phone: z.string().nullable().optional(),
  phone_verified_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  password_hash: z.string().nullable().optional(),
  status: z.enum(["pending", "active", "suspended", "deactivated"]).optional(),
  type: z.enum(["human", "service", "bot"]).optional(),
  last_login_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  failed_login_attempts: z.number().int().optional(),
  locked_until: z.string().nullable().optional(),
  mfa_enabled: z.number().int().optional(),
  deleted_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type UsersInsert = z.infer<typeof UsersInsertSchema>;

/** Schema for updating a users row */
export const UsersUpdateSchema = UsersInsertSchema.partial();

export type UsersUpdate = z.infer<typeof UsersUpdateSchema>;