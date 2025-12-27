export type CouponsDiscountType = "percentage" | "fixed_amount";
export type CouponsDuration = "once" | "repeating" | "forever";

/**
 * Represents a row in the coupons table
 * Source: 22_commercial_layer.sql
 */
export interface Coupons {
  /** Primary key */
  id: string;
  code: string;
  name: string;
  discount_type: CouponsDiscountType;
  discount_value: number;
  currency: string | null;
  duration: CouponsDuration;
  duration_months: number | null;
  max_redemptions: number | null;
  times_redeemed: number;
  valid_from: string;
  valid_until: string | null;
  is_active: number;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for coupons (excludes auto-generated fields) */
export interface CouponsInsert {
  code: string;
  name: string;
  discount_type: CouponsDiscountType;
  discount_value: number;
  currency?: string | null;
  duration: CouponsDuration;
  duration_months?: number | null;
  max_redemptions?: number | null;
  times_redeemed?: number;
  valid_from: string;
  valid_until?: string | null;
  is_active?: number;
  metadata?: Record<string, unknown> | null;
}