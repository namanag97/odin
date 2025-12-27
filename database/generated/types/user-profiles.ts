
/**
 * Represents a row in the user_profiles table
 * Source: 21_identity_layer.sql
 */
export interface UserProfiles {
  /** Primary key */
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string | null;
  locale: string | null;
  bio: string | null;
  job_title: string | null;
  department: string | null;
  /** JSON field */
  custom_fields: Record<string, unknown> | null;
  updated_at: string;
}

/** Insert type for user_profiles (excludes auto-generated fields) */
export interface UserProfilesInsert {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  timezone?: string | null;
  locale?: string | null;
  bio?: string | null;
  job_title?: string | null;
  department?: string | null;
  custom_fields?: Record<string, unknown> | null;
}