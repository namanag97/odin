/**
 * Zod schemas for announcements table
 * Source: 26_communication_layer.sql
 */

import { z } from "zod";

/** Schema for a announcements row */
export const AnnouncementsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid().nullable(),
  title: z.string(),
  body: z.string(),
  type: z.enum(["info", "warning", "critical", "maintenance", "feature"]),
  target_audience: z.enum(["all", "admins", "users", "segment"]),
  segment_rules: z.string().nullable(),
  action_url: z.string().nullable(),
  starts_at: z.string().datetime({ offset: true }).or(z.string()),
  ends_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
  is_dismissible: z.number().int(),
  is_active: z.number().int(),
  created_by: z.string(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type Announcements = z.infer<typeof AnnouncementsSchema>;

/** Schema for inserting a announcements row */
export const AnnouncementsInsertSchema = z.object({
  tenant_id: z.string().uuid().nullable().optional(),
  title: z.string(),
  body: z.string(),
  type: z.enum(["info", "warning", "critical", "maintenance", "feature"]),
  target_audience: z.enum(["all", "admins", "users", "segment"]).optional(),
  segment_rules: z.string().nullable().optional(),
  action_url: z.string().nullable().optional(),
  starts_at: z.string().datetime({ offset: true }).or(z.string()),
  ends_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
  is_dismissible: z.number().int().optional(),
  is_active: z.number().int().optional(),
  created_by: z.string(),
});

export type AnnouncementsInsert = z.infer<typeof AnnouncementsInsertSchema>;

/** Schema for updating a announcements row */
export const AnnouncementsUpdateSchema = AnnouncementsInsertSchema.partial();

export type AnnouncementsUpdate = z.infer<typeof AnnouncementsUpdateSchema>;