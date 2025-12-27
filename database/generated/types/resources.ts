export type ResourcesResourceType = "human" | "system" | "bot";

/**
 * Represents a row in the resources table
 * Source: 02_case_centric.sql
 */
export interface Resources {
  /** Primary key */
  id: string;
  tenant_id: string;
  event_log_id: string;
  name: string;
  display_name: string | null;
  resource_type: ResourcesResourceType | null;
  department: string | null;
  role: string | null;
  email: string | null;
  event_count: number | null;
  distinct_activities: number | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for resources (excludes auto-generated fields) */
export interface ResourcesInsert {
  tenant_id: string;
  event_log_id: string;
  name: string;
  display_name?: string | null;
  resource_type?: ResourcesResourceType | null;
  department?: string | null;
  role?: string | null;
  email?: string | null;
  event_count?: number | null;
  distinct_activities?: number | null;
  metadata?: Record<string, unknown> | null;
}