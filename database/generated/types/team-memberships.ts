export type TeamMembershipsRole = "member" | "maintainer" | "owner";

/**
 * Represents a row in the team_memberships table
 * Source: 21_identity_layer.sql
 */
export interface TeamMemberships {
  /** Primary key */
  id: string;
  team_id: string;
  user_id: string;
  role: TeamMembershipsRole;
  joined_at: string;
  invited_by: string | null;
}

/** Insert type for team_memberships (excludes auto-generated fields) */
export interface TeamMembershipsInsert {
  team_id: string;
  user_id: string;
  role?: TeamMembershipsRole;
  joined_at?: string;
  invited_by?: string | null;
}