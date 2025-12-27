/**
 * Zod schemas for user_profiles table
 * Source: 21_identity_layer.sql
 */

import { z } from "zod";

/** Schema for a user_profiles row */
export const UserProfilesSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  timezone: z.string().nullable(),
  locale: z.string().nullable(),
  bio: z.string().nullable(),
  job_title: z.string().nullable(),
  department: z.string().nullable(),
  custom_fields: z.record(z.string(), z.unknown()).nullable(),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type UserProfiles = z.infer<typeof UserProfilesSchema>;

/** Schema for inserting a user_profiles row */
export const UserProfilesInsertSchema = z.object({
  user_id: z.string().uuid(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  locale: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  job_title: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  custom_fields: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type UserProfilesInsert = z.infer<typeof UserProfilesInsertSchema>;

/** Schema for updating a user_profiles row */
export const UserProfilesUpdateSchema = UserProfilesInsertSchema.partial();

export type UserProfilesUpdate = z.infer<typeof UserProfilesUpdateSchema>;