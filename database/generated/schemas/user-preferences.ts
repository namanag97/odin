/**
 * Zod schemas for user_preferences table
 * Source: 23_operational_layer.sql
 */

import { z } from "zod";

/** Schema for a user_preferences row */
export const UserPreferencesSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  theme: z.enum(["light", "dark", "system"]),
  language: z.string(),
  timezone: z.string().nullable(),
  email_notifications: z.record(z.string(), z.unknown()).nullable(),
  push_notifications: z.record(z.string(), z.unknown()).nullable(),
  ui_preferences: z.record(z.string(), z.unknown()).nullable(),
  accessibility: z.record(z.string(), z.unknown()).nullable(),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

/** Schema for inserting a user_preferences row */
export const UserPreferencesInsertSchema = z.object({
  user_id: z.string().uuid(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().optional(),
  timezone: z.string().nullable().optional(),
  email_notifications: z.record(z.string(), z.unknown()).nullable().optional(),
  push_notifications: z.record(z.string(), z.unknown()).nullable().optional(),
  ui_preferences: z.record(z.string(), z.unknown()).nullable().optional(),
  accessibility: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type UserPreferencesInsert = z.infer<typeof UserPreferencesInsertSchema>;

/** Schema for updating a user_preferences row */
export const UserPreferencesUpdateSchema = UserPreferencesInsertSchema.partial();

export type UserPreferencesUpdate = z.infer<typeof UserPreferencesUpdateSchema>;