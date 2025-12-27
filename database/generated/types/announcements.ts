export type AnnouncementsType = "info" | "warning" | "critical" | "maintenance" | "feature";
export type AnnouncementsTargetAudience = "all" | "admins" | "users" | "segment";

/**
 * Represents a row in the announcements table
 * Source: 26_communication_layer.sql
 */
export interface Announcements {
  /** Primary key */
  id: string;
  tenant_id: string | null;
  title: string;
  body: string;
  type: AnnouncementsType;
  target_audience: AnnouncementsTargetAudience;
  segment_rules: string | null;
  action_url: string | null;
  starts_at: string;
  ends_at: string | null;
  is_dismissible: number;
  is_active: number;
  created_by: string;
  created_at: string;
}

/** Insert type for announcements (excludes auto-generated fields) */
export interface AnnouncementsInsert {
  tenant_id?: string | null;
  title: string;
  body: string;
  type: AnnouncementsType;
  target_audience?: AnnouncementsTargetAudience;
  segment_rules?: string | null;
  action_url?: string | null;
  starts_at: string;
  ends_at?: string | null;
  is_dismissible?: number;
  is_active?: number;
  created_by: string;
}