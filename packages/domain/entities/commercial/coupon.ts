/**
 * Coupon Entity - Commercial Layer
 * 
 * Discount coupons and redemptions.
 */

import type {
  UUID,
  TenantId,
  ISODateTime,
  Percentage,
  EntityStatus,
  Brand,
} from '@odin/core-contracts';

import type { Currency } from './plan';

// ============================================================================
// Branded IDs
// ============================================================================

/** Branded Coupon ID */
export type CouponId = Brand<UUID, 'CouponId'>;

/** Cast function for CouponId */
export const asCouponId = (id: string): CouponId => id as unknown as CouponId;

// ============================================================================
// Types
// ============================================================================

/** Coupon discount type */
export type CouponType = 'percentage' | 'fixed_amount';

/** Alias for DiscountType used in repositories */
export type DiscountType = CouponType;

/** Coupon duration type */
export type CouponDuration = 'once' | 'repeating' | 'forever';

// ============================================================================
// Entities
// ============================================================================

/**
 * Coupon - Discount code
 */
export interface Coupon {
  readonly id: UUID;
  readonly code: string;
  readonly name: string;
  readonly type: CouponType;
  readonly discountAmount?: number;
  readonly discountPercent?: Percentage;
  readonly currency?: Currency;
  readonly duration: CouponDuration;
  readonly durationMonths?: number;
  readonly maxRedemptions?: number;
  readonly currentRedemptions: number;
  readonly validFrom: ISODateTime;
  readonly validUntil?: ISODateTime;
  readonly applicablePlanIds?: readonly UUID[];
  readonly status: EntityStatus;
  readonly createdAt: ISODateTime;
}

/**
 * CouponRedemption - Record of coupon usage
 */
export interface CouponRedemption {
  readonly id: UUID;
  readonly couponId: UUID;
  readonly tenantId: TenantId;
  readonly subscriptionId: UUID;
  readonly redeemedAt: ISODateTime;
  readonly expiresAt?: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new coupon
 */
export interface CreateCouponData {
  readonly code: string;
  readonly name: string;
  readonly type: CouponType;
  readonly discountAmount?: number;
  readonly discountPercent?: Percentage;
  readonly currency?: Currency;
  readonly duration: CouponDuration;
  readonly durationMonths?: number;
  readonly maxRedemptions?: number;
  readonly validFrom: ISODateTime;
  readonly validUntil?: ISODateTime;
  readonly applicablePlanIds?: readonly UUID[];
}

/**
 * Data for updating a coupon
 */
export interface UpdateCouponData {
  readonly name?: string;
  readonly maxRedemptions?: number;
  readonly validUntil?: ISODateTime;
  readonly applicablePlanIds?: readonly UUID[];
  readonly status?: EntityStatus;
}

/**
 * Data for redeeming a coupon
 */
export interface RedeemCouponData {
  readonly couponId: UUID;
  readonly tenantId: TenantId;
  readonly subscriptionId: UUID;
}
