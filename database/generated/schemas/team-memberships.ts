/**
 * Zod schemas for team_memberships table
 * Source: 21_identity_layer.sql
 */

import { z } from "zod";

/** Schema for a team_memberships row */
export const TeamMembershipsSchema = z.object({
  id: z.string().uuid(),
  team_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(["member", "maintainer", "owner"]),
  joined_at: z.string().datetime({ offset: true }).or(z.string()),
  invited_by: z.string().nullable(),
});

export type TeamMemberships = z.infer<typeof TeamMembershipsSchema>;

/** Schema for inserting a team_memberships row */
export const TeamMembershipsInsertSchema = z.object({
  team_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(["member", "maintainer", "owner"]).optional(),
  joined_at: z.string().datetime({ offset: true }).or(z.string()).optional(),
  invited_by: z.string().nullable().optional(),
});

export type TeamMembershipsInsert = z.infer<typeof TeamMembershipsInsertSchema>;

/** Schema for updating a team_memberships row */
export const TeamMembershipsUpdateSchema = TeamMembershipsInsertSchema.partial();

export type TeamMembershipsUpdate = z.infer<typeof TeamMembershipsUpdateSchema>;