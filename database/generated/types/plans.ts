export type PlansTier = "free" | "starter" | "professional" | "enterprise" | "custom";
export type PlansBillingInterval = "monthly" | "quarterly" | "annual" | "custom";

/**
 * Represents a row in the plans table
 * Source: 22_commercial_layer.sql
 */
export interface Plans {
  /** Primary key */
  id: string;
  external_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  tier: PlansTier;
  billing_interval: PlansBillingInterval;
  base_price: number;
  currency: string;
  is_public: number;
  is_active: number;
  trial_days: number;
  /** JSON field */
  features: Record<string, unknown> | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for plans (excludes auto-generated fields) */
export interface PlansInsert {
  external_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  tier: PlansTier;
  billing_interval: PlansBillingInterval;
  base_price?: number;
  currency?: string;
  is_public?: number;
  is_active?: number;
  trial_days?: number;
  features?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}