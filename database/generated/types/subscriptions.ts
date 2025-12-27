export type SubscriptionsStatus = "trialing" | "active" | "past_due" | "canceled" | "paused" | "incomplete";

/**
 * Represents a row in the subscriptions table
 * Source: 22_commercial_layer.sql
 */
export interface Subscriptions {
  /** Primary key */
  id: string;
  tenant_id: string;
  plan_id: string;
  external_id: string | null;
  status: SubscriptionsStatus;
  quantity: number;
  billing_anchor_day: number | null;
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  canceled_at: string | null;
  cancel_at_period_end: number;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for subscriptions (excludes auto-generated fields) */
export interface SubscriptionsInsert {
  tenant_id: string;
  plan_id: string;
  external_id?: string | null;
  status?: SubscriptionsStatus;
  quantity?: number;
  billing_anchor_day?: number | null;
  current_period_start: string;
  current_period_end: string;
  trial_start?: string | null;
  trial_end?: string | null;
  canceled_at?: string | null;
  cancel_at_period_end?: number;
  metadata?: Record<string, unknown> | null;
}