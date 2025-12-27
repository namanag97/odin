export type PlanLimitsLimitType = "hard" | "soft" | "metered";
export type PlanLimitsResetInterval = "never" | "daily" | "weekly" | "monthly" | "billing_cycle";

/**
 * Represents a row in the plan_limits table
 * Source: 22_commercial_layer.sql
 */
export interface PlanLimits {
  /** Primary key */
  id: string;
  plan_id: string;
  resource_type: string;
  limit_value: number;
  limit_type: PlanLimitsLimitType;
  reset_interval: PlanLimitsResetInterval;
  overage_allowed: number;
  overage_price: number | null;
}

/** Insert type for plan_limits (excludes auto-generated fields) */
export interface PlanLimitsInsert {
  plan_id: string;
  resource_type: string;
  limit_value: number;
  limit_type: PlanLimitsLimitType;
  reset_interval?: PlanLimitsResetInterval;
  overage_allowed?: number;
  overage_price?: number | null;
}