export type UserPreferencesTheme = "light" | "dark" | "system";

/**
 * Represents a row in the user_preferences table
 * Source: 23_operational_layer.sql
 */
export interface UserPreferences {
  /** Primary key */
  id: string;
  user_id: string;
  theme: UserPreferencesTheme;
  language: string;
  timezone: string | null;
  /** JSON field */
  email_notifications: Record<string, unknown> | null;
  /** JSON field */
  push_notifications: Record<string, unknown> | null;
  /** JSON field */
  ui_preferences: Record<string, unknown> | null;
  /** JSON field */
  accessibility: Record<string, unknown> | null;
  updated_at: string;
}

/** Insert type for user_preferences (excludes auto-generated fields) */
export interface UserPreferencesInsert {
  user_id: string;
  theme?: UserPreferencesTheme;
  language?: string;
  timezone?: string | null;
  email_notifications?: Record<string, unknown> | null;
  push_notifications?: Record<string, unknown> | null;
  ui_preferences?: Record<string, unknown> | null;
  accessibility?: Record<string, unknown> | null;
}